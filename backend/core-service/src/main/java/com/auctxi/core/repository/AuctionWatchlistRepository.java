package com.auctxi.core.repository;

import com.auctxi.core.entity.AuctionWatchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionWatchlistRepository extends JpaRepository<AuctionWatchlist, String> {
    List<AuctionWatchlist> findByUserId(String userId);
    Optional<AuctionWatchlist> findByUserIdAndAuctionId(String userId, String auctionId);
    boolean existsByUserIdAndAuctionId(String userId, String auctionId);
    void deleteByUserIdAndAuctionId(String userId, String auctionId);
}
