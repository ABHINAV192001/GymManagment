package com.Gym.GymCommonServices.security;

import com.Gym.GymCommonServices.entity.RevokedToken;
import com.Gym.GymCommonServices.repository.RevokedTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * Shared across all services so a token revoked via logout on GymUserManagement is
 * also rejected by GymWorkoutService/GymChatService, which validate the same JWTs.
 * Scheduled cleanup only actually runs in whichever service has @EnableScheduling active
 * (currently GymUserManagement) since it's one shared database.
 */
@Service
@RequiredArgsConstructor
public class TokenRevocationService {

    private final RevokedTokenRepository revokedTokenRepository;

    public void revoke(String jti, Instant expiresAt) {
        if (jti == null || expiresAt == null || revokedTokenRepository.existsByJti(jti)) {
            return;
        }
        revokedTokenRepository.save(RevokedToken.builder()
                .jti(jti)
                .expiresAt(expiresAt)
                .build());
    }

    public boolean isRevoked(String jti) {
        return jti != null && revokedTokenRepository.existsByJti(jti);
    }

    @Scheduled(fixedRate = 3_600_000L)
    public void purgeExpired() {
        revokedTokenRepository.deleteExpired(Instant.now());
    }
}
