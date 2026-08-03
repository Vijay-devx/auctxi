package com.auctxi.core.repository;

import com.auctxi.core.entity.AuctionRules;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuctionRulesRepository extends JpaRepository<AuctionRules, String> {
    Optional<AuctionRules> findByAuctionId(String auctionId);
}
