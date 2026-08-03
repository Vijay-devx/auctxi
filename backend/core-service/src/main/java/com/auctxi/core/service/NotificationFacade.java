package com.auctxi.core.service;

import com.auctxi.core.dto.request.PasswordResetNotificationRequest;
import com.auctxi.core.dto.request.PaymentNotificationRequest;
import com.auctxi.core.dto.request.RegistrationNotificationRequest;
import com.auctxi.core.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationFacade {

    private final NotificationServiceClient notificationServiceClient;

    public void sendRegistrationSuccess(User user) {
        RegistrationNotificationRequest request = RegistrationNotificationRequest.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .userName(user.getName())
                .build();
        
        notificationServiceClient.sendRegistrationNotification(request);
    }

    public void sendPaymentSuccess(String userId, String userEmail, BigDecimal amount, String paymentType) {
        PaymentNotificationRequest request = PaymentNotificationRequest.builder()
                .userId(userId)
                .userEmail(userEmail)
                .amount(amount)
                .paymentType(paymentType)
                .status("Success")
                .build();
        
        notificationServiceClient.sendPaymentNotification(request);
    }
    
    public void sendPaymentFailure(String userId, String userEmail, BigDecimal amount, String paymentType) {
        PaymentNotificationRequest request = PaymentNotificationRequest.builder()
                .userId(userId)
                .userEmail(userEmail)
                .amount(amount)
                .paymentType(paymentType)
                .status("Failed")
                .build();
        
        notificationServiceClient.sendPaymentNotification(request);
    }

    public void sendPasswordReset(User user, String resetToken) {
        PasswordResetNotificationRequest request = PasswordResetNotificationRequest.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .resetToken(resetToken)
                .build();
        
        notificationServiceClient.sendPasswordResetNotification(request);
    }
}
