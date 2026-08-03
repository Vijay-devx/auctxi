package com.auctxi.core.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionReportResponse {
    private String auctionId;
    private String auctionName;
    private LocalDateTime auctionDate;
    private List<TeamSummary> teams;
    private List<SoldPlayerSummary> soldPlayers;
    private List<BidHistorySummary> bidHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamSummary {
        private String teamId;
        private String teamName;
        private String shortName;
        private BigDecimal totalBudget;
        private BigDecimal remainingPurse;
        private BigDecimal moneySpent;
        private int playersBought;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SoldPlayerSummary {
        private String playerId;
        private String playerName;
        private String winningTeamName;
        private BigDecimal soldPrice;
        private LocalDateTime soldAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BidHistorySummary {
        private String bidId;
        private String playerName;
        private String teamName;
        private BigDecimal bidAmount;
        private LocalDateTime bidTime;
    }
}
