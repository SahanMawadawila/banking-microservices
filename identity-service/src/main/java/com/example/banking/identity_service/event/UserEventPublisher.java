package com.example.banking.identity_service.event;

import com.example.banking.identity_service.config.RabbitMQConfig;
import com.example.banking.identity_service.dto.UserEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishUserRegistered(UserEvent event) {
        log.info("Publishing USER_REGISTERED event for user: {}", event.getEmail());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.USER_EXCHANGE,
                RabbitMQConfig.USER_REGISTERED_ROUTING_KEY,
                event
        );
        log.info("USER_REGISTERED event published successfully for user: {}", event.getEmail());
    }
}
