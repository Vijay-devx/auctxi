package com.auctxi.core.controller;

import com.auctxi.core.dto.request.AuctionApplicationRequest;
import com.auctxi.core.dto.response.AuctionApplicationResponse;
import com.auctxi.core.security.CustomUserDetails;
import com.auctxi.core.service.AuctionApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Auction Applications", description = "Endpoints for managing team applications to auctions")
public class AuctionApplicationController {

    private final AuctionApplicationService applicationService;

    @PostMapping("/auction/{auctionId}")
    @Operation(summary = "Apply to participate in an auction")
    public ResponseEntity<AuctionApplicationResponse> applyForAuction(
            @PathVariable String auctionId,
            @Valid @RequestBody AuctionApplicationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return new ResponseEntity<>(applicationService.applyForAuction(auctionId, userDetails.getUser().getId(), request), HttpStatus.CREATED);
    }

    @PostMapping("/{applicationId}/approve")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Approve an application and create the team")
    public ResponseEntity<AuctionApplicationResponse> approveApplication(
            @PathVariable String applicationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.approveApplication(applicationId, userDetails.getUser().getId()));
    }

    @PostMapping("/{applicationId}/reject")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Reject an application")
    public ResponseEntity<AuctionApplicationResponse> rejectApplication(
            @PathVariable String applicationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.rejectApplication(applicationId, userDetails.getUser().getId()));
    }

    @GetMapping("/auction/{auctionId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get all applications for a specific auction")
    public ResponseEntity<List<AuctionApplicationResponse>> getApplicationsForAuction(@PathVariable String auctionId) {
        return ResponseEntity.ok(applicationService.getApplicationsForAuction(auctionId));
    }

    @GetMapping("/my-applications")
    @Operation(summary = "Get all applications submitted by the current user")
    public ResponseEntity<List<AuctionApplicationResponse>> getMyApplications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getApplicationsByUser(userDetails.getUser().getId()));
    }
}
