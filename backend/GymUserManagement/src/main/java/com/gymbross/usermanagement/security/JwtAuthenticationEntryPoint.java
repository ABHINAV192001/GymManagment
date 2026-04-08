package com.gymbross.usermanagement.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException, ServletException {
        // This is invoked when user tries to access a secured REST resource without any
        // credentials
        // We should just send a 401 Unauthorized response because there is no 'login
        // page' to redirect to
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String errorMessage = "JWT is expired or invalid, please create a new one";
        String jwtError = (String) request.getAttribute("jwt_error");
        if (jwtError != null) {
            errorMessage += " [Detail: " + jwtError + "]";
        }
        
        response.getWriter().write(
                "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"" + errorMessage + "\"}");
    }
}
