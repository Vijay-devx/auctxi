package com.auctxi.core.repository;

import com.auctxi.core.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, String> {
    
    List<Watchlist> findByUserIdOrderByCreatedAtDesc(String userId);
    
    Optional<Watchlist> findByUserIdAndPlayerId(String userId, String playerId);
    
    boolean existsByUserIdAndPlayerId(String userId, String playerId);
    
    void deleteByUserIdAndPlayerId(String userId, String playerId);
}
