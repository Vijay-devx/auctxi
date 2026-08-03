package com.auctxi.core.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TeamCreateRequest {

    @NotBlank(message = "Team name is required")
    private String name;

    @NotBlank(message = "Team short name is required")
    private String shortName;

    private String logoUrl;

    @NotBlank(message = "Owner ID is required")
    private String ownerId;

    @NotNull(message = "Total budget is required")
    @Min(value = 0, message = "Total budget cannot be negative")
    private BigDecimal totalBudget;
}
