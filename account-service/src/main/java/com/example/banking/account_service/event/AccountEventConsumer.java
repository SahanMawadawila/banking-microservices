package com.example.banking.account_service.event;

import com.example.banking.account_service.config.RabbitMQConfig;
import com.example.banking.account_service.dto.TransactionEvent;
import com.example.banking.account_service.dto.UserEvent;
import com.example.banking.account_service.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AccountEventConsumer {

    private final AccountService accountService;

    @RabbitListener(queues = RabbitMQConfig.USER_REGISTERED_QUEUE)
    public void handleUserRegistered(UserEvent event) {
        log.info("Received USER_REGISTERED event for user: {}", event.getEmail());
        try {
            accountService.createDefaultAccount(event.getUserId(), event.getFullName());
            log.info("Default account created for user: {}", event.getEmail());
        } catch (Exception e) {
            log.error("Failed to create default account for user: {}", event.getEmail(), e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.TRANSACTION_COMPLETED_QUEUE)
    public void handleTransactionCompleted(TransactionEvent event) {
        log.info("Received TRANSACTION_COMPLETED event: type={}, amount={}", event.getType(), event.getAmount());
        try {
            switch (event.getType()) {
                case "DEPOSIT":
                    accountService.creditAccount(event.getToAccountNumber(), event.getAmount());
                    break;
                case "WITHDRAWAL":
                    accountService.debitAccount(event.getFromAccountNumber(), event.getAmount());
                    break;
                case "TRANSFER":
                    accountService.debitAccount(event.getFromAccountNumber(), event.getAmount());
                    accountService.creditAccount(event.getToAccountNumber(), event.getAmount());
                    break;
                default:
                    log.warn("Unknown transaction type: {}", event.getType());
            }
        } catch (Exception e) {
            log.error("Failed to process transaction event: {}", event, e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.LOAN_DISBURSED_QUEUE)
    public void handleLoanDisbursed(Map<String, Object> event) {
        log.info("Received LOAN_DISBURSED event: {}", event);
        try {
            String accountNumber = (String) event.get("accountNumber");
            Number amount = (Number) event.get("amount");
            if (accountNumber != null && amount != null) {
                accountService.creditAccount(accountNumber, java.math.BigDecimal.valueOf(amount.doubleValue()));
                log.info("Loan amount {} credited to account {}", amount, accountNumber);
            }
        } catch (Exception e) {
            log.error("Failed to process loan disbursement event: {}", event, e);
        }
    }
}
