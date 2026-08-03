package com.auctxi.core.service.impl;

import com.auctxi.core.dto.request.BidRequest;
import com.auctxi.core.dto.response.BidResponse;
import com.auctxi.core.dto.response.PlayerResponse;
import com.auctxi.core.dto.response.TeamResponse;
import com.auctxi.core.dto.response.UserSummaryResponse;
import com.auctxi.core.entity.*;
import com.auctxi.core.exception.ResourceNotFoundException;
import com.auctxi.core.repository.AuctionRepository;
import com.auctxi.core.repository.BidRepository;
import com.auctxi.core.repository.PlayerRepository;
import com.auctxi.core.repository.AuctionPlayerRepository;
import com.auctxi.core.repository.TeamRepository;
import com.auctxi.core.service.BiddingService;
import com.auctxi.core.mapper.DtoMapper;
import com.auctxi.core.event.PlayerSoldEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementation of the Live Bidding Service.
 *
 * This service contains the most performance-critical and concurrent logic in the application.
 * It uses Pessimistic Database Locks to prevent race conditions during high-speed live bidding.
 */
@Service
@RequiredArgsConstructor
public class BiddingServiceImpl implements BiddingService {

    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final AuctionPlayerRepository auctionPlayerRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final DtoMapper mapper;
    private final SimpMessagingTemplate messagingTemplate;

    // Dynamic timers now pulled from AuctionRules
    // private static final int BID_TIMER_EXTENSION_SECONDS = 20;

    /**
     * Places a new bid on the player currently under the hammer.
     * Ensures thread-safety, purse capacity, and bid amount validity.
     */
    @Override
    @Transactional
    public BidResponse placeBid(String auctionId, String playerId, BidRequest request) {
        /*
         STEP 1: Concurrency Control
         We use a Pessimistic Write Lock (`findAuctionWithLockById`).
         If User A and User B place a bid at the exact same millisecond, the database
         will force User B's request to wait until User A's transaction completes.
         This completely prevents double-bidding and state corruption.
         */
        Auction auction = auctionRepository.findAuctionWithLockById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        /*
         STEP 2: State Validation
         */
        if (auction.getStatus() != AuctionStatus.ONGOING) {
            throw new IllegalStateException("Auction is not ONGOING");
        }

        if (auction.getCurrentPlayer() == null || !auction.getCurrentPlayer().getId().equals(playerId) && !auction.getCurrentPlayer().getPlayer().getId().equals(playerId)) {
            throw new IllegalStateException("This player is not currently under the hammer");
        }

        AuctionPlayer auctionPlayer = auction.getCurrentPlayer();
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + request.getTeamId()));

        /*
         STEP 3: Financial Validation
         */
        if (team.getRemainingPurse().compareTo(request.getAmount()) < 0) {
            throw new IllegalArgumentException("Team does not have enough remaining purse for this bid");
        }

        /*
         STEP 4: Bid Amount Validation
         */
        Optional<Bid> highestBidOpt = bidRepository.findTopByAuctionIdAndPlayerIdOrderByAmountDesc(auctionId, auctionPlayer.getId());
        BigDecimal amountToBeat = highestBidOpt.map(Bid::getAmount).orElse(auctionPlayer.getBasePrice());

        // If a bid already exists, the new bid must be strictly greater. 
        // If no bid exists, the first bid can be equal to the base price.
        if (highestBidOpt.isPresent() && request.getAmount().compareTo(amountToBeat) <= 0) {
            throw new IllegalArgumentException("Bid amount must be greater than current highest bid of " + amountToBeat);
        } else if (request.getAmount().compareTo(auctionPlayer.getBasePrice()) < 0) {
            throw new IllegalArgumentException("Bid amount cannot be less than the player's base price of " + auctionPlayer.getBasePrice());
        } else if (highestBidOpt.isPresent() && highestBidOpt.get().getTeam().getId().equals(request.getTeamId())) {
            throw new IllegalArgumentException("You are already the highest bidder.");
        }

        /*
         STEP 5: Save and Extend Timer
         */
        Bid bid = Bid.builder()
                .auction(auction)
                .player(auctionPlayer)
                .team(team)
                .amount(request.getAmount())
                .build();

        bid = bidRepository.save(bid);

        // Reset timer logic using dynamic rules
        int timerSeconds = (auction.getAuctionRules() != null && auction.getAuctionRules().getBidTimerSeconds() > 0) 
                           ? auction.getAuctionRules().getBidTimerSeconds() : 20;
        auction.setTimerEndTime(LocalDateTime.now().plusSeconds(timerSeconds));
        auctionRepository.save(auction);

        BidResponse response = mapper.mapToBidResponse(bid);
        
        // Broadcast the new bid
        messagingTemplate.convertAndSend("/topic/auction/" + auctionId + "/bids", response);

        return response;
    }

    @Override
    public List<BidResponse> getBidHistory(String auctionId, String playerId) {
        // playerId passed from frontend is Player.id, but Bid uses AuctionPlayer.id
        Optional<AuctionPlayer> auctionPlayerOpt = auctionPlayerRepository.findByAuctionIdAndPlayerId(auctionId, playerId);
        
        if (auctionPlayerOpt.isEmpty()) {
            return List.of();
        }
        
        return bidRepository.findByAuctionIdAndPlayerIdOrderByCreatedAtDesc(auctionId, auctionPlayerOpt.get().getId())
                .stream()
                .map(mapper::mapToBidResponse)
                .collect(Collectors.toList());
    }

    /**
     * Finalizes the hammer falling. 
     * Determines if the player is SOLD or UNSOLD, deducts funds, and clears the auction podium.
     */
    @Override
    @Transactional
    public PlayerResponse sellPlayer(String auctionId, String playerId) {
        /*
         STEP 1: Lock the Auction
         Prevents any last-millisecond bids from sneaking in while we are executing the sale.
         */
        Auction auction = auctionRepository.findAuctionWithLockById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        if (auction.getCurrentPlayer() == null || !auction.getCurrentPlayer().getId().equals(playerId) && !auction.getCurrentPlayer().getPlayer().getId().equals(playerId)) {
            throw new IllegalStateException("Player is not currently under the hammer");
        }

        AuctionPlayer auctionPlayer = auction.getCurrentPlayer();
        
        /*
         STEP 2: Determine Winner
         */
        Optional<Bid> winningBidOpt = bidRepository.findTopByAuctionIdAndPlayerIdOrderByAmountDesc(auctionId, auctionPlayer.getId());

        if (winningBidOpt.isEmpty()) {
            /*
             STEP 3A: Unsold Scenario
             */
            auctionPlayer.setSoldStatus(PlayerStatus.UNSOLD);
        } else {
            /*
             STEP 3B: Sold Scenario
             */
            Bid winningBid = winningBidOpt.get();
            Team winningTeam = winningBid.getTeam();

            if (winningTeam.getRemainingPurse().compareTo(winningBid.getAmount()) < 0) {
                // Failsafe in case of extremely weird state, though lock prevents this
                throw new IllegalStateException("Winning team does not have enough purse. Critical Error.");
            }

            // Deduct purse
            winningTeam.setRemainingPurse(winningTeam.getRemainingPurse().subtract(winningBid.getAmount()));
            teamRepository.save(winningTeam);

            // Update auction player
            auctionPlayer.setSoldStatus(PlayerStatus.SOLD);
            auctionPlayer.setWinningTeam(winningTeam);
            auctionPlayer.setSoldPrice(winningBid.getAmount());
            
            // Fire event asynchronously for notifications/websockets
            eventPublisher.publishEvent(new PlayerSoldEvent(this, auctionPlayer.getPlayer(), winningTeam, winningBid.getAmount()));
        }

        /*
         STEP 4: Clean up and Save
         */
        auctionPlayerRepository.save(auctionPlayer);

        // Clear current player from auction podium
        auction.setCurrentPlayer(null);
        auction.setTimerEndTime(null);
        auctionRepository.save(auction);

        PlayerResponse response = mapper.mapToPlayerResponse(auctionPlayer.getPlayer());
        
        // Broadcast state change (hammer fell)
        messagingTemplate.convertAndSend("/topic/auction/" + auctionId + "/state", "SOLD");

        return response;
    }

    @Override
    public List<BidResponse> getAllBids() {
        return bidRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .limit(20)
                .map(mapper::mapToBidResponse)
                .collect(Collectors.toList());
    }
}


