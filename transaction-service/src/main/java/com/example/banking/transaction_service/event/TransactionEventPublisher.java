package com.example.banking.transaction_service.event;

import com.example.banking.transaction_service.config.RabbitMQConfig;
import com.example.banking.transaction_service.dto.TransactionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class TransactionEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishTransactionCompleted(TransactionEvent event) {
        log.info("Publishing TRANSACTION_COMPLETED event: type={}, amount={}", event.getType(), event.getAmount());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.TRANSACTION_EXCHANGE,
                RabbitMQConfig.TRANSACTION_COMPLETED_ROUTING_KEY,
                event
        );
        log.info("TRANSACTION_COMPLETED event published successfully");
    }
}
