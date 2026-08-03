using Microsoft.Extensions.Logging;

namespace NotificationService.Services;

public class MockEmailService : IEmailService
{
    private readonly ILogger<MockEmailService> _logger;

    public MockEmailService(ILogger<MockEmailService> logger)
    {
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body)
    {
        _logger.LogInformation("=========================================");
        _logger.LogInformation("MOCK EMAIL DISPATCH");
        _logger.LogInformation($"TO: {to}");
        _logger.LogInformation($"SUBJECT: {subject}");
        _logger.LogInformation($"BODY: {body}");
        _logger.LogInformation("=========================================");
        
        await Task.Delay(500); // Simulate network delay
        return true;
    }
}
