package com.auctxi.core.service.ai;

import com.auctxi.core.dto.ai.AdminContextResponse;
import com.auctxi.core.dto.ai.ClientContextResponse;
import com.auctxi.core.dto.ai.ManagerContextResponse;
import com.auctxi.core.entity.Auction;
import com.auctxi.core.entity.AuctionPlayer;
import com.auctxi.core.entity.Team;
import com.auctxi.core.entity.User;
import com.auctxi.core.exception.ResourceNotFoundException;
import com.auctxi.core.repository.AuctionApplicationRepository;
import com.auctxi.core.repository.AuctionPlayerRepository;
import com.auctxi.core.repository.AuctionRepository;
import com.auctxi.core.repository.TeamRepository;
import com.auctxi.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIContextServiceImpl implements AIContextService {

    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final TeamRepository teamRepository;
    private final AuctionPlayerRepository auctionPlayerRepository;
    private final AuctionApplicationRepository auctionApplicationRepository;

    @Override
    @Transactional(readOnly = true)
    public ClientContextResponse getClientContext(String userId, String auctionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));

        ClientContextResponse.AuctionContext auctionContext = null;
        ClientContextResponse.PortfolioContext portfolioContext = null;

        if (auctionId != null && !auctionId.equals("null") && !auctionId.isEmpty()) {
            Auction auction = auctionRepository.findById(auctionId).orElse(null);
            if (auction != null) {
                auctionContext = buildAuctionContext(auction);
                Team team = teamRepository.findByOwnerClientIdAndAuctionId(userId, auctionId).orElse(null);
                if (team != null) {
                    portfolioContext = buildPortfolioContext(team);
                }
            }
        }

        List<Team> userTeams = teamRepository.findByOwnerClientId(userId);
        List<ClientContextResponse.MyAuction> myAuctions = userTeams.stream()
                .filter(t -> t.getAuction() != null)
                .map(t -> ClientContextResponse.MyAuction.builder()
                        .auctionId(t.getAuction().getId())
                        .name(t.getAuction().getName())
                        .status(t.getAuction().getStatus().name())
                        .teamName(t.getName())
                        .build())
                .collect(Collectors.toList());

        return ClientContextResponse.builder()
                .userId(userId)
                .role(user.getRole().name())
                .auction(auctionContext)
                .portfolio(portfolioContext)
                .myAuctions(myAuctions)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ManagerContextResponse getManagerContext(String userId, String auctionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id " + auctionId));

        int totalRegisteredClients = auctionApplicationRepository.findByAuctionId(auctionId).size();
        // Assuming we count all applications as registered for this basic implementation.

        List<AuctionPlayer> players = auctionPlayerRepository.findByAuctionId(auctionId);
        int totalPlayers = players.size();
        int soldPlayers = (int) players.stream().filter(p -> p.getSoldStatus() == com.auctxi.core.entity.PlayerStatus.SOLD).count();
        int unsoldPlayers = totalPlayers - soldPlayers;

        ManagerContextResponse.AuctionSummary summary = ManagerContextResponse.AuctionSummary.builder()
                .auctionId(auctionId)
                .name(auction.getName())
                .status(auction.getStatus().name())
                .participants(ManagerContextResponse.Participants.builder()
                        .totalRegisteredClients(totalRegisteredClients)
                        .pendingRegistrations(0)
                        .build())
                .playerStats(ManagerContextResponse.PlayerStats.builder()
                        .totalPlayers(totalPlayers)
                        .unsoldPlayers(unsoldPlayers)
                        .soldPlayers(soldPlayers)
                        .build())
                .financials(ManagerContextResponse.Financials.builder()
                        .totalRevenue(0.0) // Mocked for now
                        .pendingSettlements(0)
                        .platformCommissionDue(0.0)
                        .build())
                .build();

        return ManagerContextResponse.builder()
                .userId(userId)
                .role(user.getRole().name())
                .auctionSummary(summary)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminContextResponse getAdminContext(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));

        long totalAuctions = auctionRepository.count();
        long totalUsers = userRepository.count();

        AdminContextResponse.PlatformMetrics metrics = AdminContextResponse.PlatformMetrics.builder()
                .totalActiveAuctions((int) totalAuctions)
                .totalRegisteredUsers((int) totalUsers)
                .financials(AdminContextResponse.Financials.builder()
                        .totalTransactionsToday(0.0)
                        .failedPaymentsToday(0)
                        .pendingPlatformCommission(0.0)
                        .settlementsPending(0)
                        .build())
                .build();

        return AdminContextResponse.builder()
                .userId(userId)
                .role(user.getRole().name())
                .platformMetrics(metrics)
                .build();
    }

    private ClientContextResponse.AuctionContext buildAuctionContext(Auction auction) {
        ClientContextResponse.PlayerOnBlock playerOnBlock = null;

        if (auction.getCurrentPlayer() != null) {
            AuctionPlayer current = auction.getCurrentPlayer();
            playerOnBlock = ClientContextResponse.PlayerOnBlock.builder()
                    .playerId(current.getPlayer().getId())
                    .name(current.getPlayer().getName())
                    .role(current.getPlayer().getRole().name())
                    .basePrice(current.getBasePrice() != null ? current.getBasePrice().doubleValue() : 0.0)
                    .currentHighestBid(current.getCurrentBid() != null ? current.getCurrentBid().doubleValue() : 0.0)
                    .highestBidderUserId(current.getWinningTeam() != null ? current.getWinningTeam().getOwnerClient().getId() : null)
                    .build();
        }

        List<AuctionPlayer> allPlayers = auctionPlayerRepository.findByAuctionId(auction.getId());
        List<ClientContextResponse.PlayerOnBlock> unsoldPool = allPlayers.stream()
                .filter(ap -> ap.getSoldStatus() != com.auctxi.core.entity.PlayerStatus.SOLD)
                .map(ap -> ClientContextResponse.PlayerOnBlock.builder()
                        .playerId(ap.getPlayer().getId())
                        .name(ap.getPlayer().getName())
                        .role(ap.getPlayer().getRole().name())
                        .basePrice(ap.getBasePrice() != null ? ap.getBasePrice().doubleValue() : 0.0)
                        .currentHighestBid(ap.getCurrentBid() != null ? ap.getCurrentBid().doubleValue() : 0.0)
                        .highestBidderUserId(ap.getWinningTeam() != null ? ap.getWinningTeam().getOwnerClient().getId() : null)
                        .build())
                .collect(Collectors.toList());

        return ClientContextResponse.AuctionContext.builder()
                .auctionId(auction.getId())
                .status(auction.getStatus().name())
                .registrationFee(auction.getAuctionRules() != null && auction.getAuctionRules().getRegistrationFee() != null ? auction.getAuctionRules().getRegistrationFee().doubleValue() : 0.0)
                .initialPurse(auction.getAuctionRules() != null && auction.getAuctionRules().getInitialPurse() != null ? auction.getAuctionRules().getInitialPurse().doubleValue() : 0.0)
                .currentPlayerOnBlock(playerOnBlock)
                .unsoldPlayersPool(unsoldPool)
                .build();
    }

    private ClientContextResponse.PortfolioContext buildPortfolioContext(Team team) {
        List<ClientContextResponse.SquadPlayer> squadPlayers = team.getAuctionPlayers().stream()
                .filter(ap -> ap.getSoldStatus() == com.auctxi.core.entity.PlayerStatus.SOLD)
                .map(ap -> ClientContextResponse.SquadPlayer.builder()
                        .playerId(ap.getPlayer().getId())
                        .name(ap.getPlayer().getName())
                        .role(ap.getPlayer().getRole().name())
                        .purchasePrice(ap.getSoldPrice() != null ? ap.getSoldPrice().doubleValue() : 0.0)
                        .build())
                .collect(Collectors.toList());

        Map<String, Integer> composition = new HashMap<>();
        squadPlayers.forEach(sp -> {
            composition.put(sp.getRole(), composition.getOrDefault(sp.getRole(), 0) + 1);
        });

        int totalSlots = team.getAuction() != null && team.getAuction().getAuctionRules() != null 
                ? team.getAuction().getAuctionRules().getMaxSquadSize() : 15;
        int remainingSlots = totalSlots - squadPlayers.size();

        double remainingPurse = team.getRemainingPurse() != null ? team.getRemainingPurse().doubleValue() : 0.0;
        double availableBudgetPerSlot = remainingSlots > 0 ? remainingPurse / remainingSlots : 0.0;

        return ClientContextResponse.PortfolioContext.builder()
                .totalBudget(team.getTotalBudget() != null ? team.getTotalBudget().doubleValue() : 0.0)
                .remainingPurse(remainingPurse)
                .totalSlots(totalSlots)
                .remainingSlots(remainingSlots)
                .availableBudgetPerSlot(availableBudgetPerSlot)
                .squad(squadPlayers)
                .squadComposition(composition)
                .build();
    }
}
