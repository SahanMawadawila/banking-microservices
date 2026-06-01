package com.example.banking.notification_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private String id;
    private Long userId;
    private String type;
    private String channel;
    private String subject;
    private String message;
    private boolean read;
    private String createdAt;
}
