package com.auctxi.core.controller;

import com.auctxi.core.dto.response.PlayerResponse;
import com.auctxi.core.security.CustomUserDetails;
import com.auctxi.core.service.WatchlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/watchlist")
@RequiredArgsConstructor
@Tag(name = "Watchlist", description = "Endpoints for managing user watchlists")
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get the current user's watchlist")
    public ResponseEntity<List<PlayerResponse>> getMyWatchlist(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getUser().getId();
        return ResponseEntity.ok(watchlistService.getMyWatchlist(userId));
    }

    @PostMapping("/{playerId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add a player to the current user's watchlist")
    public ResponseEntity<Void> addPlayerToWatchlist(
            @PathVariable String playerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getUser().getId();
        watchlistService.addPlayerToWatchlist(userId, playerId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{playerId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Remove a player from the current user's watchlist")
    public ResponseEntity<Void> removePlayerFromWatchlist(
            @PathVariable String playerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getUser().getId();
        watchlistService.removePlayerFromWatchlist(userId, playerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{playerId}/status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check if a player is in the current user's watchlist")
    public ResponseEntity<Boolean> isPlayerWatchlisted(
            @PathVariable String playerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getUser().getId();
        return ResponseEntity.ok(watchlistService.isPlayerWatchlisted(userId, playerId));
    }
}
