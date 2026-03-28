package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "fitness_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FitnessSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sessionType; // e.g., Zumba, Cardio, Abs

    @Column(nullable = false)
    private String branchIds; // Comma separated list of branch IDs

    @Column(nullable = false)
    private String sessionTime; // e.g., "8 AM - 9 AM"

    @Column(nullable = false)
    private String sessionPeriod; // e.g., Morning, Afternoon, Evening

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(nullable = false)
    private String recipientRoles; // e.g., "USER,PREMIUM_USER,TRAINER,STAFF"

    @Builder.Default
    private Boolean pollEnabled = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Poll results (stored as counts for simplicity, or we could have a separate
    // table for detailed responses)
    @Builder.Default
    private Integer inCount = 0;

    @Builder.Default
    private Integer outCount = 0;

    @Column(name = "session_date")
    private java.time.LocalDate sessionDate;
}
