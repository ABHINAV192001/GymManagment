package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.dto.AuthDtos.*;
import com.gymbross.usermanagement.dto.RegisterPremiumUserDto;
import com.gymbross.usermanagement.dto.RegisterStaffDto;
import com.gymbross.usermanagement.dto.RegisterTrainerDto;
import com.gymbross.usermanagement.dto.RegisterUserDto;
import com.gymbross.usermanagement.service.AuthService;
import com.gymbross.usermanagement.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        ResponseCookie cookie = buildCookie("accessToken", response.getToken(), 8 * 60 * 60);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        AuthResponse response = authService.refreshAccessToken(request);
        ResponseCookie cookie = buildCookie("accessToken", response.getToken(), 8 * 60 * 60);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestParam String email) {
        // In a full implementation, we'd also blacklist the current access token
        authService.logout(email); 
        ResponseCookie cookie = buildCookie("accessToken", "", 0);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.success(null, "Logged out successfully"));
    }

    @PostMapping("/register-organization")
    public ResponseEntity<ApiResponse<RegisterResponse>> registerOrganization(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.registerOrganization(request), "Organization registered"));
    }

    @PostMapping("/register-user")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody RegisterUserDto request) {
        return ResponseEntity.ok(ApiResponse.success(authService.registerUser(request)));
    }

    @PostMapping("/register-trainer")
    public ResponseEntity<ApiResponse<String>> registerTrainer(@Valid @RequestBody RegisterTrainerDto request) {
        return ResponseEntity.ok(ApiResponse.success(authService.registerTrainer(request)));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@RequestParam Long organizationId, @RequestParam String OTP) {
        authService.verifyOrganizationOtp(organizationId, OTP);
        return ResponseEntity.ok(ApiResponse.success(null, "OTP verified"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "OTP sent to email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successful"));
    }

    private ResponseCookie buildCookie(String name, String value, long maxAge) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();
    }
}
