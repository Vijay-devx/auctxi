package com.auctxi.core.service;

import com.auctxi.core.entity.PlayerCategory;
import com.auctxi.core.entity.PlayerRole;
import com.auctxi.core.entity.PlayerStatus;

public interface ReportService {

    byte[] exportPlayerReport(String format, PlayerRole role, PlayerCategory category, PlayerStatus status);

    byte[] exportTeamRevenueReport(String format);

    byte[] exportAuctionReport(String format, String auctionId);

    com.auctxi.core.dto.response.AuctionReportResponse getAuctionReportData(String auctionId);
}
