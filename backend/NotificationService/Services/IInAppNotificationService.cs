using NotificationService.Models;

namespace NotificationService.Services;

public interface IInAppNotificationService
{
    Task<NotificationLog> SaveNotificationAsync(string? userId, string email, string type, string subject, string payload, string status);
    Task<IEnumerable<NotificationLog>> GetUserNotificationsAsync(string userId, bool unreadOnly = false);
    Task MarkAsReadAsync(string notificationId);
}
