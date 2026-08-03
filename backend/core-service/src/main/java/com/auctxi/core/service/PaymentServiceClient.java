package com.auctxi.core.service;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentServiceClient {

    private final RestTemplate restTemplate;

    // Route directly to PaymentService (port 5001) for internal server-to-server communication
    // to bypass the API Gateway's JWT token requirement.
    @Value("${auctxi.payment.url:http://localhost:5001/api/v1/payments}")
    private String paymentServiceUrl;

    public void deductAuctionFees(String clientId, String auctionId, BigDecimal registrationFee, BigDecimal initialPurse) {
        String url = paymentServiceUrl + "/wallet/" + clientId + "/pay-auction-fees/" + auctionId;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        PayAuctionFeesRequest request = new PayAuctionFeesRequest();
        request.setRegistrationFee(registrationFee != null ? registrationFee : BigDecimal.ZERO);
        request.setInitialPurse(initialPurse != null ? initialPurse : BigDecimal.ZERO);

        HttpEntity<PayAuctionFeesRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new IllegalStateException("Failed to deduct fees from wallet.");
            }
        } catch (HttpClientErrorException e) {
            String errorMsg = "Client does not have enough funds in their wallet.";
            try {
                // Try to parse actual error message from .NET
                String body = e.getResponseBodyAsString();
                if (body.contains("\"message\"")) {
                    errorMsg = body.split("\"message\"")[1].split("\"")[1];
                }
            } catch (Exception ignored) {}
            throw new IllegalStateException("Failed to deduct fees: " + errorMsg);
        } catch (Exception e) {
            throw new IllegalStateException("Error communicating with Payment Service: " + e.getMessage());
        }
    }

    public void settleAuction(String auctionId, String managerId, java.util.List<com.auctxi.core.dto.request.ClientSpendDto> clientSpends) {
        String url = paymentServiceUrl + "/internal/auction/" + auctionId + "/settle?managerId=" + managerId;
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<java.util.List<com.auctxi.core.dto.request.ClientSpendDto>> entity = new HttpEntity<>(clientSpends, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new IllegalStateException("Failed to settle auction with payment service.");
            }
        } catch (Exception e) {
            System.err.println("Error settling auction: " + e.getMessage());
            // We log but don't strictly throw to prevent the auction completion from failing completely
            // just because the payment service is unreachable. (Could be improved with a queue)
        }
    }

    @Data
    private static class PayAuctionFeesRequest {
        private BigDecimal registrationFee;
        private BigDecimal initialPurse;
    }
}
