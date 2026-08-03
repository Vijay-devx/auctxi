package com.auctxi.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents the live, concrete rules for a specific Auction.
 *
 * ARCHITECTURAL PATTERN: Template vs Snapshot
 * This entity is a "Snapshot". It is created by copying values from an
 * AuctionRuleTemplate at the exact moment an Auction is created.
 *
 * It is mapped OneToOne with an Auction. Unlike the global Template, this
 * entity can potentially be modified by the Auction Manager (if allowed) without
 * affecting global platform rules.
 */
@Entity
@Table(name = "auction_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "auction")
@EqualsAndHashCode(exclude = "auction")
public class AuctionRules {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false, unique = true)
    private Auction auction;

    @Column(name = "created_from_template_id")
    private String createdFromTemplateId; // Just an ID reference, no strict foreign key

    // --- Team Rules ---
    @Column(nullable = false)
    private int maxSquadSize;

    @Column(nullable = false)
    private int minSquadSize;

    @Column(nullable = false)
    private int maxOverseasPlayers;

    @Column(nullable = false)
    private int minBatsmen;

    @Column(nullable = false)
    private int minBowlers;

    @Column(nullable = false)
    private int minAllRounders;

    @Column(nullable = false)
    private int minWicketKeepers;

    // --- Financial Rules ---
    @Column(nullable = false)
    private BigDecimal initialPurse;

    @Column(nullable = false)
    private BigDecimal minBidAmount;

    @Column(nullable = false)
    private BigDecimal bidIncrement;

    private BigDecimal maxBid; // Optional

    // --- Auction Runtime Rules ---
    @Column(nullable = false)
    private int bidTimerSeconds;

    @Column(nullable = false)
    private int autoSellTimeout;

    @Column(nullable = false)
    @Builder.Default
    private boolean allowUnsoldReentry = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NominationMethod nominationMethod = NominationMethod.MANAGER_SELECTION;

    // --- Registration Rules ---
    @Column(nullable = false)
    private int maxParticipatingTeams;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RegistrationMode registrationMode = RegistrationMode.MANAGER_APPROVAL;

    @Column(nullable = false)
    @Builder.Default
    private boolean allowLateRegistration = false;

    @Column(nullable = true)
    private BigDecimal registrationFee;

    // --- Player Eligibility Rules ---
    @Column(nullable = false)
    @Builder.Default
    private boolean allowOverseas = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean allowUncapped = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean allowRetired = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean allowManagerCreatedPlayers = true;

    // --- Meta ---
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
