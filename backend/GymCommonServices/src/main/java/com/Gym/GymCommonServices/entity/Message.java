package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private String senderId;

    @Column(name = "receiver_id", nullable = false)
    private String receiverId;

    @Column(name = "sender_role", nullable = false)
    private String senderRole; // e.g., "USER", "ADMIN", "TRAINER"

    @Column(columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Builder.Default
    @Column(name = "is_read", columnDefinition = "boolean default false")
    private Boolean isRead = false;
}
