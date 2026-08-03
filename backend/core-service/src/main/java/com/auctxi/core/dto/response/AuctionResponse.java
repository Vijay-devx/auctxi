package com.auctxi.core.dto.response;

import com.auctxi.core.entity.AuctionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuctionResponse {
    
    private String id;
    private String name;
    private AuctionStatus status;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime timerEndTime;
    private PlayerResponse currentPlayer;
    private java.math.BigDecimal initialPurse;
    private java.math.BigDecimal registrationFee;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
