package com.gymbross.usermanagement.service.strategy;

import com.gymbross.usermanagement.dto.UserProfileDto;

public interface UserProfileStrategy {
    boolean supports(String username);
    UserProfileDto getProfile(String username);
    UserProfileDto updateProfile(String username, UserProfileDto dto);
    void toggleUserStatus(String username, boolean isActive);
}
