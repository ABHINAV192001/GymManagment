package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "trainers")
public class Trainer implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "trainer_code", unique = true, nullable = false)
    private String trainerCode;

    @Column(unique = true, nullable = false)
    private String username;

    private String name;
    private String email;
    private String phone;

    @Column(name = "password_hash")
    private String passwordHash;

    private BigDecimal salary;
    private LocalDate startDate;
    private String shiftTimings;
    private Integer experience;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "is_personal_trainer")
    private Boolean isPersonalTrainer;

    @Builder.Default
    @Column(name = "is_active", columnDefinition = "boolean default false")
    private Boolean isActive = false;

    @Builder.Default
    @Column(name = "is_email_verified", columnDefinition = "boolean default false")
    private Boolean isEmailVerified = false;

    @Builder.Default
    @Column(name = "is_phone_verified", columnDefinition = "boolean default false")
    private Boolean isPhoneVerified = false;

    @Builder.Default
    @Column(name = "is_deleted", columnDefinition = "boolean default false")
    private Boolean isDeleted = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("TRAINER"));
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

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(isActive);
    }
}
