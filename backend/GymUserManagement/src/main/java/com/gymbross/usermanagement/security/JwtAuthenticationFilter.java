package com.gymbross.usermanagement.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.Gym.GymCommonServices.security.TokenRevocationService;
import com.Gym.GymCommonServices.util.JwtUtil;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final TokenRevocationService tokenRevocationService;
    private final com.gymbross.usermanagement.repository.BranchRepository branchRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // SKIP PUBLIC APIs - DO NOT PROCESS JWT FOR THESE PATHS
        if (isPublicPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        String accessToken = null;

        // 1. Check Authorization Header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            accessToken = authHeader.substring(7);
        }

        // 2. Check Cookie if header is missing
        if (accessToken == null && request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    accessToken = cookie.getValue();
                    break;
                }
            }
        }

        if (accessToken == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jti = jwtUtil.extractJti(accessToken);
            if (tokenRevocationService.isRevoked(jti)) {
                log.debug("JwtAuthFilter: Rejected revoked token (jti={})", jti);
                filterChain.doFilter(request, response);
                return;
            }

            String username = jwtUtil.extractUsername(accessToken);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtUtil.isTokenValid(accessToken, userDetails)) {
                    // Extract and Set IDs in Request Attributes for Controllers
                    java.util.UUID organizationId = jwtUtil.extractOrganizationId(accessToken);
                    java.util.UUID branchId = jwtUtil.extractBranchId(accessToken);
                    String role = jwtUtil.extractRole(accessToken);

                    // Extract permissions early to use for branch override logic
                    List<String> permissions = jwtUtil.extractPermissions(accessToken);
                    
                    // Allow branch override if caller holds BRANCHES:VIEW or has no fixed branch
                    boolean canOverrideBranch = permissions.contains("BRANCHES:VIEW") || branchId == null;

                    if (canOverrideBranch) {
                        if (request.getCookies() != null) {
                            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                                if ("branchId".equals(cookie.getName()) && cookie.getValue() != null
                                        && !cookie.getValue().isEmpty()) {
                                    try {
                                        java.util.UUID requestedBranchId = java.util.UUID.fromString(cookie.getValue());
                                        // Validate that this branch belongs to the user's organization
                                        branchRepository.findById(requestedBranchId).ifPresent(branch -> {
                                            if (branch.getOrganization().getId().equals(organizationId)) {
                                                request.setAttribute("branchId", requestedBranchId);
                                            } else {
                                                log.warn("JwtAuthFilter: Branch {} does not belong to organization {}", requestedBranchId, organizationId);
                                            }
                                        });
                                    } catch (IllegalArgumentException e) {
                                        log.debug("JwtAuthFilter: Invalid branchId cookie format: {}", cookie.getValue());
                                    }
                                    break;
                                }
                            }
                        }
                    }

                    if (organizationId != null) {
                        request.setAttribute("organizationId", organizationId);
                    }
                    if (branchId != null && request.getAttribute("branchId") == null) {
                        request.setAttribute("branchId", branchId);
                    }

                    java.util.Set<GrantedAuthority> authorities = new java.util.HashSet<>(userDetails.getAuthorities());
                    for (String permission : permissions) {
                        authorities.add(new SimpleGrantedAuthority(permission));
                    }

                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            userDetails, null, authorities);

                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    log.debug("JwtAuthFilter: Token is invalid or expired for user: {}", username);
                }
            }
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            request.setAttribute("jwt_error", "EXPIRED");
        } catch (io.jsonwebtoken.security.SignatureException e) {
            log.warn("JwtAuthFilter: JWT signature invalid - check secret key configuration");
            request.setAttribute("jwt_error", "INVALID_SIGNATURE");
        } catch (Exception e) {
            log.debug("JwtAuthFilter: JWT validation failed: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            request.setAttribute("jwt_error", "GENERAL_ERROR");
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String path) {
        return path.startsWith("/api/auth/login")
                || path.startsWith("/api/auth/register")
                || path.startsWith("/api/auth/refresh")
                || path.startsWith("/api/auth/forgot-password")
                || path.startsWith("/api/auth/reset-password")
                || path.startsWith("/api/auth/verify-otp")
                || path.startsWith("/api/public/")
                || path.startsWith("/api/otp/")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-resources")
                || path.startsWith("/webjars");
    }

}
