package com.example.banking.transaction_service.service;

import com.example.banking.transaction_service.dto.*;
import com.example.banking.transaction_service.entity.Transaction;
import com.example.banking.transaction_service.entity.TransactionStatus;
import com.example.banking.transaction_service.entity.TransactionType;
import com.example.banking.transaction_service.event.TransactionEventPublisher;
import com.example.banking.transaction_service.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionEventPublisher eventPublisher;

    @Transactional
    public TransactionResponse deposit(DepositRequest request) {
        Transaction transaction = Transaction.builder()
                .toAccountNumber(request.getAccountNumber())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription() != null ? request.getDescription() : "Deposit")
                .userId(request.getUserId())
                .build();

        transaction = transactionRepository.save(transaction);
        log.info("Deposit transaction created: {} for account {}", transaction.getId(), request.getAccountNumber());

        // Publish event for account service to update balance
        publishEvent(transaction);

        return mapToResponse(transaction);
    }

    @Transactional
    public TransactionResponse withdraw(WithdrawRequest request) {
        Transaction transaction = Transaction.builder()
                .fromAccountNumber(request.getAccountNumber())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription() != null ? request.getDescription() : "Withdrawal")
                .userId(request.getUserId())
                .build();

        transaction = transactionRepository.save(transaction);
        log.info("Withdrawal transaction created: {} from account {}", transaction.getId(), request.getAccountNumber());

        publishEvent(transaction);

        return mapToResponse(transaction);
    }

    @Transactional
    public TransactionResponse transfer(TransferRequest request) {
        if (request.getFromAccountNumber().equals(request.getToAccountNumber())) {
            throw new RuntimeException("Cannot transfer to the same account");
        }

        Transaction transaction = Transaction.builder()
                .fromAccountNumber(request.getFromAccountNumber())
                .toAccountNumber(request.getToAccountNumber())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .type(TransactionType.TRANSFER)
                .status(TransactionStatus.COMPLETED)
                .description(request.getDescription() != null ? request.getDescription() : "Transfer")
                .userId(request.getUserId())
                .build();

        transaction = transactionRepository.save(transaction);
        log.info("Transfer transaction created: {} from {} to {}", transaction.getId(),
                request.getFromAccountNumber(), request.getToAccountNumber());

        publishEvent(transaction);

        return mapToResponse(transaction);
    }

    public List<TransactionResponse> getTransactionsByAccount(String accountNumber) {
        return transactionRepository
                .findByFromAccountNumberOrToAccountNumberOrderByCreatedAtDesc(accountNumber, accountNumber)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TransactionResponse getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + id));
        return mapToResponse(transaction);
    }

    public List<TransactionResponse> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void publishEvent(Transaction transaction) {
        TransactionEvent event = TransactionEvent.builder()
                .transactionId(transaction.getId())
                .fromAccountNumber(transaction.getFromAccountNumber())
                .toAccountNumber(transaction.getToAccountNumber())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .type(transaction.getType().name())
                .status(transaction.getStatus().name())
                .userId(transaction.getUserId())
                .build();
        eventPublisher.publishTransactionCompleted(event);
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .fromAccountNumber(t.getFromAccountNumber())
                .toAccountNumber(t.getToAccountNumber())
                .amount(t.getAmount())
                .currency(t.getCurrency())
                .type(t.getType().name())
                .status(t.getStatus().name())
                .description(t.getDescription())
                .userId(t.getUserId())
                .createdAt(t.getCreatedAt().toString())
                .build();
    }
}
