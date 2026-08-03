package com.auctxi.core.service;

import com.auctxi.core.entity.Notification;
import com.auctxi.core.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    
    public Notification createNotification(String userId, String title, String message, String actionUrl) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .actionUrl(actionUrl)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        Notification saved = notificationRepository.save(notification);
        
        try {
            messagingTemplate.convertAndSend("/topic/user-notifications/" + userId, saved);
        } catch (Exception e) {
            log.warn("Failed to broadcast notification via STOMP: {}", e.getMessage());
        }
        
        return saved;
    }
    
    public List<Notification> getNotificationsByUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
