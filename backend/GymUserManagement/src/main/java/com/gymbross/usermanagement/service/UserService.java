package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.dto.UserProfileDto;

public interface UserService {
    UserProfileDto getProfile(String username);

    UserProfileDto updateProfile(String username, UserProfileDto dto);

    void toggleUserStatus(String username, boolean isActive);

    // Mock data for UI
    java.util.List<Object> getAttendanceHistory(String username);

    com.gymbross.usermanagement.dto.DashboardDto getDashboardStats(String username, String date);

    java.util.List<Object> getSubscriptionHistory(String username);

    UserProfileDto getInviteDetails(String userCode, String adminCode, String role);

    void submitOnboarding(String username, com.gymbross.usermanagement.dto.OnboardingDto dto);

    void logWater(String username, double amount, String date);

    com.gymbross.usermanagement.dto.DailyLogDto getDailyLog(String username, String date);

    void deleteFoodLog(Long id, String username);

    void deleteWaterLog(Long id, String username);
}
