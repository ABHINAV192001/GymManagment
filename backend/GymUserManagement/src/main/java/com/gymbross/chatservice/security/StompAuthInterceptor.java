package com.gymbross.chatservice.security;

import com.Gym.GymCommonServices.security.TokenRevocationService;
import com.Gym.GymCommonServices.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class StompAuthInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TokenRevocationService tokenRevocationService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Missing or invalid Authorization header");
            }
            String token = authHeader.substring(7);
            if (!jwtUtil.isTokenValid(token)) {
                throw new IllegalArgumentException("Invalid or expired JWT token");
            }
            if (tokenRevocationService.isRevoked(jwtUtil.extractJti(token))) {
                throw new IllegalArgumentException("Token has been revoked");
            }

            String username = jwtUtil.extractUsername(token);
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                username, null, Collections.emptyList()
            );
            accessor.setUser(auth);
        }
        return message;
    }
}
