package com.auctxi.core.controller;

import com.auctxi.core.dto.response.AuctionResponse;
import com.auctxi.core.security.CustomUserDetails;
import com.auctxi.core.service.AuctionWatchlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auction-watchlist")
@RequiredArgsConstructor
@Tag(name = "Auction Watchlist", description = "Endpoints for managing user auction watchlists")
public class AuctionWatchlistController {

    private final AuctionWatchlistService auctionWatchlistService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get the current user's watchlisted auctions")
    public ResponseEntity<List<AuctionResponse>> getMyWatchlist(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getUser().getId();
        return ResponseEntity.ok(auctionWatchlistService.getMyWatchlistedAuctions(userId));
    }

    @PostMapping("/{auctionId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add an auction to the current user's watchlist")
    public ResponseEntity<Void> addAuctionToWatchlist(
            @PathVariable String auctionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getUser().getId();
        auctionWatchlistService.addAuctionToWatchlist(userId, auctionId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{auctionId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Remove an auction from the current user's watchlist")
    public ResponseEntity<Void> removeAuctionFromWatchlist(
            @PathVariable String auctionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getUser().getId();
        auctionWatchlistService.removeAuctionFromWatchlist(userId, auctionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{auctionId}/status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check if an auction is in the current user's watchlist")
    public ResponseEntity<Boolean> isAuctionWatchlisted(
            @PathVariable String auctionId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getUser().getId();
        return ResponseEntity.ok(auctionWatchlistService.isAuctionWatchlisted(userId, auctionId));
    }
}
