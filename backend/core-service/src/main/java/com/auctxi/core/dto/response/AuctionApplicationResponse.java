package com.auctxi.core.dto.response;

import com.auctxi.core.entity.ApplicationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuctionApplicationResponse {
    private String id;
    private String auctionId;
    private String auctionName;
    private UserSummaryResponse applicant;
    private String proposedTeamName;
    private String proposedShortName;
    private ApplicationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
