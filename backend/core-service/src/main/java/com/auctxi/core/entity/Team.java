package com.auctxi.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a Team (franchise) within a specific Auction.
 *
 * A Team is tightly coupled to an Auction (ManyToOne). It has a budget, a remaining purse,
 * and maintains a list of Players (OneToMany) that have been successfully bid on.
 *
 * Note the use of @ToString.Exclude and @EqualsAndHashCode.Exclude on the
 * 'auction' and 'players' fields. This prevents infinite recursion loops when
 * Hibernate attempts to serialize bidirectional relationships.
 */
@Entity
@Table(name = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 10)
    private String shortName;

    private String logoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_client_id")
    private User ownerClient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Auction auction;

    @Column(nullable = false)
    private BigDecimal totalBudget;

    @Column(nullable = false)
    private BigDecimal remainingPurse;

    @OneToMany(mappedBy = "winningTeam", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<AuctionPlayer> auctionPlayers = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
