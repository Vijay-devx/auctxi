package com.auctxi.core.controller;

import com.auctxi.core.dto.request.AuctionCreateRequest;
import com.auctxi.core.dto.request.AuctionUpdateRequest;
import com.auctxi.core.dto.response.AuctionResponse;
import com.auctxi.core.dto.response.PlayerResponse;
import com.auctxi.core.service.AuctionPlayerService;
import com.auctxi.core.service.AuctionService;
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
 * Controller responsible for managing the Core Auction State Machine.
 *
 * This controller handles the lifecycle of an auction:
 * UPCOMING -> ONGOING <-> PAUSED -> COMPLETED
 *
 * It also controls the flow of the live auction by setting the 'currentPlayer'
 * under the hammer.
 */
@RestController
@RequestMapping("/api/v1/auctions")
@RequiredArgsConstructor
@Tag(name = "Auction Management", description = "Endpoints for managing the auction state machine (Start, Pause, End, Set Player)")
public class AuctionController {

    private final AuctionService auctionService;
    private final AuctionPlayerService auctionPlayerService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Create a new auction")
    public ResponseEntity<AuctionResponse> createAuction(@Valid @RequestBody AuctionCreateRequest request) {
        return new ResponseEntity<>(auctionService.createAuction(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Update an UPCOMING auction rules")
    public ResponseEntity<AuctionResponse> updateAuction(
            @PathVariable String id,
            @Valid @RequestBody AuctionUpdateRequest request) {
        return ResponseEntity.ok(auctionService.updateAuction(id, request));
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<AuctionResponse> startAuction(@PathVariable String id) {
        return ResponseEntity.ok(auctionService.startAuction(id));
    }

    @PostMapping("/{id}/announce-start")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> announceStart(@PathVariable String id) {
        auctionService.announceStart(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/pause")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Pause an ONGOING auction")
    public ResponseEntity<AuctionResponse> pauseAuction(@PathVariable String id) {
        return ResponseEntity.ok(auctionService.pauseAuction(id));
    }

    @PostMapping("/{id}/resume")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Resume a PAUSED auction")
    public ResponseEntity<AuctionResponse> resumeAuction(@PathVariable String id) {
        return ResponseEntity.ok(auctionService.resumeAuction(id));
    }

    @PostMapping("/{id}/end")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "End the auction")
    public ResponseEntity<AuctionResponse> endAuction(@PathVariable String id) {
        return ResponseEntity.ok(auctionService.endAuction(id));
    }

    @PostMapping("/{id}/current-player/{playerId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Set the current player under the hammer (Starts the timer)")
    public ResponseEntity<AuctionResponse> setCurrentPlayer(
            @PathVariable String id,
            @PathVariable String playerId) {
        return ResponseEntity.ok(auctionService.setCurrentPlayer(id, playerId));
    }

    @PostMapping("/{id}/next-player")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Pulls the next available player onto the podium")
    public ResponseEntity<AuctionResponse> nextPlayer(@PathVariable String id) {
        return ResponseEntity.ok(auctionService.nextPlayer(id));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get the current state of an auction")
    public ResponseEntity<AuctionResponse> getAuctionById(@PathVariable String id) {
        return ResponseEntity.ok(auctionService.getAuctionById(id));
    }

    @GetMapping
    @Operation(summary = "Get all auctions")
    public ResponseEntity<List<AuctionResponse>> getAllAuctions() {
        return ResponseEntity.ok(auctionService.getAllAuctions());
    }

    @GetMapping("/{id}/players")
    @Operation(summary = "Get players currently assigned to this auction")
    public ResponseEntity<List<PlayerResponse>> getAssignedPlayersForAuction(@PathVariable String id) {
        return ResponseEntity.ok(auctionPlayerService.getAssignedPlayersForAuction(id, null));
    }
}
