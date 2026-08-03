package com.auctxi.core.controller.ai;

import com.auctxi.core.dto.ai.AdminContextResponse;
import com.auctxi.core.dto.ai.ClientContextResponse;
import com.auctxi.core.dto.ai.ManagerContextResponse;
import com.auctxi.core.service.ai.AIContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/ai")
@RequiredArgsConstructor
public class InternalAIController {

    private final AIContextService aiContextService;
    private final com.auctxi.core.service.TeamService teamService;
    private final com.auctxi.core.service.AuctionService auctionService;
    private final com.auctxi.core.service.BiddingService biddingService;
    private final com.auctxi.core.repository.AuctionPlayerRepository auctionPlayerRepository;

    @GetMapping("/client-context")
    public ResponseEntity<ClientContextResponse> getClientContext(
            @RequestParam String userId,
            @RequestParam(required = false) String auctionId) {
        // Assume security is handled at gateway or via internal network routing
        ClientContextResponse context = aiContextService.getClientContext(userId, auctionId);
        return ResponseEntity.ok(context);
    }

    @GetMapping("/manager-context")
    public ResponseEntity<ManagerContextResponse> getManagerContext(
            @RequestParam String userId,
            @RequestParam(required = false) String auctionId) {
        ManagerContextResponse context = aiContextService.getManagerContext(userId, auctionId);
        return ResponseEntity.ok(context);
    }

    @GetMapping("/admin-context")
    public ResponseEntity<AdminContextResponse> getAdminContext(
            @RequestParam String userId) {
        AdminContextResponse context = aiContextService.getAdminContext(userId);
        return ResponseEntity.ok(context);
    }

    @GetMapping("/auction-teams")
    public ResponseEntity<java.util.List<com.auctxi.core.dto.response.TeamResponse>> getAuctionTeams(@RequestParam String auctionId) {
        return ResponseEntity.ok(teamService.getTeamsByAuctionId(auctionId));
    }

    @GetMapping("/auction-bids")
    public ResponseEntity<?> getAuctionBids(@RequestParam(required = false) String auctionId) {
        if (auctionId == null || auctionId.isEmpty()) {
            return ResponseEntity.ok(biddingService.getAllBids());
        }
        com.auctxi.core.dto.response.AuctionResponse auction = auctionService.getAuctionById(auctionId);
        if (auction.getCurrentPlayer() == null) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        return ResponseEntity.ok(biddingService.getBidHistory(auctionId, auction.getCurrentPlayer().getId()));
    }

    @GetMapping("/auction-players")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getAuctionPlayers(@RequestParam String auctionId) {
        java.util.List<com.auctxi.core.entity.AuctionPlayer> auctionPlayers = auctionPlayerRepository.findByAuctionId(auctionId);
        java.util.List<java.util.Map<String, Object>> result = auctionPlayers.stream().map(ap -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("playerId", ap.getPlayer().getId());
            map.put("name", ap.getPlayer().getName());
            map.put("role", ap.getPlayer().getRole());
            map.put("category", ap.getPlayer().getCategory());
            map.put("basePrice", ap.getBasePrice());
            map.put("soldStatus", ap.getSoldStatus());
            map.put("soldPrice", ap.getSoldPrice());
            if (ap.getWinningTeam() != null) {
                map.put("winningTeamName", ap.getWinningTeam().getName());
            }
            return map;
        }).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
