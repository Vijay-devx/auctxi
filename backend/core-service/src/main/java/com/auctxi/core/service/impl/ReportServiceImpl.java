package com.auctxi.core.service.impl;

import com.auctxi.core.entity.*;
import com.auctxi.core.repository.AuctionRepository;
import com.auctxi.core.repository.PlayerRepository;
import com.auctxi.core.repository.TeamRepository;
import com.auctxi.core.service.ReportService;
import com.auctxi.core.repository.spec.PlayerSpecification;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.util.List;
import com.auctxi.core.repository.AuctionPlayerRepository;
import com.auctxi.core.repository.BidRepository;
import com.auctxi.core.dto.response.AuctionReportResponse;
import com.auctxi.core.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final AuctionRepository auctionRepository;
    private final AuctionPlayerRepository auctionPlayerRepository;
    private final BidRepository bidRepository;

    @Override
    public byte[] exportPlayerReport(String format, PlayerRole role, PlayerCategory category, PlayerStatus status) {
        Specification<Player> spec = Specification.where((Specification<Player>) null);
        if (role != null) spec = spec.and(PlayerSpecification.hasRole(role));
        if (category != null) spec = spec.and(PlayerSpecification.hasCategory(category));

        List<Player> players = playerRepository.findAll(spec);

        if ("csv".equalsIgnoreCase(format)) {
            return generatePlayerCsv(players);
        } else {
            return generatePlayerPdf(players);
        }
    }

    @Override
    public byte[] exportTeamRevenueReport(String format) {
        List<Team> teams = teamRepository.findAll();

        if ("csv".equalsIgnoreCase(format)) {
            return generateTeamCsv(teams);
        } else {
            return generateTeamPdf(teams);
        }
    }

    @Override
    public AuctionReportResponse getAuctionReportData(String auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found"));

        List<Team> teams = teamRepository.findByAuctionId(auctionId);
        List<AuctionReportResponse.TeamSummary> teamSummaries = teams.stream().map(t -> {
            long playersBought = auctionPlayerRepository.findByAuctionIdAndSoldStatus(auctionId, PlayerStatus.SOLD)
                    .stream()
                    .filter(ap -> ap.getWinningTeam() != null && ap.getWinningTeam().getId().equals(t.getId()))
                    .count();
            return AuctionReportResponse.TeamSummary.builder()
                    .teamId(t.getId())
                    .teamName(t.getName())
                    .shortName(t.getShortName())
                    .totalBudget(t.getTotalBudget())
                    .remainingPurse(t.getRemainingPurse())
                    .moneySpent(t.getTotalBudget().subtract(t.getRemainingPurse()))
                    .playersBought((int) playersBought)
                    .build();
        }).collect(java.util.stream.Collectors.toList());

        List<AuctionPlayer> soldPlayers = auctionPlayerRepository.findByAuctionIdAndSoldStatus(auctionId, PlayerStatus.SOLD);
        List<AuctionReportResponse.SoldPlayerSummary> soldPlayerSummaries = soldPlayers.stream().map(ap -> 
            AuctionReportResponse.SoldPlayerSummary.builder()
                    .playerId(ap.getPlayer().getId())
                    .playerName(ap.getPlayer().getName())
                    .winningTeamName(ap.getWinningTeam() != null ? ap.getWinningTeam().getName() : "Unknown")
                    .soldPrice(ap.getSoldPrice())
                    .soldAt(ap.getUpdatedAt())
                    .build()
        ).collect(java.util.stream.Collectors.toList());

        List<Bid> bids = bidRepository.findByAuctionIdOrderByCreatedAtAsc(auctionId);
        List<AuctionReportResponse.BidHistorySummary> bidHistories = bids.stream().map(b -> 
            AuctionReportResponse.BidHistorySummary.builder()
                    .bidId(b.getId())
                    .playerName(b.getPlayer().getPlayer().getName())
                    .teamName(b.getTeam().getName())
                    .bidAmount(b.getAmount())
                    .bidTime(b.getCreatedAt())
                    .build()
        ).collect(java.util.stream.Collectors.toList());

        return AuctionReportResponse.builder()
                .auctionId(auction.getId())
                .auctionName(auction.getName())
                .auctionDate(auction.getCreatedAt())
                .teams(teamSummaries)
                .soldPlayers(soldPlayerSummaries)
                .bidHistory(bidHistories)
                .build();
    }

    @Override
    public byte[] exportAuctionReport(String format, String auctionId) {
        AuctionReportResponse data = getAuctionReportData(auctionId);
        
        if ("csv".equalsIgnoreCase(format)) {
            // For simplicity, we just return the teams CSV if CSV is requested for the auction
            return generateTeamCsv(teamRepository.findByAuctionId(auctionId));
        } else {
            return generateAuctionPdf(data);
        }
    }

    private byte[] generateAuctionPdf(AuctionReportResponse data) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            fontTitle.setSize(18);
            Paragraph p = new Paragraph("Auction Report: " + data.getAuctionName(), fontTitle);
            p.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(p);
            document.add(new Paragraph(" "));

            Font fontSubTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            fontSubTitle.setSize(14);
            
            // 1. Teams Summary
            document.add(new Paragraph("Teams Summary", fontSubTitle));
            document.add(new Paragraph(" "));
            PdfPTable teamTable = new PdfPTable(5);
            teamTable.setWidthPercentage(100f);
            teamTable.setWidths(new float[]{3.0f, 2.0f, 2.5f, 2.5f, 2.5f});
            String[] teamHeaders = {"Team Name", "Short Name", "Total Budget", "Remaining Purse", "Money Spent"};
            addHeaders(teamTable, teamHeaders);
            for (AuctionReportResponse.TeamSummary t : data.getTeams()) {
                teamTable.addCell(t.getTeamName());
                teamTable.addCell(t.getShortName());
                teamTable.addCell(t.getTotalBudget().toString());
                teamTable.addCell(t.getRemainingPurse().toString());
                teamTable.addCell(t.getMoneySpent().toString());
            }
            document.add(teamTable);
            document.add(new Paragraph(" "));

            // 2. Sold Players
            document.add(new Paragraph("Sold Players", fontSubTitle));
            document.add(new Paragraph(" "));
            PdfPTable playerTable = new PdfPTable(3);
            playerTable.setWidthPercentage(100f);
            playerTable.setWidths(new float[]{4.0f, 4.0f, 2.0f});
            String[] playerHeaders = {"Player Name", "Winning Team", "Sold Price"};
            addHeaders(playerTable, playerHeaders);
            for (AuctionReportResponse.SoldPlayerSummary pSummary : data.getSoldPlayers()) {
                playerTable.addCell(pSummary.getPlayerName());
                playerTable.addCell(pSummary.getWinningTeamName());
                playerTable.addCell(pSummary.getSoldPrice() != null ? pSummary.getSoldPrice().toString() : "N/A");
            }
            document.add(playerTable);
            document.add(new Paragraph(" "));

            // 3. Bid History
            document.add(new Paragraph("Bid History", fontSubTitle));
            document.add(new Paragraph(" "));
            PdfPTable bidTable = new PdfPTable(4);
            bidTable.setWidthPercentage(100f);
            bidTable.setWidths(new float[]{3.0f, 3.0f, 2.0f, 3.0f});
            String[] bidHeaders = {"Player", "Team", "Amount", "Time"};
            addHeaders(bidTable, bidHeaders);
            for (AuctionReportResponse.BidHistorySummary b : data.getBidHistory()) {
                bidTable.addCell(b.getPlayerName());
                bidTable.addCell(b.getTeamName());
                bidTable.addCell(b.getBidAmount().toString());
                bidTable.addCell(b.getBidTime().toString());
            }
            document.add(bidTable);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Auction PDF", e);
        }
    }

    private void addHeaders(PdfPTable table, String[] headers) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(5);
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        for (String header : headers) {
            cell.setPhrase(new Phrase(header, font));
            table.addCell(cell);
        }
    }

    // --- CSV Generators ---

    private byte[] generatePlayerCsv(List<Player> players) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(baos);
             CSVWriter writer = new CSVWriter(osw)) {

            String[] header = {"Name", "Role", "Category", "Status", "Base Price", "Team"};
            writer.writeNext(header);

            for (Player p : players) {
                String teamName = "N/A";
                String[] data = {
                        p.getName(),
                        p.getRole().name(),
                        p.getCategory().name(),
                        "N/A",
                        p.getBasePrice().toString(),
                        teamName
                };
                writer.writeNext(data);
            }
            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Player CSV", e);
        }
    }

    private byte[] generateTeamCsv(List<Team> teams) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(baos);
             CSVWriter writer = new CSVWriter(osw)) {

            String[] header = {"Team Name", "Short Name", "Total Budget", "Remaining Purse", "Money Spent"};
            writer.writeNext(header);

            for (Team t : teams) {
                String spent = t.getTotalBudget().subtract(t.getRemainingPurse()).toString();
                String[] data = {
                        t.getName(),
                        t.getShortName(),
                        t.getTotalBudget().toString(),
                        t.getRemainingPurse().toString(),
                        spent
                };
                writer.writeNext(data);
            }
            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Team CSV", e);
        }
    }

    // --- PDF Generators ---

    private byte[] generatePlayerPdf(List<Player> players) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            fontTitle.setSize(18);
            Paragraph p = new Paragraph("Player Report", fontTitle);
            p.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(p);
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100f);
            table.setWidths(new float[]{3.0f, 2.0f, 2.0f, 2.0f, 2.0f, 2.5f});
            table.setSpacingBefore(10);

            writePlayerTableHeader(table);
            writePlayerTableData(table, players);

            document.add(table);
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Player PDF", e);
        }
    }

    private byte[] generateTeamPdf(List<Team> teams) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            fontTitle.setSize(18);
            Paragraph p = new Paragraph("Team & Revenue Report", fontTitle);
            p.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(p);
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100f);
            table.setWidths(new float[]{3.0f, 2.0f, 2.5f, 2.5f, 2.5f});
            table.setSpacingBefore(10);

            writeTeamTableHeader(table);
            writeTeamTableData(table, teams);

            document.add(table);
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Team PDF", e);
        }
    }

    private void writePlayerTableHeader(PdfPTable table) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(5);
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);

        String[] headers = {"Name", "Role", "Category", "Status", "Base Price", "Team"};
        for (String header : headers) {
            cell.setPhrase(new Phrase(header, font));
            table.addCell(cell);
        }
    }

    private void writePlayerTableData(PdfPTable table, List<Player> players) {
        for (Player player : players) {
            table.addCell(player.getName());
            table.addCell(player.getRole().name());
            table.addCell(player.getCategory().name());
            table.addCell("N/A");
            table.addCell(player.getBasePrice().toString());
            table.addCell("N/A");
        }
    }

    private void writeTeamTableHeader(PdfPTable table) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(5);
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD);

        String[] headers = {"Team Name", "Short Name", "Total Budget", "Remaining Purse", "Money Spent"};
        for (String header : headers) {
            cell.setPhrase(new Phrase(header, font));
            table.addCell(cell);
        }
    }

    private void writeTeamTableData(PdfPTable table, List<Team> teams) {
        for (Team t : teams) {
            table.addCell(t.getName());
            table.addCell(t.getShortName());
            table.addCell(t.getTotalBudget().toString());
            table.addCell(t.getRemainingPurse().toString());
            table.addCell(t.getTotalBudget().subtract(t.getRemainingPurse()).toString());
        }
    }
}
