package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.util.UUID;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "staff_profiles")
public class StaffProfile {
    @Id
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private User user;

    @Column(name = "org_id")
    private UUID orgId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private User manager;

    @Column(name = "is_personal_trainer", nullable = false)
    @Builder.Default
    private Boolean isPersonalTrainer = false;

    private BigDecimal salary;

    @Column(name = "pt_trainer_percentage", precision = 5, scale = 2)
    private BigDecimal ptTrainerPercentage;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "shift_timings", columnDefinition = "jsonb")
    private String shiftTimings; 

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "start_date")
    private LocalDate startDate;

    @org.hibernate.annotations.CreationTimestamp
    @jakarta.persistence.Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

}