package com.gymbross.usermanagement.config;

import com.Gym.GymCommonServices.security.RateLimitingFilter;
import com.gymbross.usermanagement.security.JwtAuthenticationFilter;
import com.gymbross.usermanagement.security.JwtAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final UserDetailsService userDetailsService;
    private final CorsConfigurationSource corsConfigurationSource;
    private final SwaggerBasicAuthFilter swaggerBasicAuthFilter;
    private final RateLimitingFilter rateLimitingFilter;

    /**
     * The filter is a Spring bean so it can receive configuration, but it must only run inside
     * the security chain. Auto-registration as a servlet filter would execute it twice.
     */
    @Bean
    public FilterRegistrationBean<RateLimitingFilter> rateLimitingFilterRegistration(RateLimitingFilter filter) {
        FilterRegistrationBean<RateLimitingFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/user/food/**", "/api/exercises/**", "/api/workout/**", "/api/health/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/health/**").permitAll()
                        .requestMatchers(
                                "/api/auth/login", "/api/auth/refresh",
                                "/api/auth/register-organization", "/api/auth/register-user", "/api/auth/register-trainer",
                                "/api/auth/verify-otp", "/api/auth/forgot-password", "/api/auth/reset-password",
                                "/api/auth/resend-invite", "/api/auth/resend-otp", "/api/auth/complete-registration"
                        ).permitAll()
                        .requestMatchers("/api/public/**", "/api/otp/**", "/api/v1/notifications/whatsapp/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**", "/webjars/**").permitAll()
                        // WebSocket handshake must stay open; STOMP CONNECT carries the JWT and is
                        // validated per-destination by StompAuthInterceptor.
                        .requestMatchers("/ws/**").permitAll()
                        // AI and chat surfaces consume paid quota — anonymous access is cost abuse.
                        .requestMatchers("/api/chat/**", "/api/ai-chat/**").authenticated()
                        .requestMatchers("/api/auth/logout").authenticated()
                        // String/permission-specific checks live on the controller methods via @PreAuthorize;
                        // this layer just enforces "must be authenticated at all" as a baseline.
                        .requestMatchers("/api/v1/recipes/**", "/api/v1/accounts/**", "/api/v1/notifications/**", "/api/v1/plans/**", "/api/v1/rbac/**").authenticated()
                        .requestMatchers("/api/user/**").authenticated()
                        .requestMatchers("/api/admin/**").authenticated()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        .frameOptions(frame -> frame.deny())
                        .contentTypeOptions(contentType -> {
                        })
                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; "
                                        + "script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'"))
                        .referrerPolicy(referrer -> referrer.policy(
                                org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                        // Must stay last: this configurer returns itself rather than the parent.
                        .permissionsPolicy(permissions -> permissions.policy(
                                "geolocation=(), microphone=(), camera=(), payment=()"))
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(swaggerBasicAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                // Runs after authentication so counters can key on tenant + user.
                .addFilterAfter(rateLimitingFilter, JwtAuthenticationFilter.class)
                .exceptionHandling(conf -> conf.authenticationEntryPoint(jwtAuthenticationEntryPoint));

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
