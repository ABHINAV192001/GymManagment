package com.Gym.GymCommonServices.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Externalised configuration for {@link RateLimitingFilter}.
 *
 * <p>Every tier is configurable so operators can tune limits per environment without a redeploy.
 * Limits are expressed as "requests per window" and are keyed either by authenticated
 * {@code tenantId:username} or by resolved client IP.</p>
 */
@Data
@Component
@ConfigurationProperties(prefix = "app.rate-limit")
public class RateLimitProperties {

    /** Master switch — disabled only for load tests. Never disable in production. */
    private boolean enabled = true;

    /** Hard cap on counters held in memory. Protects against memory exhaustion. */
    private int maxTrackedClients = 20_000;

    /** How often expired counters are swept from memory. */
    private long sweepIntervalMs = 60_000L;

    /**
     * Peers that are allowed to set {@code X-Forwarded-For} / {@code X-Real-IP}.
     * Exact addresses and trailing-wildcard prefixes ("10.*") are supported.
     * Defaults to loopback only so a directly exposed instance cannot be spoofed.
     */
    private List<String> trustedProxies = new ArrayList<>(List.of(
            "127.0.0.1",
            "::1",
            "0:0:0:0:0:0:0:1"
    ));

    /** Brute-force sensitive endpoints (login, OTP, password reset). */
    private Tier auth = new Tier(10, 60);

    /** LLM / resource-intensive endpoints. */
    private Tier ai = new Tier(20, 60);

    /** Endpoints reachable without authentication. */
    private Tier publicApi = new Tier(60, 60);

    /** Everything else. */
    private Tier general = new Tier(150, 60);

    @Data
    public static class Tier {

        private boolean enabled = true;

        /** Maximum requests allowed inside the window. */
        private int limit;

        /** Window length in seconds. */
        private long windowSeconds;

        public Tier() {
        }

        public Tier(int limit, long windowSeconds) {
            this.limit = limit;
            this.windowSeconds = windowSeconds;
        }

        public long windowMillis() {
            return Math.max(1L, windowSeconds) * 1000L;
        }
    }
}
