package com.auctxi.core.service;

import com.auctxi.core.dto.request.PlayerCreateRequest;
import com.auctxi.core.dto.request.PlayerUpdateRequest;
import com.auctxi.core.dto.response.PageResponse;
import com.auctxi.core.dto.response.PlayerResponse;
import com.auctxi.core.entity.PlayerCategory;
import com.auctxi.core.entity.PlayerRole;

import org.springframework.data.domain.Pageable;

import com.auctxi.core.entity.Role;

public interface PlayerService {

    PlayerResponse createPlayer(PlayerCreateRequest request, String userId);

    PlayerResponse getPlayerById(String id);

    PlayerResponse updatePlayer(String id, PlayerUpdateRequest request, String currentUserId, Role currentUserRole);

    void deletePlayer(String id, String currentUserId, Role currentUserRole);

    PageResponse<PlayerResponse> getAllPlayers(String search, PlayerRole role, PlayerCategory category, Pageable pageable, String currentUserId, Role currentUserRole);
}
