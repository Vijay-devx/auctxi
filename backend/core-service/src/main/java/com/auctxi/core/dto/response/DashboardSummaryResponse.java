package com.auctxi.core.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardSummaryResponse {
    
    private long totalTeams;
    private long totalPlayers;
    private long totalSoldPlayers;
    private long totalUnsoldPlayers;
    private long totalAvailablePlayers;
    
    private BigDecimal totalBudgetAvailable;
    private BigDecimal totalRevenue; // Sum of winning bids
    
    private List<BidResponse> recentActivities;
}
