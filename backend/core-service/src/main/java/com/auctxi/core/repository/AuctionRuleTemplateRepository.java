package com.auctxi.core.repository;

import com.auctxi.core.entity.AuctionRuleTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionRuleTemplateRepository extends JpaRepository<AuctionRuleTemplate, String> {
    List<AuctionRuleTemplate> findByIsActiveTrue();
    List<AuctionRuleTemplate> findByIsDefaultTrue();
}
