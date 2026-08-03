package com.auctxi.core.dto.request;

import com.auctxi.core.entity.NominationMethod;
import com.auctxi.core.entity.RegistrationMode;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AuctionRulesRequest {
    private String templateId;

    // Team Rules
    private int maxSquadSize;
    private int minSquadSize;
    private int maxOverseasPlayers;
    private int minBatsmen;
    private int minBowlers;
    private int minAllRounders;
    private int minWicketKeepers;

    // Financial Rules
    private BigDecimal initialPurse;
    private BigDecimal minBidAmount;
    private BigDecimal bidIncrement;
    private BigDecimal maxBid;

    // Auction Runtime Rules
    private int bidTimerSeconds;
    private int autoSellTimeout;
    private boolean allowUnsoldReentry;
    private NominationMethod nominationMethod;

    // Registration Rules
    private int maxParticipatingTeams;
    private RegistrationMode registrationMode;
    private boolean allowLateRegistration;
    private BigDecimal registrationFee;

    // Player Eligibility Rules
    private boolean allowOverseas;
    private boolean allowUncapped;
    private boolean allowRetired;
    private boolean allowManagerCreatedPlayers;
}
