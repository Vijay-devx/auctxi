package com.auctxi.core.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientContextResponse {
    private String userId;
    private String role;
    private AuctionContext auction;
    private PortfolioContext portfolio;
    private List<MyAuction> myAuctions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MyAuction {
        private String auctionId;
        private String name;
        private String status;
        private String teamName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuctionContext {
        private String auctionId;
        private String status;
        private Double registrationFee;
        private Double initialPurse;
        private PlayerOnBlock currentPlayerOnBlock;
        private List<PlayerOnBlock> unsoldPlayersPool;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerOnBlock {
        private String playerId;
        private String name;
        private String role;
        private Double basePrice;
        private Double currentHighestBid;
        private String highestBidderUserId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PortfolioContext {
        private Double totalBudget;
        private Double remainingPurse;
        private Integer totalSlots;
        private Integer remainingSlots;
        private Double availableBudgetPerSlot;
        private List<SquadPlayer> squad;
        private Map<String, Integer> squadComposition;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SquadPlayer {
        private String playerId;
        private String name;
        private String role;
        private Double purchasePrice;
    }
}
