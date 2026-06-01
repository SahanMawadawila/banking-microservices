package com.example.banking.notification_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    private Long userId;

    private String type;  // TRANSACTION, LOAN, ACCOUNT

    private String channel;  // IN_APP, EMAIL, SMS

    private String subject;

    private String message;

    private boolean read;

    private LocalDateTime createdAt;
}
