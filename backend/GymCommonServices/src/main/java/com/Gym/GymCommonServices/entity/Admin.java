package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "admins")
public class Admin implements org.springframework.security.core.userdetails.UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(name = "admin_code", unique = true, nullable = false)
    private String adminCode;

    @Column(unique = true, nullable = false)
    private String username;

    private String email;

    private String phone;

    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "name")
    private String name;

    @Column(name = "dob")
    private java.time.LocalDate dob;

    @Column(name = "gender")
    private String gender;

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
    public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
        return java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                role != null ? role.name() : "ADMIN"));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username; // Or email if that's the login identifier
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
