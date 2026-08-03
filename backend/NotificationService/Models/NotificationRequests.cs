namespace NotificationService.Models;

public class RegistrationNotificationRequest
{
    public string? UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
}

public class PaymentNotificationRequest
{
    public string? UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string PaymentType { get; set; } = string.Empty; // RegistrationFee, EntryFee
    public string Status { get; set; } = string.Empty; // Success, Failed
}

public class ReminderNotificationRequest
{
    public string? UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string EventName { get; set; } = string.Empty;
    public DateTime EventTime { get; set; }
}

public class PasswordResetNotificationRequest
{
    public string? UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string ResetToken { get; set; } = string.Empty;
}
