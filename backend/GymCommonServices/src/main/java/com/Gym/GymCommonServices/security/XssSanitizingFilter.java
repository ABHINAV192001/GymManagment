package com.Gym.GymCommonServices.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that wraps incoming HTTP requests with XssRequestWrapper to sanitize input.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public class XssSanitizingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        if (isExcluded(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        XssRequestWrapper wrappedRequest = new XssRequestWrapper(request);
        filterChain.doFilter(wrappedRequest, response);
    }

    private boolean isExcluded(String path) {
        if (path == null) return false;
        String lower = path.toLowerCase();
        return lower.startsWith("/swagger-ui") ||
               lower.startsWith("/v3/api-docs") ||
               lower.startsWith("/webjars") ||
               lower.startsWith("/ws") ||
               lower.startsWith("/chat/ws");
    }
}
