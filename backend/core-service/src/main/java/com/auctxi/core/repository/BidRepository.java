package com.auctxi.core.repository;

import com.auctxi.core.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, String> {
    
    Optional<Bid> findTopByAuctionIdAndPlayerIdOrderByAmountDesc(String auctionId, String playerId);
    
    List<Bid> findByAuctionIdAndPlayerIdOrderByCreatedAtDesc(String auctionId, String playerId);
    
    List<Bid> findTop10ByOrderByCreatedAtDesc();
    
    List<Bid> findAllByOrderByCreatedAtDesc();
    
    List<Bid> findByAuctionIdOrderByCreatedAtAsc(String auctionId);
}
