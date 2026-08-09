package com.gymbross.usermanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notification_logs")
public class NotificationLog {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "template_id")
    private UUID templateId;

    @Column(nullable = false)
    private String recipient;

    @Column(nullable = false)
    private String channel;

    @Column(nullable = false)
    private String status; // "SENT", "FAILED"

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "target_role")
    private String targetRole;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
