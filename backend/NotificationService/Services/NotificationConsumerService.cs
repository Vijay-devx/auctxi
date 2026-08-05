using System.Text;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using NotificationService.Data;
using NotificationService.Models;

namespace NotificationService.Services;

public class NotificationConsumerService : BackgroundService
{
    private readonly ILogger<NotificationConsumerService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private IConnection? _connection;
    private IChannel? _channel;
    
    private const string QueueName = "notification.queue";
    private const string ExchangeName = "auctxi.exchange";
    private const string RoutingKey = "notification.routing.key";

    public NotificationConsumerService(ILogger<NotificationConsumerService> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    public override async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Connecting to RabbitMQ...");
        try
        {
            var rabbitUrl = Environment.GetEnvironmentVariable("RABBITMQ_URL");
            var factory = new ConnectionFactory();
            if (!string.IsNullOrEmpty(rabbitUrl))
            {
                factory.Uri = new Uri(rabbitUrl);
            }
            else
            {
                factory.HostName = Environment.GetEnvironmentVariable("RABBITMQ_HOST") ?? "localhost";
                factory.Port = int.TryParse(Environment.GetEnvironmentVariable("RABBITMQ_PORT"), out var p) ? p : 5672;
            }
            _connection = await factory.CreateConnectionAsync();
            _channel = await _connection.CreateChannelAsync();

            await _channel.ExchangeDeclareAsync(exchange: ExchangeName, type: ExchangeType.Topic, durable: true);
            await _channel.QueueDeclareAsync(queue: QueueName, durable: true, exclusive: false, autoDelete: false, arguments: null);
            await _channel.QueueBindAsync(queue: QueueName, exchange: ExchangeName, routingKey: RoutingKey);

            _logger.LogInformation("Connected to RabbitMQ successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to RabbitMQ");
        }
        
        await base.StartAsync(cancellationToken);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (_channel == null) return;
        
        stoppingToken.ThrowIfCancellationRequested();

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.ReceivedAsync += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            
            _logger.LogInformation($"[x] Received from RabbitMQ: {message}");

            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var request = JsonSerializer.Deserialize<NotificationRequest>(message, options);
                
                if (request != null)
                {
                    await ProcessNotificationAsync(request);
                }
                
                // Acknowledge the message
                await _channel.BasicAckAsync(deliveryTag: ea.DeliveryTag, multiple: false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing notification message.");
                // Optionally Nack to requeue:
                // await _channel.BasicNackAsync(ea.DeliveryTag, false, true);
            }
        };

        await _channel.BasicConsumeAsync(queue: QueueName, autoAck: false, consumer: consumer);
    }

    private async Task ProcessNotificationAsync(NotificationRequest request)
    {
        // Use a scope to resolve Scoped services like the DbContext
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();

        _logger.LogInformation($"Processing simulated email to {request.RecipientEmail}");
        
        var logEntry = new NotificationLog
        {
            RecipientEmail = request.RecipientEmail,
            NotificationType = request.NotificationType,
            Subject = request.Subject,
            Payload = request.Payload?.ToString() ?? "",
            SentAt = DateTime.UtcNow,
            Status = "SENT"
        };
        
        dbContext.NotificationLogs.Add(logEntry);
        await dbContext.SaveChangesAsync();
        
        _logger.LogInformation("Notification logged to database successfully.");
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        if (_channel != null)
        {
            await _channel.CloseAsync();
        }
        if (_connection != null)
        {
            await _connection.CloseAsync();
        }
        await base.StopAsync(cancellationToken);
    }
}

public class NotificationRequest
{
    public string RecipientEmail { get; set; } = string.Empty;
    public string NotificationType { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public object? Payload { get; set; }
}
