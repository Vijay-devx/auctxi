package com.auctxi.core.service;

import com.auctxi.core.dto.response.PlayerResponse;

import java.util.List;

public interface WatchlistService {
    
    List<PlayerResponse> getMyWatchlist(String userId);
    
    void addPlayerToWatchlist(String userId, String playerId);
    
    void removePlayerFromWatchlist(String userId, String playerId);
    
    boolean isPlayerWatchlisted(String userId, String playerId);
}
