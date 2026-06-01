package com.example.banking.loan_service.service;

import com.example.banking.loan_service.dto.LoanApplyRequest;
import com.example.banking.loan_service.dto.LoanResponse;
import com.example.banking.loan_service.entity.LoanApplication;
import com.example.banking.loan_service.entity.LoanStatus;
import com.example.banking.loan_service.event.LoanEventPublisher;
import com.example.banking.loan_service.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoanService {

    private final LoanRepository loanRepository;
    private final LoanEventPublisher eventPublisher;

    private static final BigDecimal DEFAULT_INTEREST_RATE = new BigDecimal("5.50");

    @Transactional
    public LoanResponse applyForLoan(LoanApplyRequest request) {
        LoanApplication loan = LoanApplication.builder()
                .userId(request.getUserId())
                .accountNumber(request.getAccountNumber())
                .amount(request.getAmount())
                .interestRate(DEFAULT_INTEREST_RATE)
                .termMonths(request.getTermMonths())
                .status(LoanStatus.PENDING)
                .purpose(request.getPurpose())
                .build();

        loan = loanRepository.save(loan);
        log.info("Loan application created: id={}, userId={}, amount={}", loan.getId(), loan.getUserId(), loan.getAmount());

        eventPublisher.publishLoanStatusChanged(loan.getId(), loan.getUserId(), loan.getStatus().name(), loan.getAmount());

        return mapToResponse(loan);
    }

    public List<LoanResponse> getLoansByUserId(Long userId) {
        return loanRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LoanResponse getLoanById(Long id) {
        LoanApplication loan = loanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found: " + id));
        return mapToResponse(loan);
    }

    @Transactional
    public LoanResponse approveLoan(Long id) {
        LoanApplication loan = loanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found: " + id));

        if (loan.getStatus() != LoanStatus.PENDING) {
            throw new RuntimeException("Loan can only be approved from PENDING status. Current: " + loan.getStatus());
        }

        loan.setStatus(LoanStatus.APPROVED);
        loan = loanRepository.save(loan);
        log.info("Loan approved: id={}", id);

        eventPublisher.publishLoanStatusChanged(loan.getId(), loan.getUserId(), loan.getStatus().name(), loan.getAmount());

        return mapToResponse(loan);
    }

    @Transactional
    public LoanResponse rejectLoan(Long id) {
        LoanApplication loan = loanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found: " + id));

        if (loan.getStatus() != LoanStatus.PENDING) {
            throw new RuntimeException("Loan can only be rejected from PENDING status. Current: " + loan.getStatus());
        }

        loan.setStatus(LoanStatus.REJECTED);
        loan = loanRepository.save(loan);
        log.info("Loan rejected: id={}", id);

        eventPublisher.publishLoanStatusChanged(loan.getId(), loan.getUserId(), loan.getStatus().name(), loan.getAmount());

        return mapToResponse(loan);
    }

    @Transactional
    public LoanResponse disburseLoan(Long id) {
        LoanApplication loan = loanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found: " + id));

        if (loan.getStatus() != LoanStatus.APPROVED) {
            throw new RuntimeException("Loan can only be disbursed from APPROVED status. Current: " + loan.getStatus());
        }

        if (loan.getAccountNumber() == null || loan.getAccountNumber().isBlank()) {
            throw new RuntimeException("Loan has no associated account number for disbursement");
        }

        loan.setStatus(LoanStatus.DISBURSED);
        loan = loanRepository.save(loan);
        log.info("Loan disbursed: id={}, amount={} to account {}", id, loan.getAmount(), loan.getAccountNumber());

        // Publish disbursement event → account service will credit the account
        eventPublisher.publishLoanDisbursed(loan.getId(), loan.getUserId(), loan.getAccountNumber(), loan.getAmount());
        eventPublisher.publishLoanStatusChanged(loan.getId(), loan.getUserId(), loan.getStatus().name(), loan.getAmount());

        return mapToResponse(loan);
    }

    private LoanResponse mapToResponse(LoanApplication loan) {
        return LoanResponse.builder()
                .id(loan.getId())
                .userId(loan.getUserId())
                .accountNumber(loan.getAccountNumber())
                .amount(loan.getAmount())
                .interestRate(loan.getInterestRate())
                .termMonths(loan.getTermMonths())
                .status(loan.getStatus().name())
                .purpose(loan.getPurpose())
                .createdAt(loan.getCreatedAt().toString())
                .updatedAt(loan.getUpdatedAt().toString())
                .build();
    }
}
