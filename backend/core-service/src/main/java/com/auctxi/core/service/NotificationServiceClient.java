package com.auctxi.core.service;

import com.auctxi.core.dto.request.PasswordResetNotificationRequest;
import com.auctxi.core.dto.request.PaymentNotificationRequest;
import com.auctxi.core.dto.request.RegistrationNotificationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class NotificationServiceClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public NotificationServiceClient(
            @Value("${notification-service.base-url:http://localhost:5002}") String baseUrl) {
        
        this.baseUrl = baseUrl;
        
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000); // 3 seconds
        factory.setReadTimeout(3000);    // 3 seconds
        
        this.restTemplate = new RestTemplate(factory);
    }

    public void sendRegistrationNotification(RegistrationNotificationRequest request) {
        String url = baseUrl + "/api/v1/notifications/registration";
        try {
            restTemplate.postForEntity(url, request, Object.class);
            log.info("Successfully dispatched registration notification request to .NET service for {}", request.getUserEmail());
        } catch (Exception e) {
            log.error("Failed to send registration notification to .NET service. Error: {}", e.getMessage());
        }
    }

    public void sendPaymentNotification(PaymentNotificationRequest request) {
        String url = baseUrl + "/api/v1/notifications/payment";
        try {
            restTemplate.postForEntity(url, request, Object.class);
            log.info("Successfully dispatched payment notification request to .NET service for {}", request.getUserEmail());
        } catch (Exception e) {
            log.error("Failed to send payment notification to .NET service. Error: {}", e.getMessage());
        }
    }

    public void sendPasswordResetNotification(PasswordResetNotificationRequest request) {
        String url = baseUrl + "/api/v1/notifications/password-reset";
        try {
            restTemplate.postForEntity(url, request, Object.class);
            log.info("Successfully dispatched password reset notification request to .NET service for {}", request.getUserEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset notification to .NET service. Error: {}", e.getMessage());
        }
    }
}
