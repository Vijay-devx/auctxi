package com.auctxi.core.service.impl;

import com.auctxi.core.dto.response.BidResponse;
import com.auctxi.core.dto.response.DashboardSummaryResponse;
import com.auctxi.core.dto.response.TeamResponse;
import com.auctxi.core.dto.response.UserSummaryResponse;
import com.auctxi.core.entity.Bid;
import com.auctxi.core.entity.PlayerStatus;
import com.auctxi.core.entity.Team;
import com.auctxi.core.repository.BidRepository;
import com.auctxi.core.repository.PlayerRepository;
import com.auctxi.core.repository.TeamRepository;
import com.auctxi.core.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final BidRepository bidRepository;

    @Override
    public DashboardSummaryResponse getSummary() {
        long totalTeams = teamRepository.count();
        long totalPlayers = playerRepository.count();
        long totalSold = 0;
        long totalUnsold = 0;
        long totalAvailable = 0;

        List<Team> teams = teamRepository.findAll();
        
        BigDecimal totalBudget = teams.stream()
                .map(Team::getTotalBudget)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remainingPurse = teams.stream()
                .map(Team::getRemainingPurse)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRevenue = totalBudget.subtract(remainingPurse);

        List<BidResponse> recentBids = bidRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapBidToResponse)
                .collect(Collectors.toList());

        return DashboardSummaryResponse.builder()
                .totalTeams(totalTeams)
                .totalPlayers(totalPlayers)
                .totalSoldPlayers(totalSold)
                .totalUnsoldPlayers(totalUnsold)
                .totalAvailablePlayers(totalAvailable)
                .totalBudgetAvailable(remainingPurse) // Current liquidity across all teams
                .totalRevenue(totalRevenue) // Total money spent
                .recentActivities(recentBids)
                .build();
    }

    private BidResponse mapBidToResponse(Bid bid) {
        Team team = bid.getTeam();
        
        UserSummaryResponse ownerSummary = team.getOwnerClient() == null ? null : UserSummaryResponse.builder()
                .id(team.getOwnerClient().getId())
                .name(team.getOwnerClient().getName())
                .email(team.getOwnerClient().getEmail())
                .role(team.getOwnerClient().getRole())
                .build();

        TeamResponse teamResponse = TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .shortName(team.getShortName())
                .logoUrl(team.getLogoUrl())
                .owner(ownerSummary)
                .totalBudget(team.getTotalBudget())
                .remainingPurse(team.getRemainingPurse())
                .build();

        return BidResponse.builder()
                .id(bid.getId())
                .auctionId(bid.getAuction().getId())
                .playerId(bid.getPlayer().getId())
                .playerName(bid.getPlayer().getPlayer().getName())
                .team(teamResponse)
                .amount(bid.getAmount())
                .createdAt(bid.getCreatedAt())
                .build();
    }
}
