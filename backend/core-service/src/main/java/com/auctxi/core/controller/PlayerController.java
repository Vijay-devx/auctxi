package com.auctxi.core.controller;

import com.auctxi.core.dto.request.PlayerCreateRequest;
import com.auctxi.core.dto.request.PlayerUpdateRequest;
import com.auctxi.core.dto.response.PageResponse;
import com.auctxi.core.dto.response.PlayerResponse;
import com.auctxi.core.entity.PlayerCategory;
import com.auctxi.core.entity.PlayerRole;

import com.auctxi.core.service.PlayerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.auctxi.core.security.CustomUserDetails;

/**
 * Controller responsible for managing Players.
 *
 * This controller allows Admins to create GLOBAL players (visible to everyone)
 * and Managers to create PRIVATE players (visible only in their own auctions).
 */
@RestController
@RequestMapping("/api/v1/players")
@RequiredArgsConstructor
@Tag(name = "Player Management", description = "Endpoints for managing players entering the auction")
public class PlayerController {

    private final PlayerService playerService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Create a new player (Admin/Manager)")
    public ResponseEntity<PlayerResponse> createPlayer(@Valid @RequestBody PlayerCreateRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return new ResponseEntity<>(playerService.createPlayer(request, userDetails.getUser().getId()), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get player details by ID")
    public ResponseEntity<PlayerResponse> getPlayerById(@PathVariable String id) {
        return ResponseEntity.ok(playerService.getPlayerById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Update an existing player (Admin/Manager)")
    public ResponseEntity<PlayerResponse> updatePlayer(
            @PathVariable String id,
            @Valid @RequestBody PlayerUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(playerService.updatePlayer(id, request, userDetails.getUser().getId(), userDetails.getUser().getRole()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Delete a player (Admin/Manager)")
    public ResponseEntity<Void> deletePlayer(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        playerService.deletePlayer(id, userDetails.getUser().getId(), userDetails.getUser().getRole());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get all players with filtering and pagination")
    public ResponseEntity<PageResponse<PlayerResponse>> getAllPlayers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) PlayerRole role,
            @RequestParam(required = false) PlayerCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(playerService.getAllPlayers(search, role, category, pageable, userDetails.getUser().getId(), userDetails.getUser().getRole()));
    }
}
