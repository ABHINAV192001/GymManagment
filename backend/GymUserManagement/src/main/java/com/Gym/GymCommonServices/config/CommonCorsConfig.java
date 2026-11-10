package com.Gym.GymCommonServices.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

/**
 * CORS policy for the public API.
 *
 * <p>Wildcard origins are never accepted: the API allows credentialed requests, and
 * {@code Access-Control-Allow-Origin: *} combined with credentials is both invalid per the
 * Fetch spec and an invitation to data exfiltration. Origins must be listed explicitly in
 * {@code CORS_ALLOWED_ORIGINS}.</p>
 *
 * <p>In the {@code prod} profile the application refuses to start when no origin is
 * configured, or when a loopback origin survives into production.</p>
 */
@Slf4j
@Configuration
public class CommonCorsConfig {

    private static final String WILDCARD = "*";
    private static final String PROD_PROFILE = "prod";
    private static final List<String> LOOPBACK_MARKERS = List.of("localhost", "127.0.0.1", "0.0.0.0", "::1");

    private final String[] allowedOrigins;
    private final Environment environment;

    public CommonCorsConfig(@Value("${app.cors.allowed-origins:}") String[] allowedOrigins,
                            Environment environment) {
        this.allowedOrigins = allowedOrigins;
        this.environment = environment;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = sanitize(allowedOrigins);
        boolean production = isProduction();

        if (origins.isEmpty()) {
            if (production) {
                throw new IllegalStateException(
                        "CORS_ALLOWED_ORIGINS must be set in the prod profile. Refusing to start with no allowed origin.");
            }
            log.warn("CORS_ALLOWED_ORIGINS is empty - all cross-origin browser requests will be rejected.");
        }

        if (production) {
            for (String origin : origins) {
                String lower = origin.toLowerCase();
                for (String marker : LOOPBACK_MARKERS) {
                    if (lower.contains(marker)) {
                        throw new IllegalStateException(
                                "CORS_ALLOWED_ORIGINS contains a loopback origin ('" + origin
                                        + "') in the prod profile. Set the real frontend origin.");
                    }
                }
            }
        }

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With",
                "X-Tenant-Id", "X-Branch-Id", "X-Request-Id"));
        config.setExposedHeaders(List.of("Authorization", "X-Total-Count",
                "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "Retry-After"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    private List<String> sanitize(String[] raw) {
        List<String> origins = new ArrayList<>();
        if (raw == null) {
            return origins;
        }
        for (String candidate : raw) {
            if (candidate == null) {
                continue;
            }
            for (String part : candidate.split(",")) {
                String origin = part.trim();
                if (origin.isEmpty()) {
                    continue;
                }
                if (WILDCARD.equals(origin)) {
                    throw new IllegalStateException(
                            "CORS_ALLOWED_ORIGINS must not contain '*'. List explicit origins instead.");
                }
                if (origin.endsWith("/")) {
                    origin = origin.substring(0, origin.length() - 1);
                }
                if (!origins.contains(origin)) {
                    origins.add(origin);
                }
            }
        }
        return origins;
    }

    private boolean isProduction() {
        for (String profile : environment.getActiveProfiles()) {
            if (PROD_PROFILE.equalsIgnoreCase(profile)) {
                return true;
            }
        }
        return false;
    }
}
