package com.auctxi.core.repository;

import com.auctxi.core.entity.AuctionInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionInvitationRepository extends JpaRepository<AuctionInvitation, String> {
    List<AuctionInvitation> findByAuction(com.auctxi.core.entity.Auction auction);
    List<AuctionInvitation> findByInvitedClient(com.auctxi.core.entity.User invitedClient);
    boolean existsByAuctionAndInvitedClient(com.auctxi.core.entity.Auction auction, com.auctxi.core.entity.User invitedClient);
}
