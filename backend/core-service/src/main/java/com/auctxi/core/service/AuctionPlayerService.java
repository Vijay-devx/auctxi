package com.auctxi.core.service;

import com.auctxi.core.dto.response.PlayerResponse;

import java.util.List;

public interface AuctionPlayerService {
    List<PlayerResponse> getAvailablePlayersForAuction(String auctionId, String managerId);
    
    List<PlayerResponse> getAssignedPlayersForAuction(String auctionId, String managerId);
    void assignPlayersToAuction(String auctionId, List<String> playerIds, String managerId);
    void removePlayerFromAuction(String auctionId, String playerId, String managerId);
}
