package com.auctxi.core.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BidMessage {
    private Long auctionId;
    private Long playerId;
    private Long teamId;
    private Double bidAmount;
    private String timestamp;
}
