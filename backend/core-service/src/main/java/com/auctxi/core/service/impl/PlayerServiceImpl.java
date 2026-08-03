package com.auctxi.core.service.impl;

import com.auctxi.core.dto.request.PlayerCreateRequest;
import com.auctxi.core.dto.request.PlayerUpdateRequest;
import com.auctxi.core.dto.response.PageResponse;
import com.auctxi.core.dto.response.PlayerResponse;
import com.auctxi.core.entity.Player;
import com.auctxi.core.entity.PlayerCategory;
import com.auctxi.core.entity.PlayerRole;
import com.auctxi.core.entity.PlayerStatus;
import com.auctxi.core.exception.ResourceNotFoundException;
import com.auctxi.core.repository.PlayerRepository;
import com.auctxi.core.repository.spec.PlayerSpecification;
import com.auctxi.core.service.PlayerService;
import com.auctxi.core.mapper.DtoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.auctxi.core.entity.Role;
import com.auctxi.core.entity.User;
import com.auctxi.core.repository.UserRepository;

/**
 * Implementation of the Player Service.
 *
 * Contains the core logic for the dual-ownership model of players:
 * - Admins create GLOBAL players that any manager can use.
 * - Managers create PRIVATE players that are exclusive to their own leagues.
 */
@Service
@RequiredArgsConstructor
public class PlayerServiceImpl implements PlayerService {

    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;
    private final com.auctxi.core.repository.AuctionPlayerRepository auctionPlayerRepository;
    private final DtoMapper mapper;

    /**
     * Creates a new player. The ownership type (GLOBAL vs PRIVATE) is automatically
     * determined based on the role of the user creating it.
     */
    @Override
    @Transactional
    public PlayerResponse createPlayer(PlayerCreateRequest request, String userId) {
        /*
         STEP 1: Load Creator
         */
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        /*
         STEP 2: Determine Ownership
         Player is always owned by the creator.
         */

        /*
         STEP 3: Build and Save
         */
        Player player = Player.builder()
                .name(request.getName())
                .basePrice(request.getBasePrice())
                .imageUrl(request.getImageUrl())
                .role(request.getRole())
                .category(request.getCategory())
                .isWicketKeeper(request.getIsWicketKeeper() != null ? request.getIsWicketKeeper() : false)
                .statistics(request.getStatistics())
                .createdByUser(creator)
                .build();

        player = playerRepository.save(player);
        PlayerResponse response = mapper.mapToPlayerResponse(player);
        response.setAssignmentStatus("Available"); // newly created is always available
        return response;
    }

    /**
     * Retrieves a single player by their ID.
     */
    @Override
    public PlayerResponse getPlayerById(String id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + id));
        PlayerResponse response = mapper.mapToPlayerResponse(player);
        boolean isAssigned = auctionPlayerRepository.findByPlayerId(player.getId()).stream()
                .anyMatch(ap -> ap.getAuction().getStatus() != com.auctxi.core.entity.AuctionStatus.COMPLETED);
        response.setAssignmentStatus(isAssigned ? "Assigned to Auction" : "Available");
        return response;
    }

    /**
     * Updates an existing player's stats, base price, or category.
     */
    @Override
    @Transactional
    public PlayerResponse updatePlayer(String id, PlayerUpdateRequest request, String currentUserId, Role currentUserRole) {
        /*
         STEP 1: Load Player
         */
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + id));

        validateOwnership(player, currentUserId, currentUserRole);

        /*
         STEP 2: Update Data dynamically
         */
        if (request.getName() != null) player.setName(request.getName());
        if (request.getBasePrice() != null) player.setBasePrice(request.getBasePrice());
        if (request.getImageUrl() != null) player.setImageUrl(request.getImageUrl());
        if (request.getRole() != null) player.setRole(request.getRole());
        if (request.getCategory() != null) player.setCategory(request.getCategory());
        if (request.getIsWicketKeeper() != null) player.setIsWicketKeeper(request.getIsWicketKeeper());
        if (request.getStatistics() != null) player.setStatistics(request.getStatistics());

        /*
         STEP 3: Save Data
         */
        player = playerRepository.save(player);
        PlayerResponse response = mapper.mapToPlayerResponse(player);
        boolean isAssigned = auctionPlayerRepository.findByPlayerId(player.getId()).stream()
                .anyMatch(ap -> ap.getAuction().getStatus() != com.auctxi.core.entity.AuctionStatus.COMPLETED);
        response.setAssignmentStatus(isAssigned ? "Assigned to Auction" : "Available");
        return response;
    }

    /**
     * Hard deletes a player from the database. 
     */
    @Override
    @Transactional
    public void deletePlayer(String id, String currentUserId, Role currentUserRole) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + id));
        
        validateOwnership(player, currentUserId, currentUserRole);

        boolean isInActiveAuction = auctionPlayerRepository.findByPlayerId(id).stream()
                .anyMatch(ap -> ap.getAuction().getStatus() != com.auctxi.core.entity.AuctionStatus.COMPLETED);

        if (isInActiveAuction) {
            throw new IllegalStateException("Cannot delete player. They are currently assigned to an active auction.");
        }
        
        playerRepository.delete(player);
    }

    private void validateOwnership(Player player, String currentUserId, Role currentUserRole) {
        if (currentUserRole == Role.ROLE_MANAGER) {
            if (!player.getCreatedByUser().getId().equals(currentUserId)) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to modify this private player.");
            }
        }
    }

    /**
     * Retrieves a paginated list of players. Crucially, this method enforces
     * the ownership visibility rules so Managers only see GLOBAL players + their own PRIVATE players.
     */
    @Override
    public PageResponse<PlayerResponse> getAllPlayers(String search, PlayerRole role, PlayerCategory category, Pageable pageable, String currentUserId, Role currentUserRole) {
        /*
         STEP 1: Build Visibility Specifications
         The PlayerSpecification.isVisibleTo() method is the core of the ownership logic.
         It ensures that a Manager cannot see another Manager's PRIVATE players.
         */
        Specification<Player> spec = Specification.where(PlayerSpecification.search(search))
                .and(PlayerSpecification.hasRole(role))
                .and(PlayerSpecification.hasCategory(category))
                .and(PlayerSpecification.isVisibleTo(currentUserId, currentUserRole));

        /*
         STEP 2: Execute Query
         */
        Page<Player> playerPage = playerRepository.findAll(spec, pageable);
        
        List<PlayerResponse> content = playerPage.getContent().stream()
                .map(player -> {
                    PlayerResponse response = mapper.mapToPlayerResponse(player);
                    boolean isAssigned = auctionPlayerRepository.findByPlayerId(player.getId()).stream()
                            .anyMatch(ap -> ap.getAuction().getStatus() != com.auctxi.core.entity.AuctionStatus.COMPLETED);
                    response.setAssignmentStatus(isAssigned ? "Assigned to Auction" : "Available");
                    return response;
                })
                .collect(Collectors.toList());

        return PageResponse.<PlayerResponse>builder()
                .content(content)
                .pageNo(playerPage.getNumber())
                .pageSize(playerPage.getSize())
                .totalElements(playerPage.getTotalElements())
                .totalPages(playerPage.getTotalPages())
                .last(playerPage.isLast())
                .build();
    }
}
