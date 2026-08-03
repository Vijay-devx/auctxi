package com.auctxi.core.service.impl;

import com.auctxi.core.entity.AuctionRuleTemplate;
import com.auctxi.core.entity.User;
import com.auctxi.core.exception.ResourceNotFoundException;
import com.auctxi.core.repository.AuctionRuleTemplateRepository;
import com.auctxi.core.repository.UserRepository;
import com.auctxi.core.service.AuctionRuleTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of the Auction Rule Template Service.
 *
 * This service manages the creation and validation of global rule templates.
 * A critical feature here is the management of the "Default" template - ensuring
 * that exactly one template is marked as default at any given time.
 */
@Service
@RequiredArgsConstructor
public class AuctionRuleTemplateServiceImpl implements AuctionRuleTemplateService {

    private final AuctionRuleTemplateRepository repository;
    private final UserRepository userRepository;

    /**
     * Creates a new rule template.
     */
    @Override
    @Transactional
    public AuctionRuleTemplate createTemplate(AuctionRuleTemplate template, String userId) {
        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        /*
         STEP 1: Validate Business Rules
         Ensure the administrator hasn't entered mathematically impossible rules.
         */
        validateTemplate(template);

        template.setCreatedBy(admin);
        
        /*
         STEP 2: Handle Default Status
         If the admin requested this new template to be the default, we must first
         strip the 'default' status from whichever template currently holds it.
         */
        if (template.isDefault()) {
            clearExistingDefault();
        }

        return repository.save(template);
    }

    /**
     * Updates an existing rule template.
     */
    @Override
    @Transactional
    public AuctionRuleTemplate updateTemplate(String id, AuctionRuleTemplate templateDetails) {
        AuctionRuleTemplate existing = getTemplateById(id);
        
        validateTemplate(templateDetails);

        existing.setName(templateDetails.getName());
        existing.setDescription(templateDetails.getDescription());
        existing.setActive(templateDetails.isActive());
        
        /*
         STEP 1: Handle Default Toggle Logic
         */
        if (templateDetails.isDefault() && !existing.isDefault()) {
            clearExistingDefault();
            existing.setDefault(true);
        } else if (!templateDetails.isDefault() && existing.isDefault()) {
            existing.setDefault(false);
        }

        // --- Standard Field Copying ---
        // Team Rules
        existing.setMaxSquadSize(templateDetails.getMaxSquadSize());
        existing.setMinSquadSize(templateDetails.getMinSquadSize());
        existing.setMaxOverseasPlayers(templateDetails.getMaxOverseasPlayers());
        existing.setMinBatsmen(templateDetails.getMinBatsmen());
        existing.setMinBowlers(templateDetails.getMinBowlers());
        existing.setMinAllRounders(templateDetails.getMinAllRounders());
        existing.setMinWicketKeepers(templateDetails.getMinWicketKeepers());

        // Financial Rules
        existing.setInitialPurse(templateDetails.getInitialPurse());
        existing.setMinBidAmount(templateDetails.getMinBidAmount());
        existing.setBidIncrement(templateDetails.getBidIncrement());
        existing.setMaxBid(templateDetails.getMaxBid());

        // Runtime & Registration
        existing.setBidTimerSeconds(templateDetails.getBidTimerSeconds());
        existing.setAutoSellTimeout(templateDetails.getAutoSellTimeout());
        existing.setAllowUnsoldReentry(templateDetails.isAllowUnsoldReentry());
        existing.setNominationMethod(templateDetails.getNominationMethod());
        existing.setMaxParticipatingTeams(templateDetails.getMaxParticipatingTeams());
        existing.setRegistrationMode(templateDetails.getRegistrationMode());
        existing.setAllowLateRegistration(templateDetails.isAllowLateRegistration());

        // Eligibility
        existing.setAllowOverseas(templateDetails.isAllowOverseas());
        existing.setAllowUncapped(templateDetails.isAllowUncapped());
        existing.setAllowRetired(templateDetails.isAllowRetired());
        existing.setAllowManagerCreatedPlayers(templateDetails.isAllowManagerCreatedPlayers());

        return repository.save(existing);
    }

    /**
     * Deletes a template.
     * Note: Because auctions use a *snapshot* of the rules (AuctionRules), deleting
     * a template here will NOT break any existing or past auctions.
     */
    @Override
    @Transactional
    public void deleteTemplate(String id) {
        AuctionRuleTemplate template = getTemplateById(id);
        repository.delete(template);
    }

    @Override
    public AuctionRuleTemplate getTemplateById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AuctionRuleTemplate not found with id: " + id));
    }

    @Override
    public List<AuctionRuleTemplate> getAllTemplates() {
        return repository.findAll();
    }

    @Override
    public List<AuctionRuleTemplate> getActiveTemplates() {
        return repository.findByIsActiveTrue();
    }

    @Override
    public AuctionRuleTemplate getDefaultTemplate() {
        List<AuctionRuleTemplate> defaults = repository.findByIsDefaultTrue();
        return defaults.isEmpty() ? null : defaults.get(0);
    }

    @Override
    @Transactional
    public AuctionRuleTemplate setDefaultTemplate(String id) {
        clearExistingDefault();
        AuctionRuleTemplate template = getTemplateById(id);
        template.setDefault(true);
        return repository.save(template);
    }

    /**
     * Helper method to ensure only one template is marked as default.
     */
    private void clearExistingDefault() {
        List<AuctionRuleTemplate> existingDefaults = repository.findByIsDefaultTrue();
        existingDefaults.forEach(t -> t.setDefault(false));
        repository.saveAll(existingDefaults);
    }

    /**
     * Critical Business Logic: Prevents administrators from creating illogical rules
     * that would crash the live auction engine later.
     */
    private void validateTemplate(AuctionRuleTemplate t) {
        if (t.getMaxSquadSize() < t.getMinSquadSize()) {
            throw new IllegalArgumentException("Maximum Squad Size must be >= Minimum Squad Size");
        }
        if (t.getBidIncrement().signum() <= 0) {
            throw new IllegalArgumentException("Bid Increment must be > 0");
        }
        if (t.getInitialPurse().signum() <= 0) {
            throw new IllegalArgumentException("Initial Purse must be > 0");
        }
        if (t.getMaxParticipatingTeams() <= 1) {
            throw new IllegalArgumentException("Maximum Teams must be > 1");
        }
        if (t.getBidTimerSeconds() <= 0) {
            throw new IllegalArgumentException("Bid Timer must be > 0");
        }
        if (t.getAutoSellTimeout() <= 0) {
            throw new IllegalArgumentException("Auto Sell Timeout must be > 0");
        }
        if (t.getMaxOverseasPlayers() > t.getMaxSquadSize()) {
            throw new IllegalArgumentException("Overseas Limit cannot exceed Squad Size");
        }
    }
}
