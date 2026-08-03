package com.auctxi.core.dto.response;

import com.auctxi.core.entity.InvitationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuctionInvitationResponse {
    private String id;
    private String auctionId;
    private String auctionName;
    private UserSummaryResponse invitedClient;
    private InvitationStatus status;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
