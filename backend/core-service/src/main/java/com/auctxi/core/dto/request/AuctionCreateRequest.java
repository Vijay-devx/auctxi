package com.auctxi.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuctionCreateRequest {

    @NotBlank(message = "Auction name is required")
    private String name;

    private LocalDateTime scheduledStartTime;

    private AuctionRulesRequest rules;

}
