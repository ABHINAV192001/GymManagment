package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "branches")
@SQLRestriction("deleted_at IS NULL")
public class Branch extends com.Gym.GymCommonServices.common.BaseEntity {

    

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    private Organization organization;

    @NotBlank(message = "Branch code is required")
    @Column(name = "branch_code", unique = true, nullable = false)
    private String branchCode;

    @Column(unique = true, nullable = false)
    private String username;

    @NotBlank(message = "Branch name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Admin email is required")
    @Email(message = "Invalid email format")
    @Column(name = "admin_email", unique = true, nullable = false)
    private String adminEmail;

    @Column(name = "password_hash", nullable = true)
    private String passwordHash;

    @Builder.Default
    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default false")
    private Boolean isActive = false;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false, columnDefinition = "boolean default false")
    private Boolean isDeleted = false;
}
