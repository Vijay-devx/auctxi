package com.auctxi.core.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "auction_players", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"auction_id", "player_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Auction auction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Player player;

    @Column(nullable = false)
    private BigDecimal basePrice;

    private Integer auctionOrder;

    private BigDecimal soldPrice;

    @Column(nullable = false)
    @Builder.Default
    private int unsoldRetries = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PlayerStatus soldStatus = PlayerStatus.AVAILABLE;

    private BigDecimal currentBid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winning_team_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Team winningTeam;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
