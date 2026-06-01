package com.example.banking.identity_service.dto;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEvent implements Serializable {
    private Long userId;
    private String email;
    private String fullName;
    private String eventType;
}
