package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "branches")
public class Branch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
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

    @NotBlank(message = "Password is required")
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

}
