package com.gymbross.duo.entity;

import com.Gym.GymCommonServices.entity.Organization;
import com.Gym.GymCommonServices.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "duo_partnerships")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DuoPartnership {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "organization", "roles"})
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "addressee_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "organization", "roles"})
    private User addressee;


    @Column(name = "invite_code", unique = true)
    private String inviteCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PartnershipStatus status;


    @Column(name = "duo_streak_count", nullable = false)
    @Builder.Default
    private Integer duoStreakCount = 0;

    @Column(name = "last_joint_workout_date")
    private LocalDate lastJointWorkoutDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
