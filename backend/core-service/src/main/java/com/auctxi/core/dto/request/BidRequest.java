package com.auctxi.core.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BidRequest {

    @NotBlank(message = "Team ID is required")
    private String teamId;

    @NotNull(message = "Bid amount is required")
    @Min(value = 1, message = "Bid amount must be at least 1")
    private BigDecimal amount;
}
