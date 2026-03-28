package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "otps")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Otp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    private String email;
    private String phone;

    @Column(name = "otp_code", nullable = false)
    private String otpCode;

    @Column(name = "otp_type", nullable = false)
    private String otpType;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;

    @Builder.Default
    @Column(name = "attempts", nullable = false)
    private Integer attempts = 0;

}
