package com.auctxi.core.dto.request;

import com.auctxi.core.entity.PlayerCategory;
import com.auctxi.core.entity.PlayerRole;
import com.auctxi.core.entity.PlayerStatistics;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PlayerCreateRequest {

    @NotBlank(message = "Player name is required")
    private String name;

    @NotNull(message = "Base price is required")
    @Min(value = 0, message = "Base price cannot be negative")
    private BigDecimal basePrice;

    private String imageUrl;

    @NotNull(message = "Player role is required")
    private PlayerRole role;

    @NotNull(message = "Player category is required")
    private PlayerCategory category;

    private Boolean isWicketKeeper;

    private PlayerStatistics statistics;
}
