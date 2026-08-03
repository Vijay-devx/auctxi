package com.auctxi.core.controller;

import com.auctxi.core.entity.AuctionRuleTemplate;
import com.auctxi.core.security.CustomUserDetails;
import com.auctxi.core.service.AuctionRuleTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing global Auction Rule Templates.
 *
 * Rule Templates are primarily managed by ADMINs. Managers can view (GET)
 * the templates to select them when creating a new auction, but they cannot
 * create, update, or delete the templates.
 */
@RestController
@RequestMapping("/api/v1/rule-templates")
@RequiredArgsConstructor
@Tag(name = "Auction Rule Templates", description = "Endpoints for managing global auction rule templates (Admin only)")
public class AuctionRuleTemplateController {

    private final AuctionRuleTemplateService templateService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Create a new rule template (Admin only)")
    public ResponseEntity<AuctionRuleTemplate> createTemplate(
            @RequestBody AuctionRuleTemplate template,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return new ResponseEntity<>(templateService.createTemplate(template, userDetails.getUser().getId()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Update a rule template (Admin only)")
    public ResponseEntity<AuctionRuleTemplate> updateTemplate(
            @PathVariable String id,
            @RequestBody AuctionRuleTemplate templateDetails) {
        return ResponseEntity.ok(templateService.updateTemplate(id, templateDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Delete a rule template (Admin only)")
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get a rule template by ID")
    public ResponseEntity<AuctionRuleTemplate> getTemplateById(@PathVariable String id) {
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get all rule templates")
    public ResponseEntity<List<AuctionRuleTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get all active rule templates")
    public ResponseEntity<List<AuctionRuleTemplate>> getActiveTemplates() {
        return ResponseEntity.ok(templateService.getActiveTemplates());
    }

    @GetMapping("/default")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get the default rule template")
    public ResponseEntity<AuctionRuleTemplate> getDefaultTemplate() {
        return ResponseEntity.ok(templateService.getDefaultTemplate());
    }

    @PatchMapping("/{id}/default")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Set a rule template as default (Admin only)")
    public ResponseEntity<AuctionRuleTemplate> setDefaultTemplate(@PathVariable String id) {
        return ResponseEntity.ok(templateService.setDefaultTemplate(id));
    }
}
