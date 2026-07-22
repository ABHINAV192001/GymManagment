package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "permissions")
public class RbacPermission {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String module;

    @Column(name = "sub_module", nullable = false, unique = true)
    private String subModule;

    private String description;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "create_date", nullable = false, updatable = false)
    private Instant createDate;
}
