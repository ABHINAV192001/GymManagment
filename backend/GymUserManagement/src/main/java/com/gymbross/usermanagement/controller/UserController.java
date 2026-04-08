package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.dto.UserProfileDto;
import com.gymbross.usermanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(principal.getName())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(Principal principal, @RequestBody UserProfileDto dto) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(principal.getName(), dto)));
    }

    @PostMapping("/onboarding")
    public ResponseEntity<ApiResponse<Void>> submitOnboarding(Principal principal, @RequestBody com.gymbross.usermanagement.dto.OnboardingDto dto) {
        userService.submitOnboarding(principal.getName(), dto);
        return ResponseEntity.ok(ApiResponse.success(null, "Onboarding submitted successfully"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<com.gymbross.usermanagement.dto.DashboardDto>> getDashboardStats(
            Principal principal,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(ApiResponse.success(userService.getDashboardStats(principal.getName(), date)));
    }

    @PostMapping("/water/log")
    public ResponseEntity<ApiResponse<Void>> logWater(Principal principal, @RequestBody Map<String, Object> payload) {
        double amount = Double.parseDouble(payload.get("amount").toString());
        String date = (String) payload.get("date");
        userService.logWater(principal.getName(), amount, date);
        return ResponseEntity.ok(ApiResponse.success(null, "Water logged successfully"));
    }

    @GetMapping("/daily-log")
    public ResponseEntity<ApiResponse<com.gymbross.usermanagement.dto.DailyLogDto>> getDailyLog(
            Principal principal,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(ApiResponse.success(userService.getDailyLog(principal.getName(), date)));
    }

    @DeleteMapping("/food/log/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFoodLog(@PathVariable Long id, Principal principal) {
        userService.deleteFoodLog(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Food log deleted"));
    }

    @DeleteMapping("/water/log/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWaterLog(@PathVariable Long id, Principal principal) {
        userService.deleteWaterLog(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Water log deleted"));
    }
}
