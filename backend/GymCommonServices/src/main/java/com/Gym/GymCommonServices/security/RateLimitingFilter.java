package com.Gym.GymCommonServices.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Enterprise Token-Bucket / Sliding Window Rate Limiting Filter.
 * 
 * Provides automated defense against Brute-Force, Credential Stuffing, OTP Flooding,
 * and Denial of Service (DoS) attacks across all GymOS microservices.
 */
@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitingFilter extends OncePerRequestFilter {

    // Auth endpoints: 10 requests per minute per IP
    private static final int AUTH_LIMIT_PER_MINUTE = 10;
    // General API endpoints: 150 requests per minute per IP
    private static final int GENERAL_LIMIT_PER_MINUTE = 150;

    private static final long WINDOW_MILLIS = 60_000L; // 1 minute

    private final ConcurrentHashMap<String, ClientWindow> clientWindows = new ConcurrentHashMap<>();

    private static class ClientWindow {
        final long windowStart;
        final AtomicInteger requestCount;

        ClientWindow(long start) {
            this.windowStart = start;
            this.requestCount = new AtomicInteger(1);
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip static resources / swagger documentation
        if (isExcludedPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        boolean isAuthEndpoint = isSensitiveAuthEndpoint(path);
        int maxAllowed = isAuthEndpoint ? AUTH_LIMIT_PER_MINUTE : GENERAL_LIMIT_PER_MINUTE;

        String cacheKey = (isAuthEndpoint ? "AUTH:" : "GEN:") + clientIp;
        long now = System.currentTimeMillis();

        // Perform periodic cleanup of stale windows if map grows too large
        if (clientWindows.size() > 5000) {
            cleanupStaleEntries(now);
        }

        ClientWindow window = clientWindows.compute(cacheKey, (key, existing) -> {
            if (existing == null || (now - existing.windowStart) > WINDOW_MILLIS) {
                return new ClientWindow(now);
            }
            existing.requestCount.incrementAndGet();
            return existing;
        });

        int currentCount = window.requestCount.get();
        long resetSeconds = Math.max(1, (WINDOW_MILLIS - (now - window.windowStart)) / 1000);

        response.setHeader("X-RateLimit-Limit", String.valueOf(maxAllowed));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, maxAllowed - currentCount)));
        response.setHeader("X-RateLimit-Reset", String.valueOf(resetSeconds));

        if (currentCount > maxAllowed) {
            log.warn("Rate limit exceeded for IP: {} on path: {} (Count: {} / Limit: {})", clientIp, path, currentCount, maxAllowed);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(resetSeconds));
            response.getWriter().write(
                "{\"success\":false,\"message\":\"Rate limit exceeded. Too many requests. Please wait " + resetSeconds + " seconds before retrying.\",\"code\":429}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isSensitiveAuthEndpoint(String path) {
        if (path == null) return false;
        String lower = path.toLowerCase();
        return lower.contains("/api/auth/login") ||
               lower.contains("/api/auth/verify-otp") ||
               lower.contains("/api/auth/forgot-password") ||
               lower.contains("/api/auth/reset-password") ||
               lower.contains("/api/auth/register-") ||
               lower.contains("/api/auth/resend-otp");
    }

    private boolean isExcludedPath(String path) {
        if (path == null) return false;
        String lower = path.toLowerCase();
        return lower.startsWith("/swagger-ui") ||
               lower.startsWith("/v3/api-docs") ||
               lower.startsWith("/webjars") ||
               lower.startsWith("/favicon.ico") ||
               lower.equals("/actuator/health");
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            return xfHeader.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    private void cleanupStaleEntries(long now) {
        clientWindows.entrySet().removeIf(entry -> (now - entry.getValue().windowStart) > WINDOW_MILLIS * 2);
    }
}
