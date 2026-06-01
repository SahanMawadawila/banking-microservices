package com.example.banking.account_service.service;

import com.example.banking.account_service.dto.AccountResponse;
import com.example.banking.account_service.dto.CreateAccountRequest;
import com.example.banking.account_service.entity.Account;
import com.example.banking.account_service.entity.AccountStatus;
import com.example.banking.account_service.entity.AccountType;
import com.example.banking.account_service.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountResponse createAccount(CreateAccountRequest request) {
        Account account = Account.builder()
                .userId(request.getUserId())
                .accountNumber(generateAccountNumber())
                .accountType(AccountType.valueOf(request.getAccountType().toUpperCase()))
                .balance(BigDecimal.ZERO)
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .status(AccountStatus.ACTIVE)
                .build();

        account = accountRepository.save(account);
        log.info("Account created: {} for userId: {}", account.getAccountNumber(), account.getUserId());
        return mapToResponse(account);
    }

    public AccountResponse createDefaultAccount(Long userId, String fullName) {
        Account account = Account.builder()
                .userId(userId)
                .accountNumber(generateAccountNumber())
                .accountType(AccountType.SAVINGS)
                .balance(BigDecimal.ZERO)
                .currency("USD")
                .status(AccountStatus.ACTIVE)
                .build();

        account = accountRepository.save(account);
        log.info("Default savings account created for user {}: {}", fullName, account.getAccountNumber());
        return mapToResponse(account);
    }

    public List<AccountResponse> getAccountsByUserId(Long userId) {
        return accountRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AccountResponse getAccountByNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
        return mapToResponse(account);
    }

    public AccountResponse getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + id));
        return mapToResponse(account);
    }

    public AccountResponse updateAccountStatus(Long id, String status) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found with id: " + id));
        account.setStatus(AccountStatus.valueOf(status.toUpperCase()));
        account = accountRepository.save(account);
        log.info("Account {} status updated to: {}", account.getAccountNumber(), status);
        return mapToResponse(account);
    }

    @Transactional
    public void creditAccount(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);
        log.info("Credited {} to account {}, new balance: {}", amount, accountNumber, account.getBalance());
    }

    @Transactional
    public void debitAccount(String accountNumber, BigDecimal amount) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));
        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance in account: " + accountNumber);
        }
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);
        log.info("Debited {} from account {}, new balance: {}", amount, accountNumber, account.getBalance());
    }

    private String generateAccountNumber() {
        String accountNumber;
        do {
            accountNumber = "BNK" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();
        } while (accountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }

    private AccountResponse mapToResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .userId(account.getUserId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType().name())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .status(account.getStatus().name())
                .createdAt(account.getCreatedAt().toString())
                .build();
    }
}
