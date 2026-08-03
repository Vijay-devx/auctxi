package com.auctxi.core.service.impl;

import com.auctxi.core.dto.response.PlayerResponse;
import com.auctxi.core.entity.Player;
import com.auctxi.core.entity.User;
import com.auctxi.core.entity.Watchlist;
import com.auctxi.core.exception.ResourceNotFoundException;
import com.auctxi.core.mapper.DtoMapper;
import com.auctxi.core.repository.PlayerRepository;
import com.auctxi.core.repository.UserRepository;
import com.auctxi.core.repository.WatchlistRepository;
import com.auctxi.core.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatchlistServiceImpl implements WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;
    private final DtoMapper mapper;

    @Override
    public List<PlayerResponse> getMyWatchlist(String userId) {
        return watchlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(Watchlist::getPlayer)
                .map(mapper::mapToPlayerResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addPlayerToWatchlist(String userId, String playerId) {
        if (watchlistRepository.existsByUserIdAndPlayerId(userId, playerId)) {
            return; // Already watchlisted
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + playerId));

        Watchlist watchlist = Watchlist.builder()
                .user(user)
                .player(player)
                .build();

        watchlistRepository.save(watchlist);
    }

    @Override
    @Transactional
    public void removePlayerFromWatchlist(String userId, String playerId) {
        watchlistRepository.deleteByUserIdAndPlayerId(userId, playerId);
    }

    @Override
    public boolean isPlayerWatchlisted(String userId, String playerId) {
        return watchlistRepository.existsByUserIdAndPlayerId(userId, playerId);
    }
}
