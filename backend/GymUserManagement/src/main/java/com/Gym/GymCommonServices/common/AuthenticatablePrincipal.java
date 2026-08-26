package com.Gym.GymCommonServices.common;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;

/**
 * Login attempt tracking for entities that authenticate directly (User/Staff/Admin/Trainer/
 * PremiumUser). Kept off BaseEntity so non-auth entities (Branch, Organization, ...) don't
 * carry unused lockout columns.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@MappedSuperclass
public abstract class AuthenticatablePrincipal extends BaseEntity {

    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    public boolean isCurrentlyLocked() {
        return lockedUntil != null && lockedUntil.isAfter(Instant.now());
    }
}
