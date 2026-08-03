package com.auctxi.core.service;

import com.auctxi.core.dto.request.BidRequest;
import com.auctxi.core.dto.response.BidResponse;
import com.auctxi.core.dto.response.PlayerResponse;

import java.util.List;

public interface BiddingService {
    
    BidResponse placeBid(String auctionId, String playerId, BidRequest request);
    
    List<BidResponse> getBidHistory(String auctionId, String playerId);
    
    PlayerResponse sellPlayer(String auctionId, String playerId);
    
    List<BidResponse> getAllBids();
}
