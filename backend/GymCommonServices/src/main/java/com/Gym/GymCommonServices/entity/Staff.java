package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

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
@Table(name = "staffs")
public class Staff implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(name = "staff_code", unique = true, nullable = false)
    private String staffCode;

    @Column(unique = true, nullable = false)
    private String username;

    private String name;

    private String email;

    private String phone;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "role")
    private String role;

    private BigDecimal salary;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "shift_timings")
    private String shiftTimings;

    @Column(name = "payment_status")
    private String paymentStatus; // "Paid" or "Pending"

    private Integer experience;

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
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role != null ? role.toUpperCase() : "STAFF"));
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
