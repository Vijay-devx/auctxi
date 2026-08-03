package com.auctxi.core.dto.response;

import com.auctxi.core.entity.PlayerCategory;
import com.auctxi.core.entity.PlayerRole;
import com.auctxi.core.entity.PlayerStatistics;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PlayerResponse {

    private String id;
    private String name;
    private BigDecimal basePrice;
    private String imageUrl;
    private PlayerRole role;
    private PlayerCategory category;
    private Boolean isWicketKeeper;
    private String assignmentStatus;
    private PlayerStatistics statistics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
