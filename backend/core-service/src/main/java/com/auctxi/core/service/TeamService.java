package com.auctxi.core.service;

import com.auctxi.core.dto.request.TeamCreateRequest;
import com.auctxi.core.dto.request.TeamUpdateRequest;
import com.auctxi.core.dto.response.TeamResponse;

import java.util.List;

public interface TeamService {

    TeamResponse getTeamById(String id);

    TeamResponse updateTeam(String id, TeamUpdateRequest request, com.auctxi.core.entity.User currentUser);

    void deleteTeam(String id);

    List<TeamResponse> getAllTeams();
    
    List<TeamResponse> getTeamsByAuctionId(String auctionId);
}
