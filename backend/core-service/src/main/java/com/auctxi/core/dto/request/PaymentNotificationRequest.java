package com.auctxi.core.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentNotificationRequest {
    private String userId;
    private String userEmail;
    private BigDecimal amount;
    private String paymentType;
    private String status;
}
