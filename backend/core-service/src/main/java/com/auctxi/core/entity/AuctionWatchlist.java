package com.auctxi.core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "auction_watchlists",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "auction_id"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionWatchlist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
