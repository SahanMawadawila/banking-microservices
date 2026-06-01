package com.example.banking.account_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAccountRequest {
    private Long userId;
    private String accountType;
    private String currency;
}
