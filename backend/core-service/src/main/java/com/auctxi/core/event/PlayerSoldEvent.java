package com.auctxi.core.event;

import com.auctxi.core.entity.Player;
import com.auctxi.core.entity.Team;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.math.BigDecimal;

@Getter
public class PlayerSoldEvent extends ApplicationEvent {

    private final Player player;
    private final Team team;
    private final BigDecimal amount;

    public PlayerSoldEvent(Object source, Player player, Team team, BigDecimal amount) {
        super(source);
        this.player = player;
        this.team = team;
        this.amount = amount;
    }
}
