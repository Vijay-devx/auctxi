package com.auctxi.core.controller;

import com.auctxi.core.dto.request.PlayerAssignmentRequest;
import com.auctxi.core.dto.response.PlayerResponse;
import com.auctxi.core.security.CustomUserDetails;
import com.auctxi.core.service.AuctionPlayerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/manager/auctions")
@RequiredArgsConstructor
@Tag(name = "Manager Auction Player Management", description = "Endpoints for manager to assign players to an auction")
public class ManagerAuctionPlayerController {

    private final AuctionPlayerService auctionPlayerService;

    @GetMapping("/{auctionId}/available-players")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    @Operation(summary = "Get players from the manager's private pool that are available to be assigned to this auction")
    public ResponseEntity<List<PlayerResponse>> getAvailablePlayersForAuction(
            @PathVariable String auctionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(auctionPlayerService.getAvailablePlayersForAuction(auctionId, userDetails.getUser().getId()));
    }

    @GetMapping("/{auctionId}/assigned-players")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    @Operation(summary = "Get players currently assigned to this auction")
    public ResponseEntity<List<PlayerResponse>> getAssignedPlayersForAuction(
            @PathVariable String auctionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(auctionPlayerService.getAssignedPlayersForAuction(auctionId, userDetails.getUser().getId()));
    }

    @PostMapping("/{auctionId}/players")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    @Operation(summary = "Assign players to an auction")
    public ResponseEntity<Void> assignPlayersToAuction(
            @PathVariable String auctionId,
            @RequestBody PlayerAssignmentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        auctionPlayerService.assignPlayersToAuction(auctionId, request.getPlayerIds(), userDetails.getUser().getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{auctionId}/players/{playerId}")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    @Operation(summary = "Remove a player from an auction")
    public ResponseEntity<Void> removePlayerFromAuction(
            @PathVariable String auctionId,
            @PathVariable String playerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        auctionPlayerService.removePlayerFromAuction(auctionId, playerId, userDetails.getUser().getId());
        return ResponseEntity.ok().build();
    }
}
