package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "organizations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "org_code", unique = true, nullable = false)
    private String orgCode;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String name;

    @Column(name = "owner_email", unique = true, nullable = false)
    private String ownerEmail;

    @Column(nullable = false)
    private String phone;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

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
}
