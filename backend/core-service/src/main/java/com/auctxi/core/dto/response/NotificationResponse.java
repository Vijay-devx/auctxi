package com.auctxi.core.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    
    private String id;
    private String title;
    private String message;
    private boolean isRead;
    private String actionUrl;
    private LocalDateTime createdAt;
}
