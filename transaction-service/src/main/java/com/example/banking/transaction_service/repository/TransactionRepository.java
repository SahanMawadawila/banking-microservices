package com.example.banking.transaction_service.repository;

import com.example.banking.transaction_service.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByFromAccountNumberOrToAccountNumberOrderByCreatedAtDesc(String fromAccount, String toAccount);
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);
}
