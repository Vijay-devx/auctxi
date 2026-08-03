package com.auctxi.core.controller;

import com.auctxi.core.dto.request.TeamCreateRequest;
import com.auctxi.core.dto.request.TeamUpdateRequest;
import com.auctxi.core.dto.response.TeamResponse;
import com.auctxi.core.service.TeamService;
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
 * Controller responsible for managing Teams within auctions.
 *
 * This controller handles fetching team rosters and updating team budgets.
 * Note that 'Team Registration' logic (where a team joins a specific auction)
 * is typically handled through the AuctionController or a dedicated Registration endpoint.
 */
@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
@Tag(name = "Team Management", description = "Endpoints for managing teams, budgets, and their players")
public class TeamController {

    private final TeamService teamService;

    @GetMapping("/{id}")
    @Operation(summary = "Get team details by ID, including the roster of players")
    public ResponseEntity<TeamResponse> getTeamById(@PathVariable String id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CLIENT')")
    @Operation(summary = "Update an existing team (Admin/Manager/Owner)")
    public ResponseEntity<TeamResponse> updateTeam(
            @PathVariable String id,
            @Valid @RequestBody TeamUpdateRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.auctxi.core.security.CustomUserDetails userDetails) {
        return ResponseEntity.ok(teamService.updateTeam(id, request, userDetails.getUser()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Delete a team (Admin Only)")
    public ResponseEntity<Void> deleteTeam(@PathVariable String id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get all teams and their rosters")
    public ResponseEntity<List<TeamResponse>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @GetMapping("/auction/{auctionId}")
    @Operation(summary = "Get all teams for a specific auction")
    public ResponseEntity<List<TeamResponse>> getTeamsByAuctionId(@PathVariable String auctionId) {
        return ResponseEntity.ok(teamService.getTeamsByAuctionId(auctionId));
    }
}
