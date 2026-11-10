package com.Gym.GymCommonServices.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Resolves the real client address for rate-limiting purposes.
 *
 * <p>Forwarding headers are <strong>only</strong> honoured when the immediate peer is a
 * configured trusted proxy. This prevents an attacker from bypassing throttling by
 * rotating the {@code X-Forwarded-For} header.</p>
 */
@Component
@RequiredArgsConstructor
public class ClientIpResolver {

    private static final String HEADER_FORWARDED_FOR = "X-Forwarded-For";
    private static final String HEADER_REAL_IP = "X-Real-IP";
    private static final String UNKNOWN = "unknown";

    private final RateLimitProperties properties;

    /**
     * @return a non-null, normalised client address. Falls back to {@code "unknown"} only when
     *         the servlet container reports no remote address at all.
     */
    public String resolve(HttpServletRequest request) {
        String remoteAddr = normalize(request.getRemoteAddr());

        if (!isTrustedProxy(remoteAddr)) {
            return remoteAddr.isEmpty() ? UNKNOWN : remoteAddr;
        }

        String forwardedFor = request.getHeader(HEADER_FORWARDED_FOR);
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String[] hops = forwardedFor.split(",");
            // Walk right-to-left: the right-most untrusted hop is the one appended by our proxy.
            for (int i = hops.length - 1; i >= 0; i--) {
                String hop = normalize(hops[i]);
                if (!hop.isEmpty() && !isTrustedProxy(hop)) {
                    return hop;
                }
            }
            String leftMost = normalize(hops[0]);
            if (!leftMost.isEmpty()) {
                return leftMost;
            }
        }

        String realIp = normalize(request.getHeader(HEADER_REAL_IP));
        if (!realIp.isEmpty()) {
            return realIp;
        }

        return remoteAddr.isEmpty() ? UNKNOWN : remoteAddr;
    }

    /**
     * @return {@code true} when {@code address} may legitimately set forwarding headers.
     */
    public boolean isTrustedProxy(String address) {
        if (address == null || address.isEmpty()) {
            return false;
        }
        List<String> trusted = properties.getTrustedProxies();
        if (trusted == null || trusted.isEmpty()) {
            return false;
        }
        for (String entry : trusted) {
            if (entry == null) {
                continue;
            }
            String pattern = entry.trim();
            if (pattern.isEmpty()) {
                continue;
            }
            if (pattern.endsWith("*")) {
                if (address.startsWith(pattern.substring(0, pattern.length() - 1))) {
                    return true;
                }
            } else if (pattern.equalsIgnoreCase(address)) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String address) {
        if (address == null) {
            return "";
        }
        String value = address.trim();
        if (value.isEmpty()) {
            return "";
        }
        // Strip surrounding brackets from IPv6 literals, e.g. "[::1]".
        if (value.startsWith("[") && value.endsWith("]")) {
            value = value.substring(1, value.length() - 1);
        }
        // Strip a trailing :port from IPv4:port pairs.
        if (value.matches("^\\d{1,3}(\\.\\d{1,3}){3}:\\d+$")) {
            value = value.substring(0, value.lastIndexOf(':'));
        }
        return value;
    }
}
