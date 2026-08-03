package com.auctxi.core.controller;

import com.auctxi.core.entity.PlayerCategory;
import com.auctxi.core.entity.PlayerRole;
import com.auctxi.core.entity.PlayerStatus;
import com.auctxi.core.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Endpoints for generating and downloading CSV and PDF reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/players")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Export a filtered list of players as a PDF or CSV")
    public ResponseEntity<byte[]> exportPlayerReport(
            @RequestParam(defaultValue = "pdf") String format,
            @RequestParam(required = false) PlayerRole role,
            @RequestParam(required = false) PlayerCategory category,
            @RequestParam(required = false) PlayerStatus status) {

        byte[] report = reportService.exportPlayerReport(format, role, category, status);
        return createFileResponse(report, "player_report", format);
    }

    @GetMapping("/teams")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Export a Team Revenue report showing budget vs spent")
    public ResponseEntity<byte[]> exportTeamRevenueReport(
            @RequestParam(defaultValue = "pdf") String format) {

        byte[] report = reportService.exportTeamRevenueReport(format);
        return createFileResponse(report, "team_revenue_report", format);
    }

    @GetMapping("/auction/{auctionId}/data")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Get comprehensive auction report data as JSON")
    public ResponseEntity<com.auctxi.core.dto.response.AuctionReportResponse> getAuctionReportData(
            @PathVariable String auctionId) {
        return ResponseEntity.ok(reportService.getAuctionReportData(auctionId));
    }

    @GetMapping("/auction/{auctionId}/download")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    @Operation(summary = "Export a comprehensive auction report as PDF or CSV")
    public ResponseEntity<byte[]> exportAuctionReport(
            @PathVariable String auctionId,
            @RequestParam(defaultValue = "pdf") String format) {

        byte[] report = reportService.exportAuctionReport(format, auctionId);
        return createFileResponse(report, "auction_report_" + auctionId, format);
    }

    private ResponseEntity<byte[]> createFileResponse(byte[] data, String fileNamePrefix, String format) {
        boolean isCsv = "csv".equalsIgnoreCase(format);
        String extension = isCsv ? ".csv" : ".pdf";
        MediaType mediaType = isCsv ? MediaType.parseMediaType("text/csv") : MediaType.APPLICATION_PDF;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileNamePrefix + extension)
                .contentType(mediaType)
                .body(data);
    }
}
