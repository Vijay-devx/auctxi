package com.auctxi.core.repository;

import com.auctxi.core.entity.AuctionPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuctionPlayerRepository extends JpaRepository<AuctionPlayer, String> {
    
    List<AuctionPlayer> findByAuctionId(String auctionId);
    
    List<AuctionPlayer> findByPlayerId(String playerId);
    
    java.util.Optional<AuctionPlayer> findByAuctionIdAndPlayerId(String auctionId, String playerId);
    
    boolean existsByAuctionIdAndPlayerId(String auctionId, String playerId);
    
    java.util.Optional<AuctionPlayer> findFirstByAuctionIdAndSoldStatusOrderByAuctionOrderAsc(String auctionId, com.auctxi.core.entity.PlayerStatus soldStatus);
    
    List<AuctionPlayer> findByAuctionIdAndSoldStatus(String auctionId, com.auctxi.core.entity.PlayerStatus soldStatus);
}
