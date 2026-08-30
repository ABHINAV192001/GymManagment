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
@Table(name = "duo_challenges")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DuoChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partnership_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private DuoPartnership partnership;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "organization", "roles"})
    private User creator;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "challenge_type", nullable = false)
    private ChallengeType challengeType;

    @Column(name = "target_value", nullable = false)
    private Integer targetValue;

    @Column(name = "wager_prize")
    private String wagerPrize;

    @Column(name = "max_members", nullable = false)
    @Builder.Default
    private Integer maxMembers = 2;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "invite_code")
    private String inviteCode;

    @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<DuoChallengeTask> tasks = new java.util.ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "organization", "roles"})
    private User winner;


    @Enumerated(EnumType.STRING)
    @Column(name = "prize_status", nullable = false)
    @Builder.Default
    private PrizeStatus prizeStatus = PrizeStatus.NONE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ChallengeStatus status = ChallengeStatus.PENDING;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
