package com.auctxi.core.service;

import com.auctxi.core.dto.request.AuctionApplicationRequest;
import com.auctxi.core.dto.response.AuctionInvitationResponse;

import java.util.List;

public interface AuctionInvitationService {
    
    AuctionInvitationResponse inviteClient(String auctionId, String clientId, String managerId);
    
    AuctionInvitationResponse acceptInvitation(String invitationId, String clientId, AuctionApplicationRequest request);
    
    AuctionInvitationResponse declineInvitation(String invitationId, String clientId);
    
    List<AuctionInvitationResponse> getInvitationsForAuction(String auctionId, String managerId);
    
    List<AuctionInvitationResponse> getInvitationsForClient(String clientId);
}
