package com.auctxi.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.beans.factory.annotation.Value;

/**
 * Configuration for real-time WebSocket communication.
 *
 * WebSockets allow the server to push updates (like live bids) directly to connected clients
 * without the clients needing to constantly poll the server.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOrigins;

    /**
     * Registers the initial endpoint that clients will use to connect to the WebSocket server.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Clients connect to: ws://localhost:8080/ws-auction
        // SockJS is used as a fallback option if native WebSockets aren't supported by the browser.
        registry.addEndpoint("/ws-auction")
                .setAllowedOrigins(allowedOrigins.split(","))
                .withSockJS();
    }

    /**
     * Configures the message broker that routes messages from one client to another,
     * or from the server to clients.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // The server broadcasts messages to destinations prefixed with "/topic"
        // Example: /topic/auction/123/bids
        registry.enableSimpleBroker("/topic");
        
        // When clients send messages to the server, they must use the "/app" prefix
        // Example: /app/bid
        registry.setApplicationDestinationPrefixes("/app");
    }
}
