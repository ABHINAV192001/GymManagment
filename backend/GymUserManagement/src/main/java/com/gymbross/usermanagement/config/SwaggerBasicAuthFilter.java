package com.gymbross.usermanagement.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class SwaggerBasicAuthFilter extends OncePerRequestFilter {

    @Value("${swagger.auth.username:}")
    private String swaggerUsername;

    @Value("${swagger.auth.password:}")
    private String swaggerPassword;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        boolean authConfigured = swaggerUsername != null && !swaggerUsername.isBlank()
                && swaggerPassword != null && !swaggerPassword.isBlank();

        if (authConfigured && (path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") || path.startsWith("/swagger-resources"))) {
            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Basic ")) {
                try {
                    String base64Credentials = authHeader.substring(6);
                    byte[] credDecoded = Base64.getDecoder().decode(base64Credentials);
                    String credentials = new String(credDecoded, StandardCharsets.UTF_8);
                    String[] values = credentials.split(":", 2);

                    if (values.length == 2 && swaggerUsername.equals(values[0]) && swaggerPassword.equals(values[1])) {
                        filterChain.doFilter(request, response);
                        return;
                    }
                } catch (Exception ignored) {
                }
            }

            response.setHeader("WWW-Authenticate", "Basic realm=\"Swagger UI Security\"");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Unauthorized access to Swagger UI.");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
