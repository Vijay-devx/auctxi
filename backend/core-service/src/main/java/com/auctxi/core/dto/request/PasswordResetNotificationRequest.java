package com.auctxi.core.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetNotificationRequest {
    private String userId;
    private String userEmail;
    private String resetToken;
}
