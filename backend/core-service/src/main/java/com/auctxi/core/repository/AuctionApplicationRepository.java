package com.auctxi.core.repository;

import com.auctxi.core.entity.AuctionApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionApplicationRepository extends JpaRepository<AuctionApplication, String> {
    List<AuctionApplication> findByAuctionId(String auctionId);
    List<AuctionApplication> findByAuction(com.auctxi.core.entity.Auction auction);
    List<AuctionApplication> findByClient(com.auctxi.core.entity.User client);
    boolean existsByAuctionAndClient(com.auctxi.core.entity.Auction auction, com.auctxi.core.entity.User client);
}
