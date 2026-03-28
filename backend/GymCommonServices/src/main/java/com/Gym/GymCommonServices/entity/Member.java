package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phoneNumber;

    // Mapping "Months" from requirements to membershipEndDate
    private String planName; // e.g. "6 months + 1 month (Free)"

    private LocalDate membershipEndDate;

    private BigDecimal amount;

    private LocalDate startedDate;

    private String shiftTimings;

    private Boolean isPersonalTrainer; // From requirements, though likely means 'hasPersonalTrainer' or
                                       // 'needsPersonalTrainer' for a user?
    // Wait, the JSON for User says "isPersonalTrainer:- True/False".
    // This might mean "Does this user HAVE a personal trainer?" or "Is this user a
    // personal trainer?"
    // Given "Trainer_name" is also a field, it likely means "Has Personal Trainer".
    // I will name it hasPersonalTrainer to be clear, but keep the JSON intent.

    @Column(name = "has_personal_trainer")
    private Boolean hasPersonalTrainer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id")
    private Staff trainer;

    @Enumerated(EnumType.STRING)
    private Role role; // USER or PREMIUM_USER

    // Storing diet and workout as JSON strings or simple text for now as they are
    // complex objects [{}]
    // In a real app, these might be separate entities or JSONB columns.
    @Column(columnDefinition = "TEXT")
    private String diet;

    @Column(columnDefinition = "TEXT")
    private String workoutPlan;
}
