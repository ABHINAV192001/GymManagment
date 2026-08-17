package com.gymbross.usermanagement.service.strategy;

import com.gymbross.usermanagement.dto.UserProfileDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserProfileFacade {

    private final List<UserProfileStrategy> profileStrategies;

    public UserProfileDto getProfile(String username) {
        return profileStrategies.stream()
                .filter(strategy -> strategy.supports(username))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username))
                .getProfile(username);
    }
    
    public UserProfileDto updateProfile(String username, UserProfileDto dto) {
        return profileStrategies.stream()
                .filter(strategy -> strategy.supports(username))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username))
                .updateProfile(username, dto);
    }
    
    public void toggleUserStatus(String username, boolean isActive) {
        profileStrategies.stream()
                .filter(strategy -> strategy.supports(username))
                .findFirst()
                .ifPresent(strategy -> strategy.toggleUserStatus(username, isActive));
    }
}
