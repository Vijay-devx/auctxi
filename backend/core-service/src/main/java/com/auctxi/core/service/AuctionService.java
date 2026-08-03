package com.auctxi.core.service;

import com.auctxi.core.dto.request.AuctionCreateRequest;
import com.auctxi.core.dto.request.AuctionUpdateRequest;
import com.auctxi.core.dto.response.AuctionResponse;

import java.util.List;

public interface AuctionService {
    
    AuctionResponse createAuction(AuctionCreateRequest request);
    
    AuctionResponse updateAuction(String id, AuctionUpdateRequest request);

    void announceStart(String id);

    AuctionResponse startAuction(String id);

    AuctionResponse pauseAuction(String id);

    AuctionResponse resumeAuction(String id);

    AuctionResponse endAuction(String id);

    AuctionResponse setCurrentPlayer(String auctionId, String playerId);

    AuctionResponse nextPlayer(String id);

    AuctionResponse getAuctionById(String id);

    List<AuctionResponse> getAllAuctions();
}
