package com.example.banking.loan_service.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanResponse {
    private Long id;
    private Long userId;
    private String accountNumber;
    private BigDecimal amount;
    private BigDecimal interestRate;
    private Integer termMonths;
    private String status;
    private String purpose;
    private String createdAt;
    private String updatedAt;
}
