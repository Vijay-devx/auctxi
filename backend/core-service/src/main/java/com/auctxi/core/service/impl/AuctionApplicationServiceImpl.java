package com.auctxi.core.service.impl;

import com.auctxi.core.dto.request.AuctionApplicationRequest;
import com.auctxi.core.dto.response.AuctionApplicationResponse;
import com.auctxi.core.dto.response.UserSummaryResponse;
import com.auctxi.core.entity.*;
import com.auctxi.core.exception.ResourceNotFoundException;
import com.auctxi.core.repository.AuctionApplicationRepository;
import com.auctxi.core.repository.AuctionRepository;
import com.auctxi.core.repository.TeamRepository;
import com.auctxi.core.repository.UserRepository;
import com.auctxi.core.service.AuctionApplicationService;
import com.auctxi.core.service.NotificationService;
import com.auctxi.core.service.PaymentServiceClient;
import com.auctxi.core.service.NotificationFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionApplicationServiceImpl implements AuctionApplicationService {

    private final AuctionApplicationRepository applicationRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final NotificationService notificationService;
    private final PaymentServiceClient paymentServiceClient;
    private final NotificationFacade notificationFacade;

    @Override
    @Transactional
    public AuctionApplicationResponse applyForAuction(String auctionId, String userId, AuctionApplicationRequest request) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        
        User applicant = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (auction.getAuctionRules() == null) {
            throw new IllegalStateException("Auction has no rules configured. Cannot process applications.");
        }

        RegistrationMode regMode = auction.getAuctionRules().getRegistrationMode();
        if (regMode == RegistrationMode.INVITE_ONLY) {
            throw new IllegalStateException("This auction is Invite-Only. Applications are not accepted.");
        }

        if (applicationRepository.existsByAuctionAndClient(auction, applicant)) {
            throw new IllegalStateException("You have already applied for this auction.");
        }

        // Validate max teams constraint (optional here or only upon approval)
        long currentTeams = teamRepository.countByAuction(auction);
        if (currentTeams >= auction.getAuctionRules().getMaxParticipatingTeams()) {
            throw new IllegalStateException("This auction has reached its maximum participating teams limit.");
        }

        ApplicationStatus initialStatus = (regMode == RegistrationMode.OPEN) ? ApplicationStatus.APPROVED : ApplicationStatus.PENDING;

        AuctionApplication application = AuctionApplication.builder()
                .auction(auction)
                .client(applicant)
                .proposedTeamName(request.getProposedTeamName())
                .proposedShortName(request.getProposedShortName())
                .status(initialStatus)
                .build();

        application = applicationRepository.save(application);

        // Auto-approve logic if OPEN
        if (initialStatus == ApplicationStatus.APPROVED) {
            paymentServiceClient.deductAuctionFees(
                    application.getClient().getId(), 
                    auction.getId(), 
                    auction.getAuctionRules().getRegistrationFee(), 
                    auction.getAuctionRules().getInitialPurse()
            );
            
            notificationFacade.sendPaymentSuccess(
                    application.getClient().getId(), 
                    application.getClient().getEmail(), 
                    auction.getAuctionRules().getRegistrationFee(), 
                    "RegistrationFee"
            );
            
            createTeamForApplication(application, request.getLogoUrl());
        }

        // Notify all managers
        List<User> managers = userRepository.findByRole(Role.ROLE_MANAGER);
        for (User manager : managers) {
            String title = "New Auction Application";
            String msg = applicant.getName() + " has applied to join " + auction.getName() + ".";
            String actionUrl = "/manager/auctions/" + auction.getId() + "?tab=teams";
            notificationService.createNotification(manager.getId(), title, msg, actionUrl);
        }

        return mapToResponse(application);
    }

    @Override
    @Transactional
    public AuctionApplicationResponse approveApplication(String applicationId, String managerId) {
        AuctionApplication application = getApplicationById(applicationId);
        
        // Ensure manager controls this auction? Let's assume manager controls the auction
        // In real app, verify managerId matches auction.managerId (which doesn't exist yet, but implicitly owned by whoever manages it)
        
        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.WAITLISTED) {
            throw new IllegalStateException("Only PENDING or WAITLISTED applications can be approved.");
        }
        
        Auction auction = application.getAuction();
        long currentTeams = teamRepository.countByAuction(auction);
        if (currentTeams >= auction.getAuctionRules().getMaxParticipatingTeams()) {
            throw new IllegalStateException("This auction has reached its maximum participating teams limit.");
        }

        // Deduct fees from client's wallet synchronously. Throws if insufficient balance.
        paymentServiceClient.deductAuctionFees(
                application.getClient().getId(), 
                auction.getId(), 
                auction.getAuctionRules().getRegistrationFee(), 
                auction.getAuctionRules().getInitialPurse()
        );
        
        notificationFacade.sendPaymentSuccess(
                application.getClient().getId(), 
                application.getClient().getEmail(), 
                auction.getAuctionRules().getRegistrationFee(), 
                "RegistrationFee"
        );

        application.setStatus(ApplicationStatus.APPROVED);
        application = applicationRepository.save(application);

        createTeamForApplication(application, null); // Provide default logo or pass from somewhere

        // Notify Client
        String title = "Application Approved";
        String msg = "Your application to join " + auction.getName() + " has been approved! You now have a team.";
        String actionUrl = "/client/live-auction/" + auction.getId();
        notificationService.createNotification(application.getClient().getId(), title, msg, actionUrl);

        return mapToResponse(application);
    }

    @Override
    @Transactional
    public AuctionApplicationResponse rejectApplication(String applicationId, String managerId) {
        AuctionApplication application = getApplicationById(applicationId);
        
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new IllegalStateException("Only PENDING applications can be rejected.");
        }

        application.setStatus(ApplicationStatus.REJECTED);
        application = applicationRepository.save(application);

        // Notify Client
        String title = "Application Rejected";
        String msg = "Your application to join " + application.getAuction().getName() + " was rejected by the manager.";
        String actionUrl = "/client/dashboard";
        notificationService.createNotification(application.getClient().getId(), title, msg, actionUrl);

        return mapToResponse(application);
    }

    @Override
    public List<AuctionApplicationResponse> getApplicationsForAuction(String auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        return applicationRepository.findByAuction(auction).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuctionApplicationResponse> getApplicationsByUser(String userId) {
        User applicant = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return applicationRepository.findByClient(applicant).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void createTeamForApplication(AuctionApplication application, String logoUrl) {
        if (teamRepository.existsByAuctionAndName(application.getAuction(), application.getProposedTeamName())) {
             throw new IllegalStateException("A team with this name already exists in the auction.");
        }
        if (teamRepository.existsByAuctionAndShortName(application.getAuction(), application.getProposedShortName())) {
             throw new IllegalStateException("A team with this short name already exists in the auction.");
        }

        Team team = Team.builder()
                .auction(application.getAuction())
                .ownerClient(application.getClient())
                .name(application.getProposedTeamName())
                .shortName(application.getProposedShortName())
                .logoUrl(logoUrl != null ? logoUrl : "https://ui-avatars.com/api/?name=" + application.getProposedTeamName().replace(" ", "+"))
                .totalBudget(application.getAuction().getAuctionRules().getInitialPurse())
                .remainingPurse(application.getAuction().getAuctionRules().getInitialPurse())
                .build();
        
        teamRepository.save(team);
    }

    private AuctionApplication getApplicationById(String id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AuctionApplication not found with id: " + id));
    }

    private AuctionApplicationResponse mapToResponse(AuctionApplication app) {
        UserSummaryResponse applicantSummary = UserSummaryResponse.builder()
                .id(app.getClient().getId())
                .name(app.getClient().getName())
                .email(app.getClient().getEmail())
                .role(app.getClient().getRole())
                .build();
                
        return AuctionApplicationResponse.builder()
                .id(app.getId())
                .auctionId(app.getAuction().getId())
                .auctionName(app.getAuction().getName())
                .applicant(applicantSummary)
                .proposedTeamName(app.getProposedTeamName())
                .proposedShortName(app.getProposedShortName())
                .status(app.getStatus())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
