package com.Gym.GymCommonServices.security;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

/**
 * Fails application startup when the JWT signing secret is missing, too weak, or still set to
 * the value that used to be shipped as a default in {@code application.properties}.
 *
 * <p>Signing tokens with a publicly known key lets anyone mint valid credentials for any
 * tenant, so this check is deliberately fatal rather than a warning.</p>
 */
@Slf4j
@Component
public class JwtSecretValidator {

    /** Minimum acceptable HMAC key length in bytes (HS256 requires >= 32). */
    private static final int MIN_SECRET_BYTES = 32;

    /** Values that were previously committed as defaults and must never be reused. */
    private static final String[] REVOKED_DEFAULTS = {
            "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
    };

    @Value("${application.security.jwt.secret-key:}")
    private String secretKey;

    @PostConstruct
    void validate() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET is not configured. Set the JWT_SECRET environment variable to a random "
                            + "value of at least " + MIN_SECRET_BYTES + " bytes.");
        }

        String trimmed = secretKey.trim();

        for (String revoked : REVOKED_DEFAULTS) {
            if (revoked.equalsIgnoreCase(trimmed)) {
                throw new IllegalStateException(
                        "JWT_SECRET is set to a previously published default value. Generate a new secret "
                                + "with at least " + MIN_SECRET_BYTES + " random bytes.");
            }
        }

        byte[] keyBytes = decode(trimmed);
        if (keyBytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "JWT_SECRET is too short (" + keyBytes.length + " bytes). HS256 requires at least "
                            + MIN_SECRET_BYTES + " bytes of entropy.");
        }

        log.info("JWT signing key validated ({} bytes).", keyBytes.length);
    }

    /**
     * Mirrors {@code JwtUtil}: hex-encoded secrets are decoded, anything else is treated as raw
     * UTF-8 so operators can supply either form.
     */
    private byte[] decode(String value) {
        if (value.length() % 2 == 0 && value.matches("^[0-9a-fA-F]+$")) {
            try {
                return HexFormat.of().parseHex(value);
            } catch (IllegalArgumentException ignored) {
                // Not valid hex after all - fall through to raw bytes.
            }
        }
        return value.getBytes(StandardCharsets.UTF_8);
    }
}
