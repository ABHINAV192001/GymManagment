package com.gymbross.usermanagement.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        // System.out.println("JwtAuthFilter: Processing path: " + path);

        // ✅ SKIP PUBLIC APIs - DO NOT PROCESS JWT FOR THESE PATHS
        if (path.contains("/api/auth/")
                || path.contains("/api/chat/")
                || path.contains("/api/otp/")
                || path.contains("/api/user/food/debug/schema")
                || path.contains("/api/public/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String accessToken = null;

        // 1. Check Authorization Header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            accessToken = authHeader.substring(7);
        } else {
            System.out.println("JwtAuthFilter: No Bearer token in header for path: " + path);
        }

        // 2. Check Cookie if header is missing
        if (accessToken == null && request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    accessToken = cookie.getValue();
                    System.out.println("JwtAuthFilter: Found token in cookie");
                    break;
                }
            }
        }

        if (accessToken == null) {
            System.out.println("JwtAuthFilter: No access token found. Proceeding anonymously.");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String username = jwtUtil.extractUsername(accessToken);
            System.out.println("JwtAuthFilter: Extracted username: " + username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                System.out.println("JwtAuthFilter: User loaded: " + userDetails.getUsername() + ", Authorities: "
                        + userDetails.getAuthorities());

                if (jwtUtil.isTokenValid(accessToken, userDetails)) {
                    System.out.println("JwtAuthFilter: Token is VALID for user: " + username);

                    // Extract and Set IDs in Request Attributes for Controllers
                    Long organizationId = jwtUtil.extractOrganizationId(accessToken);
                    Long branchId = jwtUtil.extractBranchId(accessToken);
                    String role = jwtUtil.extractRole(accessToken);

                    // Allow ORG_ADMIN or OWNER to override branchId context via cookie
                    if ("ORG_ADMIN".equals(role) || "OWNER".equals(role)) {
                        if (request.getCookies() != null) {
                            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                                if ("branchId".equals(cookie.getName()) && cookie.getValue() != null
                                        && !cookie.getValue().isEmpty()) {
                                    try {
                                        branchId = Long.parseLong(cookie.getValue());
                                        System.out.println("JwtAuthFilter: Branch context overridden to: " + branchId);
                                    } catch (NumberFormatException e) {
                                        System.out.println(
                                                "JwtAuthFilter: Invalid branchId cookie format: " + cookie.getValue());
                                    }
                                    break;
                                }
                            }
                        }
                    }

                    if (organizationId != null) {
                        request.setAttribute("organizationId", organizationId);
                    }
                    if (branchId != null) {
                        request.setAttribute("branchId", branchId);
                    }

                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    System.err.println("JwtAuthFilter: Token is INVALID or EXPIRED for user: " + username);
                }
            }
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            System.err.println("JwtAuthFilter: JWT Token EXPIRED: " + e.getMessage());
        } catch (io.jsonwebtoken.security.SignatureException e) {
            System.err.println("JwtAuthFilter: JWT Signature INVALID: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("JwtAuthFilter: JWT Token validation failed: " + e.getClass().getSimpleName() + " - "
                    + e.getMessage());
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }

}
