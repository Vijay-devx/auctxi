using Microsoft.EntityFrameworkCore;
using NotificationService.Data;
using NotificationService.Models;

namespace NotificationService.Services;

public class InAppNotificationService : IInAppNotificationService
{
    private readonly NotificationDbContext _context;

    public InAppNotificationService(NotificationDbContext context)
    {
        _context = context;
    }

    public async Task<NotificationLog> SaveNotificationAsync(string? userId, string email, string type, string subject, string payload, string status)
    {
        var logEntry = new NotificationLog
        {
            UserId = userId,
            RecipientEmail = email,
            NotificationType = type,
            Subject = subject,
            Payload = payload,
            Status = status,
            SentAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.NotificationLogs.Add(logEntry);
        await _context.SaveChangesAsync();
        
        // Note: If using SignalR for real-time WebSocket pushes, we would inject IHubContext<NotificationHub> 
        // and call Clients.User(userId).SendAsync("ReceiveNotification", logEntry) here.

        return logEntry;
    }

    public async Task<IEnumerable<NotificationLog>> GetUserNotificationsAsync(string userId, bool unreadOnly = false)
    {
        var query = _context.NotificationLogs.Where(n => n.UserId == userId);
        
        if (unreadOnly)
        {
            query = query.Where(n => !n.IsRead);
        }

        return await query.OrderByDescending(n => n.SentAt).ToListAsync();
    }

    public async Task MarkAsReadAsync(string notificationId)
    {
        var notification = await _context.NotificationLogs.FindAsync(notificationId);
        if (notification != null)
        {
            notification.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }
}
