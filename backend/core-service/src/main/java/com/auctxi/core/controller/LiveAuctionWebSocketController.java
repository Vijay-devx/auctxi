package com.auctxi.core.controller;

import com.auctxi.core.dto.BidMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
public class LiveAuctionWebSocketController {

    @MessageMapping("/auction/{auctionId}/bid")
    @SendTo("/topic/auction/{auctionId}")
    public BidMessage handleBid(@DestinationVariable Long auctionId, BidMessage bidMessage) {
        log.info("Received bid for auction {}: {}", auctionId, bidMessage);
        // Add business logic to validate/process the bid here in future
        
        // Broadcast the bid
        return bidMessage;
    }
}
