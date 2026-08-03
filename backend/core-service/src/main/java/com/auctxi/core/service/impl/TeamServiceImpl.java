package com.auctxi.core.service.impl;

import com.auctxi.core.dto.request.TeamCreateRequest;
import com.auctxi.core.dto.request.TeamUpdateRequest;
import com.auctxi.core.dto.response.PlayerResponse;
import com.auctxi.core.dto.response.TeamResponse;
import com.auctxi.core.dto.response.UserSummaryResponse;
import com.auctxi.core.entity.Player;
import com.auctxi.core.entity.Team;
import com.auctxi.core.entity.User;
import com.auctxi.core.exception.ResourceNotFoundException;
import com.auctxi.core.repository.TeamRepository;
import com.auctxi.core.repository.UserRepository;
import com.auctxi.core.service.TeamService;
import com.auctxi.core.mapper.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the Team Service.
 *
 * Handles team budget calculations, name uniqueness validations, and owner assignments.
 */
@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final DtoMapper mapper;

    /**
     * Retrieves a team by its ID, which includes its full roster of players
     * (handled via JPA relationships mapping to TeamResponse).
     */
    @Override
    public TeamResponse getTeamById(String id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
        return mapper.mapToTeamResponse(team);
    }

    /**
     * Updates team details. This method contains crucial logic for maintaining
     * financial integrity when an admin changes a team's total budget mid-auction.
     */
    @Override
    @Transactional
    public TeamResponse updateTeam(String id, TeamUpdateRequest request, User currentUser) {
        /*
         STEP 1: Load Team
         */
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));

        // Authorization check: If client, must be the owner
        if (currentUser.getRole() == com.auctxi.core.entity.Role.ROLE_CLIENT) {
            if (team.getOwnerClient() == null || !team.getOwnerClient().getId().equals(currentUser.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("You can only update your own team.");
            }
            // Clients cannot change budget or owner
            request.setTotalBudget(null);
            request.setOwnerId(null);
        }

        /*
         STEP 2: Validate Uniqueness
         If the name or short name is being changed, ensure no other team *in this specific auction*
         is already using it.
         */
        if (request.getName() != null && !request.getName().equals(team.getName())) {
            if (teamRepository.existsByAuctionAndName(team.getAuction(), request.getName())) {
                throw new IllegalArgumentException("Team name already exists in this auction");
            }
            team.setName(request.getName());
        }
        
        if (request.getShortName() != null && !request.getShortName().equals(team.getShortName())) {
            if (teamRepository.existsByAuctionAndShortName(team.getAuction(), request.getShortName())) {
                throw new IllegalArgumentException("Team short name already exists in this auction");
            }
            team.setShortName(request.getShortName());
        }
        
        if (request.getLogoUrl() != null) team.setLogoUrl(request.getLogoUrl());
        
        /*
         STEP 3: Purse Recalculation Logic
         If an admin increases or decreases the total budget, we cannot simply overwrite the 
         remaining purse. We must adjust the remaining purse by the exact difference.
         */
        if (request.getTotalBudget() != null) {
            java.math.BigDecimal difference = request.getTotalBudget().subtract(team.getTotalBudget());
            team.setRemainingPurse(team.getRemainingPurse().add(difference));
            team.setTotalBudget(request.getTotalBudget());
        }
        
        /*
         STEP 4: Owner Reassignment
         */
        if (request.getOwnerId() != null) {
            User owner = userRepository.findById(request.getOwnerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Owner User not found with id: " + request.getOwnerId()));
            team.setOwnerClient(owner);
        }

        /*
         STEP 5: Save
         */
        team = teamRepository.save(team);
        return mapper.mapToTeamResponse(team);
    }

    /**
     * Hard deletes a team from the database.
     */
    @Override
    @Transactional
    public void deleteTeam(String id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
        teamRepository.delete(team);
    }

    /**
     * Fetches all teams across all auctions.
     */
    @Override
    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(mapper::mapToTeamResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<TeamResponse> getTeamsByAuctionId(String auctionId) {
        return teamRepository.findByAuctionId(auctionId).stream()
                .map(mapper::mapToTeamResponse)
                .collect(Collectors.toList());
    }
}
