package com.auctxi.core.controller;

import com.auctxi.core.dto.request.AuctionApplicationRequest;
import com.auctxi.core.dto.response.AuctionInvitationResponse;
import com.auctxi.core.security.CustomUserDetails;
import com.auctxi.core.service.AuctionInvitationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/invitations")
@RequiredArgsConstructor
@Tag(name = "Auction Invitations", description = "Endpoints for managing manager-to-client invitations")
public class AuctionInvitationController {

    private final AuctionInvitationService invitationService;

    @PostMapping("/auction/{auctionId}/invite/{clientId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Invite a client to participate in an auction")
    public ResponseEntity<AuctionInvitationResponse> inviteClient(
            @PathVariable String auctionId,
            @PathVariable String clientId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return new ResponseEntity<>(invitationService.inviteClient(auctionId, clientId, userDetails.getUser().getId()), HttpStatus.CREATED);
    }

    @PostMapping("/{invitationId}/accept")
    @Operation(summary = "Accept an invitation and register a team")
    public ResponseEntity<AuctionInvitationResponse> acceptInvitation(
            @PathVariable String invitationId,
            @Valid @RequestBody AuctionApplicationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(invitationService.acceptInvitation(invitationId, userDetails.getUser().getId(), request));
    }

    @PostMapping("/{invitationId}/decline")
    @Operation(summary = "Decline an invitation")
    public ResponseEntity<AuctionInvitationResponse> declineInvitation(
            @PathVariable String invitationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(invitationService.declineInvitation(invitationId, userDetails.getUser().getId()));
    }

    @GetMapping("/auction/{auctionId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get all invitations sent for a specific auction")
    public ResponseEntity<List<AuctionInvitationResponse>> getInvitationsForAuction(
            @PathVariable String auctionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(invitationService.getInvitationsForAuction(auctionId, userDetails.getUser().getId()));
    }

    @GetMapping("/my-invitations")
    @Operation(summary = "Get all invitations received by the current user")
    public ResponseEntity<List<AuctionInvitationResponse>> getMyInvitations(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(invitationService.getInvitationsForClient(userDetails.getUser().getId()));
    }
}
