package com.gymbross.workout.config;

import com.Gym.GymCommonServices.security.TokenRevocationService;
import com.Gym.GymCommonServices.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TokenRevocationService tokenRevocationService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        String jwt = null;
        final String userEmail;

        // 1. Try to get token from Header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        }
        
        // 2. Try to get token from Cookie if header is missing
        if (jwt == null && request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    break;
                }
            }
        }

        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String jti = jwtUtil.extractJti(jwt);
            if (tokenRevocationService.isRevoked(jti)) {
                filterChain.doFilter(request, response);
                return;
            }

            userEmail = jwtUtil.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                String role = jwtUtil.extractRole(jwt);
                java.util.UUID organizationId = jwtUtil.extractOrganizationId(jwt);
                java.util.UUID branchId = jwtUtil.extractBranchId(jwt);

                // Create authorities from role + permissions claim
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                if (role != null) {
                    authorities.add(new SimpleGrantedAuthority(role));
                }
                for (String permission : jwtUtil.extractPermissions(jwt)) {
                    authorities.add(new SimpleGrantedAuthority(permission));
                }

                UserDetails userDetails = new User(userEmail, "", authorities);

                if (jwtUtil.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set context attributes for controllers
                    if (organizationId != null) request.setAttribute("organizationId", organizationId);
                    if (branchId != null) request.setAttribute("branchId", branchId);

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.debug("WorkoutService: JWT expired for {}", request.getRequestURI());
        } catch (Exception e) {
            log.debug("WorkoutService: JWT error: {}", e.getMessage());
        }
        filterChain.doFilter(request, response);
    }
}
