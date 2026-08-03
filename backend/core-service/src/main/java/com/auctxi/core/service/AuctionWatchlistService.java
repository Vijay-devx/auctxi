package com.auctxi.core.service;

import com.auctxi.core.dto.response.AuctionResponse;
import java.util.List;

public interface AuctionWatchlistService {
    void addAuctionToWatchlist(String userId, String auctionId);
    void removeAuctionFromWatchlist(String userId, String auctionId);
    boolean isAuctionWatchlisted(String userId, String auctionId);
    List<AuctionResponse> getMyWatchlistedAuctions(String userId);
}
