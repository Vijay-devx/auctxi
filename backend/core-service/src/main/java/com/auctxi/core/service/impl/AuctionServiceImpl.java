package com.auctxi.core.service.impl;

import com.auctxi.core.dto.request.AuctionCreateRequest;
import com.auctxi.core.dto.request.AuctionUpdateRequest;
import com.auctxi.core.dto.response.AuctionResponse;
import com.auctxi.core.dto.response.PlayerResponse;
import com.auctxi.core.entity.Auction;
import com.auctxi.core.entity.AuctionPlayer;
import com.auctxi.core.entity.AuctionStatus;
import com.auctxi.core.entity.Player;
import com.auctxi.core.entity.PlayerStatus;
import com.auctxi.core.exception.ResourceNotFoundException;
import com.auctxi.core.repository.AuctionRepository;
import com.auctxi.core.repository.PlayerRepository;
import com.auctxi.core.repository.TeamRepository;
import com.auctxi.core.service.AuctionService;
import com.auctxi.core.service.NotificationService;
import com.auctxi.core.service.PaymentServiceClient;
import com.auctxi.core.dto.request.ClientSpendDto;
import com.auctxi.core.mapper.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the Auction Service.
 *
 * Manages the state machine of the auction (Upcoming, Ongoing, Paused, Completed).
 * Contains the crucial logic for instantiating the 'AuctionRules' snapshot during
 * creation.
 */
@Service
@RequiredArgsConstructor
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;
    private final PlayerRepository playerRepository;
    private final com.auctxi.core.repository.AuctionPlayerRepository auctionPlayerRepository;
    private final TeamRepository teamRepository;
    private final NotificationService notificationService;
    private final PaymentServiceClient paymentServiceClient;
    private final DtoMapper mapper;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Updates an auction. Crucially, the rules can ONLY be modified before
     * the auction starts. Once it is ONGOING, changing rules is illegal.
     */
    @Override
    @Transactional
    public AuctionResponse updateAuction(String id, AuctionUpdateRequest request) {
        Auction auction = getAuctionEntity(id);
        
        /*
         STEP 1: Validate State
         Prevent mid-game rule changes to ensure fairness.
         */
        if (auction.getStatus() != AuctionStatus.UPCOMING) {
            throw new IllegalStateException("Rules and settings can only be updated when the auction is UPCOMING.");
        }
        
        if (request.getName() != null) {
            auction.setName(request.getName());
        }
        
        /*
         STEP 2: Update Snapshot
         */
        if (request.getRules() != null && auction.getAuctionRules() != null) {
            com.auctxi.core.entity.AuctionRules rules = auction.getAuctionRules();
            
            rules.setMaxSquadSize(request.getRules().getMaxSquadSize());
            rules.setMinSquadSize(request.getRules().getMinSquadSize());
            rules.setMaxOverseasPlayers(request.getRules().getMaxOverseasPlayers());
            rules.setMinBatsmen(request.getRules().getMinBatsmen());
            rules.setMinBowlers(request.getRules().getMinBowlers());
            rules.setMinAllRounders(request.getRules().getMinAllRounders());
            rules.setMinWicketKeepers(request.getRules().getMinWicketKeepers());
            rules.setInitialPurse(request.getRules().getInitialPurse());
            rules.setMinBidAmount(request.getRules().getMinBidAmount());
            rules.setBidIncrement(request.getRules().getBidIncrement());
            rules.setMaxBid(request.getRules().getMaxBid());
            rules.setBidTimerSeconds(request.getRules().getBidTimerSeconds());
            rules.setAutoSellTimeout(request.getRules().getAutoSellTimeout());
            rules.setAllowUnsoldReentry(request.getRules().isAllowUnsoldReentry());
            rules.setNominationMethod(request.getRules().getNominationMethod());
            rules.setMaxParticipatingTeams(request.getRules().getMaxParticipatingTeams());
            rules.setRegistrationMode(request.getRules().getRegistrationMode());
            rules.setAllowLateRegistration(request.getRules().isAllowLateRegistration());
            rules.setAllowOverseas(request.getRules().isAllowOverseas());
            rules.setAllowUncapped(request.getRules().isAllowUncapped());
            rules.setAllowRetired(request.getRules().isAllowRetired());
            rules.setAllowManagerCreatedPlayers(request.getRules().isAllowManagerCreatedPlayers());
            rules.setRegistrationFee(request.getRules().getRegistrationFee());
        }
        
        auction = auctionRepository.save(auction);
        return mapper.mapToAuctionResponse(auction);
    }
    
    /**
     * Creates a new auction. This method physically creates the rule snapshot
     * so that this auction is forever decoupled from the global templates.
     */
    @Override
    @Transactional
    public AuctionResponse createAuction(AuctionCreateRequest request) {
        Auction auction = Auction.builder()
                .name(request.getName())
                .scheduledStartTime(request.getScheduledStartTime())
                .status(AuctionStatus.UPCOMING)
                .build();
                
        /*
         STEP 1: Create Rule Snapshot
         The DTO already contains the rules (fetched from a template by the frontend).
         We map them into the concrete AuctionRules entity.
         */
        if (request.getRules() != null) {
            com.auctxi.core.entity.AuctionRules rules = com.auctxi.core.entity.AuctionRules.builder()
                .auction(auction)
                .createdFromTemplateId(request.getRules().getTemplateId())
                .maxSquadSize(request.getRules().getMaxSquadSize())
                .minSquadSize(request.getRules().getMinSquadSize())
                .maxOverseasPlayers(request.getRules().getMaxOverseasPlayers())
                .minBatsmen(request.getRules().getMinBatsmen())
                .minBowlers(request.getRules().getMinBowlers())
                .minAllRounders(request.getRules().getMinAllRounders())
                .minWicketKeepers(request.getRules().getMinWicketKeepers())
                .initialPurse(request.getRules().getInitialPurse())
                .minBidAmount(request.getRules().getMinBidAmount())
                .bidIncrement(request.getRules().getBidIncrement())
                .maxBid(request.getRules().getMaxBid())
                .bidTimerSeconds(request.getRules().getBidTimerSeconds())
                .autoSellTimeout(request.getRules().getAutoSellTimeout())
                .allowUnsoldReentry(request.getRules().isAllowUnsoldReentry())
                .nominationMethod(request.getRules().getNominationMethod())
                .maxParticipatingTeams(request.getRules().getMaxParticipatingTeams())
                .registrationMode(request.getRules().getRegistrationMode())
                .allowLateRegistration(request.getRules().isAllowLateRegistration())
                .allowOverseas(request.getRules().isAllowOverseas())
                .allowUncapped(request.getRules().isAllowUncapped())
                .allowRetired(request.getRules().isAllowRetired())
                .allowManagerCreatedPlayers(request.getRules().isAllowManagerCreatedPlayers())
                .registrationFee(request.getRules().getRegistrationFee())
                .build();
            auction.setAuctionRules(rules);
        }
        
        auction = auctionRepository.save(auction);
        AuctionResponse response = mapper.mapToAuctionResponse(auction);
        messagingTemplate.convertAndSend("/topic/auctions", response);
        return response;
    }

    @Override
    @Transactional
    public AuctionResponse startAuction(String id) {
        Auction auction = getAuctionEntity(id);
        if (auction.getStatus() != AuctionStatus.UPCOMING) {
            throw new IllegalStateException("Only UPCOMING auctions can be started");
        }
        auction.setStatus(AuctionStatus.ONGOING);
        auction.setStartTime(LocalDateTime.now());
        auction = auctionRepository.save(auction);
        
        messagingTemplate.convertAndSend("/topic/auction/" + id + "/state", "START");
        return mapper.mapToAuctionResponse(auction);
    }

    @Override
    public void announceStart(String id) {
        messagingTemplate.convertAndSend("/topic/auction/" + id + "/state", "STARTING_IN_10");
        
        // Notify all participating team owners
        Auction auction = getAuctionEntity(id);
        teamRepository.findByAuctionId(id).forEach(team -> {
            if (team.getOwnerClient() != null) {
                notificationService.createNotification(
                    team.getOwnerClient().getId(),
                    "Auction Starting!",
                    auction.getName() + " is starting now! The 10-second countdown has begun. Click here to enter the live room.",
                    "/client/live-auction/" + id
                );
            }
        });
    }

    @Override
    @Transactional
    public AuctionResponse pauseAuction(String id) {
        Auction auction = getAuctionEntity(id);
        if (auction.getStatus() != AuctionStatus.ONGOING) {
            throw new IllegalStateException("Only ONGOING auctions can be paused");
        }
        auction.setStatus(AuctionStatus.PAUSED);
        auction = auctionRepository.save(auction);
        
        messagingTemplate.convertAndSend("/topic/auction/" + id + "/state", "PAUSE");
        return mapper.mapToAuctionResponse(auction);
    }

    @Override
    @Transactional
    public AuctionResponse resumeAuction(String id) {
        Auction auction = getAuctionEntity(id);
        if (auction.getStatus() != AuctionStatus.PAUSED) {
            throw new IllegalStateException("Only PAUSED auctions can be resumed");
        }
        auction.setStatus(AuctionStatus.ONGOING);
        auction = auctionRepository.save(auction);
        
        messagingTemplate.convertAndSend("/topic/auction/" + id + "/state", "RESUME");
        return mapper.mapToAuctionResponse(auction);
    }

    @Override
    @Transactional
    public AuctionResponse endAuction(String id) {
        Auction auction = getAuctionEntity(id);
        if (auction.getStatus() == AuctionStatus.COMPLETED) {
            throw new IllegalStateException("Auction is already COMPLETED");
        }
        auction.setStatus(AuctionStatus.COMPLETED);
        auction.setEndTime(LocalDateTime.now());
        auction.setCurrentPlayer(null); // Clear current player
        auction.setTimerEndTime(null);
        auction = auctionRepository.save(auction);
        
        // --- Added Settlement Logic ---
        try {
            String currentUserId = "system";
            org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof com.auctxi.core.security.CustomUserDetails) {
                currentUserId = ((com.auctxi.core.security.CustomUserDetails) authentication.getPrincipal()).getUser().getId();
            }
            
            List<ClientSpendDto> clientSpends = teamRepository.findByAuctionId(id).stream()
                    .filter(team -> team.getOwnerClient() != null)
                    .map(team -> ClientSpendDto.builder()
                            .clientId(team.getOwnerClient().getId())
                            .totalSpent(team.getTotalBudget().subtract(team.getRemainingPurse()))
                            .build())
                    .collect(Collectors.toList());
            paymentServiceClient.settleAuction(id, currentUserId, clientSpends);
        } catch (Exception e) {
            System.err.println("Error settling auction: " + e.getMessage());
        }
        // ------------------------------
        
        messagingTemplate.convertAndSend("/topic/auction/" + id + "/state", "END");
        return mapper.mapToAuctionResponse(auction);
    }

    @Override
    @Transactional
    public AuctionResponse setCurrentPlayer(String auctionId, String playerId) {
        Auction auction = getAuctionEntity(auctionId);
        
        if (auction.getStatus() != AuctionStatus.ONGOING) {
            throw new IllegalStateException("Cannot set current player. Auction is not ONGOING");
        }

        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));

        AuctionPlayer auctionPlayer = auctionPlayerRepository.findByAuctionIdAndPlayerId(auctionId, playerId)
                .orElseThrow(() -> new IllegalStateException("Player is not assigned to this auction"));

        if (auctionPlayer.getSoldStatus() != PlayerStatus.AVAILABLE && auctionPlayer.getSoldStatus() != PlayerStatus.UNSOLD) {
            throw new IllegalStateException("Player is not AVAILABLE for bidding (Status: " + auctionPlayer.getSoldStatus() + ")");
        }

        auction.setCurrentPlayer(auctionPlayer);
        
        // Use dynamic timer from rules
        int timerSeconds = (auction.getAuctionRules() != null && auction.getAuctionRules().getBidTimerSeconds() > 0) 
                           ? auction.getAuctionRules().getBidTimerSeconds() : 20;
                           
        // Start the initial countdown timer for the first bid
        auction.setTimerEndTime(LocalDateTime.now().plusSeconds(timerSeconds));
        
        auction = auctionRepository.save(auction);
        return mapper.mapToAuctionResponse(auction);
    }

    @Override
    @Transactional
    public AuctionResponse nextPlayer(String id) {
        Auction auction = getAuctionEntity(id);
        
        if (auction.getStatus() != AuctionStatus.ONGOING) {
            throw new IllegalStateException("Cannot advance player. Auction is not ONGOING");
        }

        if (auction.getCurrentPlayer() != null) {
            throw new IllegalStateException("A player is already on the podium. Sell or Mark Unsold first.");
        }

        // Find next AVAILABLE player
        java.util.Optional<AuctionPlayer> nextPlayerOpt = auctionPlayerRepository.findFirstByAuctionIdAndSoldStatusOrderByAuctionOrderAsc(id, PlayerStatus.AVAILABLE);

        if (nextPlayerOpt.isEmpty()) {
            // Check for unsold retries
            int allowedRetries = auction.getAuctionRules() != null ? auction.getAuctionRules().getAutoSellTimeout() : 0;
            
            if (allowedRetries > 0) {
                List<AuctionPlayer> unsoldToRetry = auctionPlayerRepository.findByAuctionIdAndSoldStatus(id, PlayerStatus.UNSOLD)
                    .stream()
                    .filter(ap -> ap.getUnsoldRetries() < allowedRetries)
                    .collect(java.util.stream.Collectors.toList());
                
                if (!unsoldToRetry.isEmpty()) {
                    for (AuctionPlayer ap : unsoldToRetry) {
                        ap.setSoldStatus(PlayerStatus.AVAILABLE);
                        ap.setUnsoldRetries(ap.getUnsoldRetries() + 1);
                        auctionPlayerRepository.save(ap);
                    }
                    // Fetch the first available again now that we reset them
                    nextPlayerOpt = auctionPlayerRepository.findFirstByAuctionIdAndSoldStatusOrderByAuctionOrderAsc(id, PlayerStatus.AVAILABLE);
                }
            }
        }

        if (nextPlayerOpt.isEmpty()) {
            throw new IllegalStateException("No available players left in this auction.");
        }

        AuctionPlayer nextPlayer = nextPlayerOpt.get();
        auction.setCurrentPlayer(nextPlayer);
        
        // Use dynamic timer from rules
        int timerSeconds = (auction.getAuctionRules() != null && auction.getAuctionRules().getBidTimerSeconds() > 0) 
                           ? auction.getAuctionRules().getBidTimerSeconds() : 20;
                           
        // Reset timer
        auction.setTimerEndTime(LocalDateTime.now().plusSeconds(timerSeconds));
        
        auction = auctionRepository.save(auction);
        
        AuctionResponse response = mapper.mapToAuctionResponse(auction);
        // Broadcast next player state
        messagingTemplate.convertAndSend("/topic/auction/" + id + "/state", "NEXT_PLAYER");
        
        return response;
    }

    @Override
    public AuctionResponse getAuctionById(String id) {
        return mapper.mapToAuctionResponse(getAuctionEntity(id));
    }

    @Override
    public List<AuctionResponse> getAllAuctions() {
        return auctionRepository.findAll().stream()
                .map(mapper::mapToAuctionResponse)
                .collect(Collectors.toList());
    }

    private Auction getAuctionEntity(String id) {
        return auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));
    }
}
