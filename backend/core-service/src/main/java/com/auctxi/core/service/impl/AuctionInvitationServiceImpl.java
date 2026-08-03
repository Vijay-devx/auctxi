package com.auctxi.core.service.impl;

import com.auctxi.core.dto.request.AuctionApplicationRequest;
import com.auctxi.core.dto.response.AuctionInvitationResponse;
import com.auctxi.core.dto.response.UserSummaryResponse;
import com.auctxi.core.entity.*;
import com.auctxi.core.exception.ResourceNotFoundException;
import com.auctxi.core.repository.AuctionInvitationRepository;
import com.auctxi.core.repository.AuctionRepository;
import com.auctxi.core.repository.TeamRepository;
import com.auctxi.core.repository.UserRepository;
import com.auctxi.core.service.AuctionInvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionInvitationServiceImpl implements AuctionInvitationService {

    private final AuctionInvitationRepository invitationRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    @Override
    @Transactional
    public AuctionInvitationResponse inviteClient(String auctionId, String clientId, String managerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + clientId));

        if (auction.getAuctionRules() == null) {
            throw new IllegalStateException("Auction has no rules configured. Cannot send invitations.");
        }

        RegistrationMode regMode = auction.getAuctionRules().getRegistrationMode();
        if (regMode != RegistrationMode.INVITE_ONLY) {
            throw new IllegalStateException("This auction is not Invite-Only. Users must apply manually.");
        }

        if (invitationRepository.existsByAuctionAndInvitedClient(auction, client)) {
            throw new IllegalStateException("This user has already been invited to this auction.");
        }

        // Generate token and set expiry
        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);

        AuctionInvitation invitation = AuctionInvitation.builder()
                .auction(auction)
                .invitedClient(client)
                .token(token)
                .status(InvitationStatus.PENDING)
                .expiresAt(expiresAt)
                .build();

        invitation = invitationRepository.save(invitation);
        
        return mapToResponse(invitation);
    }

    @Override
    @Transactional
    public AuctionInvitationResponse acceptInvitation(String invitationId, String clientId, AuctionApplicationRequest request) {
        AuctionInvitation invitation = getInvitationById(invitationId);
        
        if (!invitation.getInvitedClient().getId().equals(clientId)) {
            throw new IllegalStateException("You are not authorized to accept this invitation.");
        }
        
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalStateException("This invitation is no longer pending.");
        }
        
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new IllegalStateException("This invitation has expired.");
        }
        
        Auction auction = invitation.getAuction();
        long currentTeams = teamRepository.countByAuction(auction);
        if (currentTeams >= auction.getAuctionRules().getMaxParticipatingTeams()) {
            throw new IllegalStateException("This auction has reached its maximum participating teams limit.");
        }

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation = invitationRepository.save(invitation);

        createTeamForInvitation(invitation, request);

        return mapToResponse(invitation);
    }

    @Override
    @Transactional
    public AuctionInvitationResponse declineInvitation(String invitationId, String clientId) {
        AuctionInvitation invitation = getInvitationById(invitationId);
        
        if (!invitation.getInvitedClient().getId().equals(clientId)) {
            throw new IllegalStateException("You are not authorized to decline this invitation.");
        }
        
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalStateException("This invitation is no longer pending.");
        }

        invitation.setStatus(InvitationStatus.DECLINED);
        return mapToResponse(invitationRepository.save(invitation));
    }

    @Override
    public List<AuctionInvitationResponse> getInvitationsForAuction(String auctionId, String managerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
        return invitationRepository.findByAuction(auction).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuctionInvitationResponse> getInvitationsForClient(String clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + clientId));
        return invitationRepository.findByInvitedClient(client).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void createTeamForInvitation(AuctionInvitation invitation, AuctionApplicationRequest request) {
        if (teamRepository.existsByAuctionAndName(invitation.getAuction(), request.getProposedTeamName())) {
             throw new IllegalStateException("A team with this name already exists in the auction.");
        }
        if (teamRepository.existsByAuctionAndShortName(invitation.getAuction(), request.getProposedShortName())) {
             throw new IllegalStateException("A team with this short name already exists in the auction.");
        }

        String finalLogoUrl = request.getLogoUrl() != null ? request.getLogoUrl() : 
            "https://ui-avatars.com/api/?name=" + request.getProposedTeamName().replace(" ", "+");

        Team team = Team.builder()
                .auction(invitation.getAuction())
                .ownerClient(invitation.getInvitedClient())
                .name(request.getProposedTeamName())
                .shortName(request.getProposedShortName())
                .logoUrl(finalLogoUrl)
                .totalBudget(invitation.getAuction().getAuctionRules().getInitialPurse())
                .remainingPurse(invitation.getAuction().getAuctionRules().getInitialPurse())
                .build();
        
        teamRepository.save(team);
    }

    private AuctionInvitation getInvitationById(String id) {
        return invitationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AuctionInvitation not found with id: " + id));
    }

    private AuctionInvitationResponse mapToResponse(AuctionInvitation inv) {
        UserSummaryResponse clientSummary = UserSummaryResponse.builder()
                .id(inv.getInvitedClient().getId())
                .name(inv.getInvitedClient().getName())
                .email(inv.getInvitedClient().getEmail())
                .role(inv.getInvitedClient().getRole())
                .build();
                
        return AuctionInvitationResponse.builder()
                .id(inv.getId())
                .auctionId(inv.getAuction().getId())
                .auctionName(inv.getAuction().getName())
                .invitedClient(clientSummary)
                .status(inv.getStatus())
                .expiresAt(inv.getExpiresAt())
                .createdAt(inv.getCreatedAt())
                .build();
    }
}
