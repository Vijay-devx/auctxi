using Microsoft.AspNetCore.Mvc;
using NotificationService.Models;
using NotificationService.Services;
using System.Text.Json;

namespace NotificationService.Controllers
{
    [ApiController]
    [Route("api/v1/notifications")]
    public class NotificationController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly IInAppNotificationService _inAppService;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(IEmailService emailService, IInAppNotificationService inAppService, ILogger<NotificationController> logger)
        {
            _emailService = emailService;
            _inAppService = inAppService;
            _logger = logger;
        }

        [HttpPost("registration")]
        public async Task<IActionResult> SendRegistrationNotification([FromBody] RegistrationNotificationRequest request)
        {
            var subject = "Welcome to Auctxi!";
            var body = $"Hello {request.UserName},<br><br>Thank you for registering on Auctxi. Your account has been created successfully.";
            var payload = JsonSerializer.Serialize(request);

            return await ProcessNotification(request.UserId, request.UserEmail, "REGISTRATION", subject, body, payload);
        }

        [HttpPost("payment")]
        public async Task<IActionResult> SendPaymentNotification([FromBody] PaymentNotificationRequest request)
        {
            var subject = $"Payment {request.Status}: {request.PaymentType}";
            var body = $"Your payment of {request.Amount:C} for {request.PaymentType} was {request.Status.ToLower()}.";
            var payload = JsonSerializer.Serialize(request);

            return await ProcessNotification(request.UserId, request.UserEmail, "PAYMENT", subject, body, payload);
        }

        [HttpPost("reminder")]
        public async Task<IActionResult> SendReminderNotification([FromBody] ReminderNotificationRequest request)
        {
            var subject = $"Reminder: {request.EventName}";
            var body = $"Don't forget, {request.EventName} is scheduled for {request.EventTime:g}.";
            var payload = JsonSerializer.Serialize(request);

            return await ProcessNotification(request.UserId, request.UserEmail, "REMINDER", subject, body, payload);
        }

        [HttpPost("password-reset")]
        public async Task<IActionResult> SendPasswordResetNotification([FromBody] PasswordResetNotificationRequest request)
        {
            var subject = "Auctxi Password Reset Request";
            var body = $"You have requested to reset your password. Your reset token is: <b>{request.ResetToken}</b><br>If you did not request this, please ignore this email.";
            var payload = JsonSerializer.Serialize(request);

            return await ProcessNotification(request.UserId, request.UserEmail, "PASSWORD_RESET", subject, body, payload);
        }

        private async Task<IActionResult> ProcessNotification(string? userId, string email, string type, string subject, string body, string payload)
        {
            _logger.LogInformation($"Processing {type} notification for {email}");

            // Send Email
            bool sent = await _emailService.SendEmailAsync(email, subject, body);
            var status = sent ? "SENT" : "FAILED";

            // Save In-App Notification (and potentially push via SignalR)
            var logEntry = await _inAppService.SaveNotificationAsync(userId, email, type, subject, payload, status);

            if (sent)
                return Ok(new { success = true, notificationId = logEntry.Id, message = "Notification dispatched successfully" });
            
            return StatusCode(500, new { success = false, message = "Failed to send email notification, but logged in-app" });
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserNotifications(string userId, [FromQuery] bool unreadOnly = false)
        {
            var notifications = await _inAppService.GetUserNotificationsAsync(userId, unreadOnly);
            return Ok(notifications);
        }

        [HttpPost("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(string notificationId)
        {
            await _inAppService.MarkAsReadAsync(notificationId);
            return Ok(new { success = true });
        }
    }
}
