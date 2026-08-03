package com.auctxi.core.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TeamUpdateRequest {

    private String name;

    private String shortName;

    private String logoUrl;

    private String ownerId;

    @Min(value = 0, message = "Total budget cannot be negative")
    private BigDecimal totalBudget;
}
