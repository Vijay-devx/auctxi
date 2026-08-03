package com.auctxi.core.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BidResponse {
    
    private String id;
    private String auctionId;
    private String auctionName;
    private String playerId;
    private String playerName;
    private TeamResponse team;
    private BigDecimal amount;
    private LocalDateTime createdAt;
}
