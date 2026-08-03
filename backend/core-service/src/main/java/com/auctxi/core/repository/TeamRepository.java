package com.auctxi.core.repository;

import com.auctxi.core.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, String> {
    Optional<Team> findByName(String name);
    boolean existsByName(String name);
    boolean existsByShortName(String shortName);
    boolean existsByAuctionAndName(com.auctxi.core.entity.Auction auction, String name);
    boolean existsByAuctionAndShortName(com.auctxi.core.entity.Auction auction, String shortName);
    long countByAuction(com.auctxi.core.entity.Auction auction);
    
    java.util.List<Team> findByAuctionId(String auctionId);
    Optional<Team> findByOwnerClientIdAndAuctionId(String ownerClientId, String auctionId);
    java.util.List<Team> findByOwnerClientId(String ownerClientId);
}
