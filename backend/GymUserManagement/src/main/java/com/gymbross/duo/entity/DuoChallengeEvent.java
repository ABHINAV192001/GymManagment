package com.gymbross.duo.entity;

import com.Gym.GymCommonServices.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "duo_challenge_events")
public class DuoChallengeEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private DuoChallenge challenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "event_type", nullable = false)
    private String eventType; // ATTENDANCE, WORKOUT, STRENGTH_PR, DUO_SYNC

    @Column(name = "points_awarded", nullable = false)
    @Builder.Default
    private Integer pointsAwarded = 0;

    @Column(length = 512)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
