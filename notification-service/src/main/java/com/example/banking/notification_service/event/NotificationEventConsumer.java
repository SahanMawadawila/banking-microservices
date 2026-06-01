package com.example.banking.notification_service.event;

import com.example.banking.notification_service.config.RabbitMQConfig;
import com.example.banking.notification_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.TRANSACTION_NOTIFICATION_QUEUE)
    public void handleTransactionCompleted(Map<String, Object> event) {
        log.info("Received TRANSACTION_COMPLETED event for notification: {}", event);
        try {
            Long userId = getLong(event, "userId");
            String type = (String) event.get("type");
            Number amount = (Number) event.get("amount");
            String fromAccount = (String) event.get("fromAccountNumber");
            String toAccount = (String) event.get("toAccountNumber");

            String subject;
            String message;

            switch (type) {
                case "DEPOSIT":
                    subject = "Deposit Successful";
                    message = String.format("A deposit of $%s has been made to your account %s.", amount, toAccount);
                    break;
                case "WITHDRAWAL":
                    subject = "Withdrawal Successful";
                    message = String.format("A withdrawal of $%s has been made from your account %s.", amount, fromAccount);
                    break;
                case "TRANSFER":
                    subject = "Transfer Successful";
                    message = String.format("A transfer of $%s from account %s to account %s has been completed.", amount, fromAccount, toAccount);
                    break;
                default:
                    subject = "Transaction Notification";
                    message = String.format("A transaction of $%s has been processed.", amount);
            }

            if (userId != null) {
                notificationService.createNotification(userId, "TRANSACTION", subject, message);
            }
        } catch (Exception e) {
            log.error("Failed to process transaction notification event: {}", event, e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.LOAN_NOTIFICATION_QUEUE)
    public void handleLoanStatusChanged(Map<String, Object> event) {
        log.info("Received LOAN_STATUS_CHANGED event for notification: {}", event);
        try {
            Long userId = getLong(event, "userId");
            String status = (String) event.get("status");
            Number amount = (Number) event.get("amount");
            Number loanId = (Number) event.get("loanId");

            String subject = "Loan Application Update";
            String message = switch (status) {
                case "PENDING" -> String.format("Your loan application #%s for $%s has been submitted and is under review.", loanId, amount);
                case "APPROVED" -> String.format("Congratulations! Your loan application #%s for $%s has been approved.", loanId, amount);
                case "REJECTED" -> String.format("Your loan application #%s for $%s has been rejected.", loanId, amount);
                case "DISBURSED" -> String.format("Your loan #%s for $%s has been disbursed to your account.", loanId, amount);
                default -> String.format("Your loan application #%s status has been updated to %s.", loanId, status);
            };

            if (userId != null) {
                notificationService.createNotification(userId, "LOAN", subject, message);
            }
        } catch (Exception e) {
            log.error("Failed to process loan notification event: {}", event, e);
        }
    }

    private Long getLong(Map<String, Object> map, String key) {
        Object val = map.get(key);
        if (val instanceof Number) {
            return ((Number) val).longValue();
        }
        return null;
    }
}
