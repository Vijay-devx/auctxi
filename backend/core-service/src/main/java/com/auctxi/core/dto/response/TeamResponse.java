package com.auctxi.core.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TeamResponse {
    
    private String id;
    private String auctionId;
    private String auctionName;
    private String name;
    private String shortName;
    private String logoUrl;
    private UserSummaryResponse owner;
    private BigDecimal totalBudget;
    private BigDecimal remainingPurse;
    private List<PlayerResponse> players;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
