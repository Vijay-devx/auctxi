package com.auctxi.core.controller.ai;

import com.auctxi.core.dto.ai.AIChatRequest;
import com.auctxi.core.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.publisher.Flux;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AIChatController {

    @Value("${ai.service.url:http://localhost:5003}")
    private String aiServiceUrl;
    
    @Value("${ai.internal.token:secret_token_123}")
    private String internalToken;

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody AIChatRequest request) {

        String targetUrl = aiServiceUrl + "/ai/generate";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("message", request.getMessage());
        
        Map<String, Object> context = new HashMap<>();
        context.put("userId", currentUser.getUser().getId());
        context.put("role", currentUser.getUser().getRole().name());
        context.put("auctionId", request.getAuctionId());
        
        requestBody.put("context", context);

        SseEmitter emitter = new SseEmitter(0L); // Infinite timeout

        WebClient webClient = WebClient.create();

        Flux<String> eventStream = webClient.post()
                .uri(targetUrl)
                .header("X-Internal-Token", internalToken)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .retrieve()
                .bodyToFlux(String.class);

        eventStream.subscribe(
                data -> {
                    try {
                        emitter.send(data);
                    } catch (Exception e) {
                        emitter.completeWithError(e);
                    }
                },
                emitter::completeWithError,
                emitter::complete
        );

        return emitter;
    }
}
