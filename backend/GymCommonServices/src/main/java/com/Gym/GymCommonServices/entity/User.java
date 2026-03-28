package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(name = "user_code", unique = true, nullable = false)
    private String userCode;

    @Column(unique = true, nullable = false)
    private String username;

    private String name;

    private String email;

    private String phone;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "amount_paid")
    private java.math.BigDecimal amountPaid;

    private Integer age;
    private String gender;
    private Double height;
    private Double weight;

    @Column(name = "activity_level")
    private String activityLevel;

    private String goal;

    @Builder.Default
    @Column(name = "is_onboarding_completed", columnDefinition = "boolean default false")
    private Boolean isOnboardingCompleted = false;

    @Builder.Default
    @Column(name = "attendance_count")
    private Integer attendanceCount = 0;

    private String plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id")
    private Trainer trainer;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Builder.Default
    @Column(name = "is_email_verified")
    private Boolean isEmailVerified = false;

    @Builder.Default
    @Column(name = "is_phone_verified")
    private Boolean isPhoneVerified = false;

    @Builder.Default
    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default false")
    private Boolean isActive = false;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false, columnDefinition = "boolean default false")
    private Boolean isDeleted = false;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role != null ? role.name() : "USER"));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @ElementCollection
    @CollectionTable(name = "user_workout_plans", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "workout_item")
    private List<String> workoutPlan;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private WeeklyWorkoutPlan weeklyPlan;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserDietPlan> dietPlans = new java.util.ArrayList<>();

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(isActive);
    }
}
