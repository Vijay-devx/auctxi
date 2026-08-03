package com.auctxi.core.publisher;

import com.auctxi.core.config.RabbitMQConfig;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishNotificationEvent(String to, String type, String subject, Object payload) {
        NotificationEvent event = NotificationEvent.builder()
                .recipientEmail(to)
                .notificationType(type)
                .subject(subject)
                .payload(payload)
                .build();

        log.info("Publishing {} event to RabbitMQ for {}", type, to);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.NOTIFICATION_ROUTING_KEY, event);
    }

    @Data
    @Builder
    public static class NotificationEvent {
        private String recipientEmail;
        private String notificationType;
        private String subject;
        private Object payload;
    }
}
