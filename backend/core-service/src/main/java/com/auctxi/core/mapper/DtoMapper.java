package com.auctxi.core.mapper;

import com.auctxi.core.dto.response.*;
import com.auctxi.core.entity.Auction;
import com.auctxi.core.entity.Bid;
import com.auctxi.core.entity.Player;
import com.auctxi.core.entity.Team;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class DtoMapper {

    public UserSummaryResponse mapToUserSummaryResponse(com.auctxi.core.entity.User user) {
        if (user == null) return null;
        return UserSummaryResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public TeamSummaryResponse mapToTeamSummaryResponse(Team team) {
        if (team == null) return null;
        return TeamSummaryResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .shortName(team.getShortName())
                .logoUrl(team.getLogoUrl())
                .build();
    }

    public PlayerResponse mapToPlayerResponse(Player player) {
        if (player == null) return null;
        return PlayerResponse.builder()
                .id(player.getId())
                .name(player.getName())
                .basePrice(player.getBasePrice())
                .imageUrl(player.getImageUrl())
                .role(player.getRole())
                .category(player.getCategory())
                .isWicketKeeper(player.getIsWicketKeeper())
                .statistics(player.getStatistics())
                .createdAt(player.getCreatedAt())
                .updatedAt(player.getUpdatedAt())
                .build();
    }

    public TeamResponse mapToTeamResponse(Team team) {
        if (team == null) return null;
        return TeamResponse.builder()
                .id(team.getId())
                .auctionId(team.getAuction() != null ? team.getAuction().getId() : null)
                .auctionName(team.getAuction() != null ? team.getAuction().getName() : null)
                .name(team.getName())
                .shortName(team.getShortName())
                .logoUrl(team.getLogoUrl())
                .owner(mapToUserSummaryResponse(team.getOwnerClient()))
                .totalBudget(team.getTotalBudget())
                .remainingPurse(team.getRemainingPurse())
                .players(team.getAuctionPlayers() != null ? 
                         team.getAuctionPlayers().stream().map(ap -> mapToPlayerResponse(ap.getPlayer())).collect(Collectors.toList()) : null)
                .createdAt(team.getCreatedAt())
                .updatedAt(team.getUpdatedAt())
                .build();
    }

    public BidResponse mapToBidResponse(Bid bid) {
        if (bid == null) return null;
        return BidResponse.builder()
                .id(bid.getId())
                .auctionId(bid.getAuction().getId())
                .auctionName(bid.getAuction().getName())
                .playerId(bid.getPlayer().getId())
                .playerName(bid.getPlayer().getPlayer().getName())
                .team(mapToTeamResponse(bid.getTeam()))
                .amount(bid.getAmount())
                .createdAt(bid.getCreatedAt())
                .build();
    }

    public AuctionResponse mapToAuctionResponse(Auction auction) {
        if (auction == null) return null;
        PlayerResponse currentPlayerResponse = null;
        if (auction.getCurrentPlayer() != null) {
            currentPlayerResponse = mapToPlayerResponse(auction.getCurrentPlayer().getPlayer());
            currentPlayerResponse.setBasePrice(auction.getCurrentPlayer().getBasePrice());
        }

        return AuctionResponse.builder()
                .id(auction.getId())
                .name(auction.getName())
                .status(auction.getStatus())
                .scheduledStartTime(auction.getScheduledStartTime())
                .startTime(auction.getStartTime())
                .endTime(auction.getEndTime())
                .timerEndTime(auction.getTimerEndTime())
                .currentPlayer(currentPlayerResponse)
                .initialPurse(auction.getAuctionRules() != null ? auction.getAuctionRules().getInitialPurse() : null)
                .registrationFee(auction.getAuctionRules() != null ? auction.getAuctionRules().getRegistrationFee() : null)
                .createdAt(auction.getCreatedAt())
                .updatedAt(auction.getUpdatedAt())
                .build();
    }
}
