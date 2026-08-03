package com.auctxi.core.dto.request;

import com.auctxi.core.entity.PlayerCategory;
import com.auctxi.core.entity.PlayerRole;
import com.auctxi.core.entity.PlayerStatistics;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PlayerUpdateRequest {

    private String name;

    @Min(value = 0, message = "Base price cannot be negative")
    private BigDecimal basePrice;

    private String imageUrl;

    private PlayerRole role;

    private PlayerCategory category;

    private Boolean isWicketKeeper;



    private PlayerStatistics statistics;
}
