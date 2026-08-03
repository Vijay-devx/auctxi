namespace NotificationService.Models
{
    public class NotificationLog
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string? UserId { get; set; }
        public string RecipientEmail { get; set; } = string.Empty;
        public string NotificationType { get; set; } = string.Empty; // e.g. REGISTRATION, PAYMENT, REMINDER
        public string Subject { get; set; } = string.Empty;
        public string Payload { get; set; } = string.Empty; // JSON string of parameters or body
        public string Status { get; set; } = "PENDING"; // PENDING, SENT, FAILED
        public bool IsRead { get; set; } = false; // For in-app notifications
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
