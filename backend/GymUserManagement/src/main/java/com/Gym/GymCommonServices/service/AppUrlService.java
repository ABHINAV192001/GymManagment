package com.Gym.GymCommonServices.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.net.URI;

@Slf4j
@Service
public class AppUrlService {

    @Value("${app.frontend.url:}")
    private String configuredFrontendUrl;

    /**
     * Dynamically resolves the base frontend URL without hardcoding.
     * Priority order:
     * 1. Candidate URL explicitly provided by the caller (e.g., origin passed from client).
     * 2. Active HTTP Request context: 'Origin', 'Referer', or 'X-Forwarded-Host' / 'Host' headers.
     * 3. Configured environment property 'app.frontend.url' (from APP_FRONTEND_URL).
     */
    public String resolveFrontendUrl(String explicitCandidate) {
        if (isValidHttpUrl(explicitCandidate)) {
            return extractBaseOrigin(explicitCandidate);
        }

        String requestOrigin = getOriginFromCurrentRequest();
        if (isValidHttpUrl(requestOrigin)) {
            return extractBaseOrigin(requestOrigin);
        }

        if (isValidHttpUrl(configuredFrontendUrl)) {
            return extractBaseOrigin(configuredFrontendUrl);
        }

        log.debug("No frontend URL could be resolved dynamically and 'app.frontend.url' is not configured.");
        return "";
    }

    public String resolveFrontendUrl() {
        return resolveFrontendUrl(null);
    }

    /**
     * Builds a full URL ensuring correct slashes between the resolved base URL and the relative path.
     */
    public String buildFrontendUrl(String path, String explicitCandidate) {
        String base = resolveFrontendUrl(explicitCandidate);
        if (path == null || path.isBlank()) {
            return base;
        }
        String cleanPath = path.startsWith("/") ? path : "/" + path;
        return base.isEmpty() ? cleanPath : base + cleanPath;
    }

    public String buildFrontendUrl(String path) {
        return buildFrontendUrl(path, null);
    }

    private String getOriginFromCurrentRequest() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) {
                return null;
            }
            HttpServletRequest request = attrs.getRequest();
            if (request == null) {
                return null;
            }

            // 1. Origin header
            String origin = request.getHeader("Origin");
            if (isValidHttpUrl(origin)) {
                return origin.trim();
            }

            // 2. Referer header
            String referer = request.getHeader("Referer");
            if (isValidHttpUrl(referer)) {
                return extractBaseOrigin(referer);
            }

            // 3. Reverse-proxy headers
            String scheme = request.getHeader("X-Forwarded-Proto");
            if (scheme == null || scheme.isBlank()) {
                scheme = request.getScheme();
            }
            String host = request.getHeader("X-Forwarded-Host");
            if (host == null || host.isBlank()) {
                host = request.getHeader("Host");
            }
            if (host != null && !host.isBlank()) {
                return scheme + "://" + host.trim();
            }
        } catch (Exception e) {
            log.debug("Could not resolve URL from request context: {}", e.getMessage());
        }
        return null;
    }

    private boolean isValidHttpUrl(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        String clean = url.trim().toLowerCase();
        return clean.startsWith("http://") || clean.startsWith("https://");
    }

    private String extractBaseOrigin(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return "";
        }
        try {
            URI uri = URI.create(rawUrl.trim());
            String scheme = uri.getScheme();
            String host = uri.getHost();
            int port = uri.getPort();

            if (scheme != null && host != null) {
                if (port != -1 && port != 80 && port != 443) {
                    return scheme + "://" + host + ":" + port;
                }
                return scheme + "://" + host;
            }
        } catch (Exception ignored) {
        }

        String clean = rawUrl.trim();
        int slashIdx = clean.indexOf("/", 8);
        if (slashIdx != -1) {
            clean = clean.substring(0, slashIdx);
        }
        return clean.endsWith("/") ? clean.substring(0, clean.length() - 1) : clean;
    }
}
