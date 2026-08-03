package com.auctxi.core.controller;

import com.auctxi.core.dto.request.BidRequest;
import com.auctxi.core.dto.response.BidResponse;
import com.auctxi.core.dto.response.PlayerResponse;
import com.auctxi.core.service.BiddingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller responsible for the core Live Bidding Engine.
 *
 * This controller handles placing bids and ultimately executing the sale of a player.
 * It is designed to handle high-frequency requests during live auctions.
 */
@RestController
@RequestMapping("/api/v1/bidding")
@RequiredArgsConstructor
@Tag(name = "Bidding Engine", description = "Endpoints for managing real-time bids and selling players")
public class BiddingController {

    private final BiddingService biddingService;

    @PostMapping("/{auctionId}/players/{playerId}/bid")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CLIENT')")
    @Operation(summary = "Place a new bid on a player currently under the hammer")
    public ResponseEntity<BidResponse> placeBid(
            @PathVariable String auctionId,
            @PathVariable String playerId,
            @Valid @RequestBody BidRequest request) {
        return new ResponseEntity<>(biddingService.placeBid(auctionId, playerId, request), HttpStatus.CREATED);
    }

    @GetMapping("/{auctionId}/players/{playerId}/history")
    @Operation(summary = "Get the full bid history for a specific player in an auction")
    public ResponseEntity<List<BidResponse>> getBidHistory(
            @PathVariable String auctionId,
            @PathVariable String playerId) {
        return ResponseEntity.ok(biddingService.getBidHistory(auctionId, playerId));
    }

    @PostMapping("/{auctionId}/players/{playerId}/sell")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Execute the sale of the player to the highest bidder")
    public ResponseEntity<PlayerResponse> sellPlayer(
            @PathVariable String auctionId,
            @PathVariable String playerId) {
        return ResponseEntity.ok(biddingService.sellPlayer(auctionId, playerId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get all bids in the system")
    public ResponseEntity<List<BidResponse>> getAllBids() {
        return ResponseEntity.ok(biddingService.getAllBids());
    }
}
