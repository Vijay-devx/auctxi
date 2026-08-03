package com.auctxi.core.service;

import com.auctxi.core.entity.AuctionRuleTemplate;
import java.util.List;

public interface AuctionRuleTemplateService {
    AuctionRuleTemplate createTemplate(AuctionRuleTemplate template, String userId);
    AuctionRuleTemplate updateTemplate(String id, AuctionRuleTemplate templateDetails);
    void deleteTemplate(String id);
    AuctionRuleTemplate getTemplateById(String id);
    List<AuctionRuleTemplate> getAllTemplates();
    List<AuctionRuleTemplate> getActiveTemplates();
    AuctionRuleTemplate getDefaultTemplate();
    AuctionRuleTemplate setDefaultTemplate(String id);
}
