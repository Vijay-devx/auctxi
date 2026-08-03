package com.auctxi.core.service;

import com.auctxi.core.dto.request.AuctionApplicationRequest;
import com.auctxi.core.dto.response.AuctionApplicationResponse;

import java.util.List;

public interface AuctionApplicationService {
    
    AuctionApplicationResponse applyForAuction(String auctionId, String userId, AuctionApplicationRequest request);
    
    AuctionApplicationResponse approveApplication(String applicationId, String managerId);
    
    AuctionApplicationResponse rejectApplication(String applicationId, String managerId);
    
    List<AuctionApplicationResponse> getApplicationsForAuction(String auctionId);
    
    List<AuctionApplicationResponse> getApplicationsByUser(String userId);
}
