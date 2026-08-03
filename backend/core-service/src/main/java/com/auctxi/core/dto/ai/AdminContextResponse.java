package com.auctxi.core.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminContextResponse {
    private String userId;
    private String role;
    private PlatformMetrics platformMetrics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlatformMetrics {
        private Integer totalActiveAuctions;
        private Integer totalRegisteredUsers;
        private Financials financials;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Financials {
        private Double totalTransactionsToday;
        private Integer failedPaymentsToday;
        private Double pendingPlatformCommission;
        private Integer settlementsPending;
    }
}
