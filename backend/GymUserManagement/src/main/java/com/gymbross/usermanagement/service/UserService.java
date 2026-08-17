package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.dto.UserProfileDto;

public interface UserService {


    // Mock data for UI
    java.util.List<Object> getAttendanceHistory(String username);

    com.gymbross.usermanagement.dto.DashboardDto getDashboardStats(String username, String date);

    java.util.List<Object> getSubscriptionHistory(String username);

    UserProfileDto getInviteDetails(String userCode, String adminCode, String role);

    void submitOnboarding(String username, com.gymbross.usermanagement.dto.OnboardingDto dto);

    void logWater(String username, com.gymbross.usermanagement.dto.WaterLogRequestDto request);

    com.gymbross.usermanagement.dto.DailyLogDto getDailyLog(String username, String date);

    void deleteFoodLog(java.util.UUID id, String username);

    void deleteWaterLog(java.util.UUID id, String username);
}
