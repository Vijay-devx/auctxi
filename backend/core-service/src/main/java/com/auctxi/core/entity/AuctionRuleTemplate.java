package com.auctxi.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Represents a Global Rules Template created by a System Administrator.
 *
 * ARCHITECTURAL PATTERN: Template vs Snapshot
 * This class acts purely as a "blueprint". When a Manager creates a new Auction,
 * they select a RuleTemplate. The system then copies (snapshots) every field from
 * this template into a new 'AuctionRules' entity tied exclusively to that auction.
 *
 * Why? If an Admin deletes or modifies a RuleTemplate, it guarantees that
 * active or historical auctions are not corrupted, because they rely on their own snapshot.
 */
@Entity
@Table(name = "auction_rule_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionRuleTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private boolean isDefault = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
