package com.auctxi.core.event.listener;

import com.auctxi.core.entity.Player;
import com.auctxi.core.entity.Team;
import com.auctxi.core.entity.User;
import com.auctxi.core.event.PlayerSoldEvent;
import com.auctxi.core.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;

    // Use TransactionalEventListener to only trigger if the sellPlayer transaction successfully commits!
    @Async
    @TransactionalEventListener
    public void handlePlayerSoldEvent(PlayerSoldEvent event) {
        Player player = event.getPlayer();
        Team team = event.getTeam();
        BigDecimal amount = event.getAmount();

        log.info("Received PlayerSoldEvent for player: {} sold to team: {}", player.getName(), team.getName());

        User teamOwner = team.getOwnerClient();
        if (teamOwner != null) {
            String title = "Player Acquired: " + player.getName();
            String message = String.format("Congratulations! Your team '%s' successfully acquired '%s' for $%.2f.",
                    team.getOwnerClient().getEmail(), player.getName(), amount);

            // 1. Save In-App Notification
            notificationService.createNotification(teamOwner.getId(), title, message, null);
        }
    }
}
