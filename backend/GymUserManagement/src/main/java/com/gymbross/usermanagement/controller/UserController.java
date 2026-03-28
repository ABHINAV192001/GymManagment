package com.gymbross.usermanagement.controller;

import com.gymbross.usermanagement.dto.UserProfileDto;
import com.gymbross.usermanagement.security.JwtUtil;
import com.gymbross.usermanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(Principal principal) {
        System.out.println(
                "UserController: getProfile called for: " + (principal != null ? principal.getName() : "null"));
        // Principal.getName() returns the username (email or username depending on
        // config)
        try {
            return ResponseEntity.ok(userService.getProfile(principal.getName()));
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            Principal principal,
            @RequestBody UserProfileDto dto) {
        return ResponseEntity.ok(userService.updateProfile(principal.getName(), dto));
    }

    @PatchMapping("/status")
    public ResponseEntity<Void> toggleStatus(@RequestParam boolean isActive, Principal principal) {
        userService.toggleUserStatus(principal.getName(), isActive);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/attendance")
    public ResponseEntity<java.util.List<Object>> getAttendanceHistory(Principal principal) {
        return ResponseEntity.ok(userService.getAttendanceHistory(principal.getName()));
    }

    @GetMapping("/subscription-history")
    public ResponseEntity<java.util.List<Object>> getSubscriptionHistory(Principal principal) {
        return ResponseEntity.ok(userService.getSubscriptionHistory(principal.getName()));
    }

    @PostMapping("/onboarding")
    public ResponseEntity<Void> submitOnboarding(Principal principal,
            @RequestBody com.gymbross.usermanagement.dto.OnboardingDto dto) {
        userService.submitOnboarding(principal.getName(), dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<com.gymbross.usermanagement.dto.DashboardDto> getDashboardStats(
            Principal principal,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(userService.getDashboardStats(principal.getName(), date));
    }

    @PostMapping("/water/log")
    public ResponseEntity<Void> logWater(Principal principal, @RequestBody java.util.Map<String, Object> payload) {
        double amount = Double.parseDouble(payload.get("amount").toString());
        String date = (String) payload.get("date");
        userService.logWater(principal.getName(), amount, date);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/daily-log")
    public ResponseEntity<com.gymbross.usermanagement.dto.DailyLogDto> getDailyLog(
            Principal principal,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(userService.getDailyLog(principal.getName(), date));
    }

    @DeleteMapping("/food/log/{id}")
    public ResponseEntity<?> deleteFoodLog(@PathVariable Long id,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        String username = jwtUtil.extractUsername(token.substring(7));
        userService.deleteFoodLog(id, username);
        return ResponseEntity.ok("Deleted");
    }

    @DeleteMapping("/water/log/{id}")
    public ResponseEntity<?> deleteWaterLog(@PathVariable Long id,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String token) {
        String username = jwtUtil.extractUsername(token.substring(7));
        userService.deleteWaterLog(id, username);
        return ResponseEntity.ok("Deleted");
    }
}
