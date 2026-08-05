using Microsoft.EntityFrameworkCore;
using NotificationService.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHostedService<NotificationService.Services.NotificationConsumerService>();

// Configure MySQL Database using Pomelo
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Database=auctxi_notifications;User=root;Password=manager;AllowPublicKeyRetrieval=True;";
builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// ASPNETCORE_URLS env var controls the port (set to http://+:8080 in Dockerfile for Docker).
// Falls back to port 5002 for local development without Docker.
if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ASPNETCORE_URLS")))
{
    builder.WebHost.UseUrls("http://localhost:5002");
}

// Configure Notification Services
builder.Services.AddScoped<NotificationService.Services.IInAppNotificationService, NotificationService.Services.InAppNotificationService>();

var useMockEmail = builder.Configuration.GetValue<bool>("UseMockEmail", true);
if (useMockEmail)
{
    builder.Services.AddScoped<NotificationService.Services.IEmailService, NotificationService.Services.MockEmailService>();
}
else
{
    builder.Services.AddScoped<NotificationService.Services.IEmailService, NotificationService.Services.SmtpEmailService>();
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthorization();
app.MapControllers();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
