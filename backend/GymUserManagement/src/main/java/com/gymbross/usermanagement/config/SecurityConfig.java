package com.gymbross.usermanagement.config;

import com.gymbross.usermanagement.security.JwtAuthenticationFilter;
import com.gymbross.usermanagement.security.JwtAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
        private final UserDetailsService userDetailsService;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/api/auth/**",
                                                                "/api/public/**",
                                                                "/api/otp/**")
                                                .permitAll()
                                                // Allow Trainers to view users, staff (for trainer list), and inventory
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/admin/dashboard/users",
                                                                "/api/admin/dashboard/staff")
                                                .hasAnyAuthority("ORG_ADMIN", "BRANCH_ADMIN", "TRAINER", "OWNER",
                                                                "ADMIN")
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/inventory/**")
                                                .hasAnyAuthority("ORG_ADMIN", "BRANCH_ADMIN", "TRAINER", "OWNER",
                                                                "ADMIN")

                                                // Allow Trainers to edit diet and workout plans
                                                .requestMatchers(org.springframework.http.HttpMethod.PUT,
                                                                "/api/admin/dashboard/users/*/workout-plan")
                                                .hasAnyAuthority("ORG_ADMIN", "BRANCH_ADMIN", "TRAINER", "OWNER",
                                                                "ADMIN")
                                                .requestMatchers(org.springframework.http.HttpMethod.PUT,
                                                                "/api/admin/dashboard/users/*/diet-plan")
                                                .hasAnyAuthority("ORG_ADMIN", "BRANCH_ADMIN", "TRAINER", "OWNER",
                                                                "ADMIN")

                                                // Diet Plan Assignment
                                                .requestMatchers("/api/diet/**")
                                                .hasAnyAuthority("ORG_ADMIN", "BRANCH_ADMIN", "TRAINER", "OWNER",
                                                                "ADMIN")

                                                // Admin/Branch Manager restricted routes
                                                .requestMatchers("/api/admin/**")
                                                .hasAnyAuthority("ORG_ADMIN", "BRANCH_ADMIN", "OWNER", "ADMIN")
                                                .requestMatchers("/api/inventory/**")
                                                .hasAnyAuthority("ORG_ADMIN", "BRANCH_ADMIN", "OWNER", "ADMIN")
                                                .requestMatchers("/api/branch/**")
                                                .hasAnyAuthority("BRANCH_ADMIN", "ORG_ADMIN", "OWNER", "ADMIN")

                                                .requestMatchers("/api/chat/**").permitAll()
                                                .requestMatchers("/api/user/**").authenticated()
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider())
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
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
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
                        throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOriginPatterns(List.of("*"));
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("*"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
