package com.gymbross.duo.entity;

import com.Gym.GymCommonServices.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "duo_challenge_scores")
public class DuoChallengeScore {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id", nullable = false)
    private DuoChallenge challenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "total_points", nullable = false)
    @Builder.Default
    private Integer totalPoints = 0;

    @Column(name = "attendance_points", nullable = false)
    @Builder.Default
    private Integer attendancePoints = 0;

    @Column(name = "workout_points", nullable = false)
    @Builder.Default
    private Integer workoutPoints = 0;

    @Column(name = "pr_points", nullable = false)
    @Builder.Default
    private Integer prPoints = 0;

    @Column(name = "duo_sync_points", nullable = false)
    @Builder.Default
    private Integer duoSyncPoints = 0;

    @Column(name = "current_streak", nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
