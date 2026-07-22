package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends com.Gym.GymCommonServices.common.BaseEntity {

    

    @Column(name = "recipient_username", nullable = false)
    private String recipientUsername;

    @Column(name = "sender_username")
    private String senderUsername;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private String type; // e.g., "INFO", "SESSION", "MESSAGE", "PAYMENT"

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "action_link")
    private String actionLink;
}
