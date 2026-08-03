package com.auctxi.core.service.impl;

import com.auctxi.core.dto.response.PlayerResponse;
import com.auctxi.core.entity.Auction;
import com.auctxi.core.entity.AuctionPlayer;
import com.auctxi.core.entity.AuctionStatus;
import com.auctxi.core.entity.Player;
import com.auctxi.core.entity.PlayerStatus;
import com.auctxi.core.exception.ResourceNotFoundException;
import com.auctxi.core.mapper.DtoMapper;
import com.auctxi.core.repository.AuctionPlayerRepository;
import com.auctxi.core.repository.AuctionRepository;
import com.auctxi.core.repository.PlayerRepository;
import com.auctxi.core.service.AuctionPlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionPlayerServiceImpl implements AuctionPlayerService {

    private final AuctionPlayerRepository auctionPlayerRepository;
    private final PlayerRepository playerRepository;
    private final AuctionRepository auctionRepository;
    private final DtoMapper mapper;

    @Override
    public List<PlayerResponse> getAvailablePlayersForAuction(String auctionId, String managerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found"));

        // We are assuming the user is authorized to manage this auction if they can access this endpoint.
        // In a real system, we might check if the manager is a participant or owner.

        // Get all players owned by manager
        List<Player> allManagerPlayers = playerRepository.findByCreatedByUserId(managerId);

        // Filter players who are NOT in any active auction AND are not already in this specific auction
        List<Player> availablePlayers = allManagerPlayers.stream()
                .filter(player -> {
                    // Check if player is already in THIS auction (handles COMPLETED auctions as well)
                    boolean isInThisAuction = auctionPlayerRepository.existsByAuctionIdAndPlayerId(auctionId, player.getId());
                    if (isInThisAuction) return false;

                    // Otherwise, check if they are in ANY OTHER ACTIVE auction
                    boolean isInActiveAuction = auctionPlayerRepository.findByPlayerId(player.getId()).stream()
                            .anyMatch(ap -> ap.getAuction().getStatus() != AuctionStatus.COMPLETED);
                    return !isInActiveAuction;
                })
                .collect(Collectors.toList());

        return availablePlayers.stream()
                .map(player -> {
                    PlayerResponse response = mapper.mapToPlayerResponse(player);
                    response.setAssignmentStatus("Available");
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<PlayerResponse> getAssignedPlayersForAuction(String auctionId, String managerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found"));

        List<AuctionPlayer> auctionPlayers = auctionPlayerRepository.findByAuctionId(auctionId);
        
        return auctionPlayers.stream()
                .map(ap -> {
                    PlayerResponse response = mapper.mapToPlayerResponse(ap.getPlayer());
                    response.setAssignmentStatus("Assigned");
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void assignPlayersToAuction(String auctionId, List<String> playerIds, String managerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found"));

        // We are assuming the user is authorized to manage this auction if they can access this endpoint.

        if (auction.getStatus() == AuctionStatus.COMPLETED) {
            throw new IllegalStateException("Players cannot be assigned to COMPLETED auctions");
        }

        // Determine current max auction order if we want to order them
        int maxOrder = auctionPlayerRepository.findByAuctionId(auctionId).stream()
                .mapToInt(ap -> ap.getAuctionOrder() != null ? ap.getAuctionOrder() : 0)
                .max()
                .orElse(0);

        for (String playerId : playerIds) {
            Player player = playerRepository.findById(playerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Player not found: " + playerId));

            if (!player.getCreatedByUser().getId().equals(managerId)) {
                throw new org.springframework.security.access.AccessDeniedException("Cannot assign player not owned by you");
            }

            boolean isInActiveAuction = auctionPlayerRepository.findByPlayerId(playerId).stream()
                    .anyMatch(ap -> ap.getAuction().getStatus() != AuctionStatus.COMPLETED);

            if (isInActiveAuction) {
                throw new IllegalStateException("Player " + player.getName() + " is already in an active auction");
            }

            if (!auctionPlayerRepository.existsByAuctionIdAndPlayerId(auctionId, playerId)) {
                maxOrder++;
                AuctionPlayer ap = AuctionPlayer.builder()
                        .auction(auction)
                        .player(player)
                        .basePrice(player.getBasePrice())
                        .soldStatus(PlayerStatus.AVAILABLE)
                        .auctionOrder(maxOrder)
                        .build();
                auctionPlayerRepository.save(ap);
            }
        }
    }

    @Override
    @Transactional
    public void removePlayerFromAuction(String auctionId, String playerId, String managerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found"));

        if (auction.getStatus() == AuctionStatus.COMPLETED) {
            throw new IllegalStateException("Players cannot be removed from COMPLETED auctions");
        }

        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found: " + playerId));

        if (!player.getCreatedByUser().getId().equals(managerId)) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot remove player not owned by you");
        }

        AuctionPlayer ap = auctionPlayerRepository.findByAuctionId(auctionId).stream()
                .filter(p -> p.getPlayer().getId().equals(playerId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Player is not in this auction"));

        auctionPlayerRepository.delete(ap);
    }
}
