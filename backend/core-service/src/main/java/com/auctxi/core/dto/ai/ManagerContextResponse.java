package com.auctxi.core.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerContextResponse {
    private String userId;
    private String role;
    private AuctionSummary auctionSummary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuctionSummary {
        private String auctionId;
        private String name;
        private String status;
        private Participants participants;
        private PlayerStats playerStats;
        private Financials financials;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Participants {
        private Integer totalRegisteredClients;
        private Integer pendingRegistrations;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerStats {
        private Integer totalPlayers;
        private Integer unsoldPlayers;
        private Integer soldPlayers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Financials {
        private Double totalRevenue;
        private Integer pendingSettlements;
        private Double platformCommissionDue;
    }
}
