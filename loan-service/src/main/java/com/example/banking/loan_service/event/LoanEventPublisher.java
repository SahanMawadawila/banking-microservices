package com.example.banking.loan_service.event;

import com.example.banking.loan_service.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoanEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishLoanStatusChanged(Long loanId, Long userId, String status, BigDecimal amount) {
        Map<String, Object> event = Map.of(
                "loanId", loanId,
                "userId", userId,
                "status", status,
                "amount", amount,
                "eventType", "LOAN_STATUS_CHANGED"
        );
        log.info("Publishing LOAN_STATUS_CHANGED event: loanId={}, status={}", loanId, status);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.LOAN_EXCHANGE,
                RabbitMQConfig.LOAN_STATUS_CHANGED_ROUTING_KEY,
                event
        );
    }

    public void publishLoanDisbursed(Long loanId, Long userId, String accountNumber, BigDecimal amount) {
        Map<String, Object> event = Map.of(
                "loanId", loanId,
                "userId", userId,
                "accountNumber", accountNumber,
                "amount", amount,
                "eventType", "LOAN_DISBURSED"
        );
        log.info("Publishing LOAN_DISBURSED event: loanId={}, accountNumber={}, amount={}", loanId, accountNumber, amount);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.LOAN_EXCHANGE,
                RabbitMQConfig.LOAN_DISBURSED_ROUTING_KEY,
                event
        );
    }
}
