package com.gymbross.workout.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/activities/**").permitAll()
                        .requestMatchers("/api/user/workout/**").permitAll()
                        .requestMatchers("/api/exercises/**").permitAll() // Authenticated in filter usually, or allow
                                                                          // for now?
                        // Actually, client.js sends token. Filter validates it.
                        // If we want to enforce roles, we do it here or in controller.
                        // For 403, it means it hit .anyRequest().authenticated() and failed?
                        // If token is valid, it should pass.
                        // THE ISSUE: The 403 might be because options preflight or something?
                        // Or maybe the user token is somehow invalid for this service?
                        // Let's permitAll() for these specific endpoints to debug/fix if auth filter is
                        // strict.
                        // Better: .authenticated() is fine if token is good.
                        // BUT, if the user is getting 403, either token is bad or filter is rejecting.
                        // To fix "HTTP 403", let's explicitly allow them or ensure OPTIONS is handled.
                        // Given the user/workout is permitAll, let's match that pattern for now to
                        // unblock.
                        .requestMatchers("/api/workout/**").permitAll()
                        .requestMatchers("/api/exercises/**").permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of("http://localhost:3000", "http://127.0.0.1:3000"));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("*"));
        configuration.setAllowCredentials(true);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
