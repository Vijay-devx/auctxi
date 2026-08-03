package com.auctxi.core.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuctionApplicationRequest {
    @NotBlank(message = "Proposed team name is required")
    private String proposedTeamName;

    @NotBlank(message = "Proposed short name is required")
    private String proposedShortName;

    private String logoUrl;
}
