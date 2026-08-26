package com.Gym.GymCommonServices.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CommonCorsConfig {

    @Value("${app.cors.allowed-origins:*}")
    private String[] allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> patterns = new ArrayList<>();
        if (allowedOrigins != null) {
            for (String origin : allowedOrigins) {
                if (origin != null && !origin.trim().isEmpty()) {
                    patterns.add(origin.trim());
                }
            }
        }

        if (patterns.isEmpty() || (patterns.size() == 1 && "*".equals(patterns.get(0)))) {
            config.setAllowedOriginPatterns(List.of("*"));
        } else {
            // Always ensure production Vercel domain and wildcard preview domains are allowed
            if (!patterns.contains("https://*.vercel.app")) {
                patterns.add("https://*.vercel.app");
            }
            if (!patterns.contains("https://gym-managment-rho-one.vercel.app")) {
                patterns.add("https://gym-managment-rho-one.vercel.app");
            }
            config.setAllowedOriginPatterns(patterns);
        }

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Set-Cookie", "X-Total-Count"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
