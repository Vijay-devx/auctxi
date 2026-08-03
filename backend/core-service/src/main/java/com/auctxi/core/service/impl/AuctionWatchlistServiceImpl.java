package com.auctxi.core.service.impl;

import com.auctxi.core.dto.response.AuctionResponse;
import com.auctxi.core.entity.Auction;
import com.auctxi.core.entity.AuctionWatchlist;
import com.auctxi.core.entity.User;
import com.auctxi.core.exception.ResourceNotFoundException;
import com.auctxi.core.mapper.DtoMapper;
import com.auctxi.core.repository.AuctionRepository;
import com.auctxi.core.repository.AuctionWatchlistRepository;
import com.auctxi.core.repository.UserRepository;
import com.auctxi.core.service.AuctionWatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuctionWatchlistServiceImpl implements AuctionWatchlistService {

    private final AuctionWatchlistRepository auctionWatchlistRepository;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final DtoMapper mapper;

    @Override
    @Transactional
    public void addAuctionToWatchlist(String userId, String auctionId) {
        if (auctionWatchlistRepository.existsByUserIdAndAuctionId(userId, auctionId)) {
            return; // Already watchlisted
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        AuctionWatchlist watchlist = AuctionWatchlist.builder()
                .user(user)
                .auction(auction)
                .build();

        auctionWatchlistRepository.save(watchlist);
    }

    @Override
    @Transactional
    public void removeAuctionFromWatchlist(String userId, String auctionId) {
        auctionWatchlistRepository.deleteByUserIdAndAuctionId(userId, auctionId);
    }

    @Override
    public boolean isAuctionWatchlisted(String userId, String auctionId) {
        return auctionWatchlistRepository.existsByUserIdAndAuctionId(userId, auctionId);
    }

    @Override
    public List<AuctionResponse> getMyWatchlistedAuctions(String userId) {
        return auctionWatchlistRepository.findByUserId(userId).stream()
                .map(AuctionWatchlist::getAuction)
                .map(mapper::mapToAuctionResponse)
                .collect(Collectors.toList());
    }
}
