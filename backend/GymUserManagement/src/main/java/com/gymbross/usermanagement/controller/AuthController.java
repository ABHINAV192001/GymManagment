package com.gymbross.usermanagement.controller;

import com.gymbross.usermanagement.dto.AuthDtos.AuthResponse;
import com.gymbross.usermanagement.dto.AuthDtos.LoginRequest;
import com.gymbross.usermanagement.dto.AuthDtos.RegisterRequest;
import com.gymbross.usermanagement.dto.AuthDtos.RegisterResponse;
import com.gymbross.usermanagement.dto.AuthDtos.ResendOtpRequest;
import com.gymbross.usermanagement.dto.AuthDtos.VerifyOtpRequest;
import com.gymbross.usermanagement.dto.RegisterPremiumUserDto;
import com.gymbross.usermanagement.dto.RegisterStaffDto;
import com.gymbross.usermanagement.dto.RegisterTrainerDto;
import com.gymbross.usermanagement.dto.RegisterUserDto;
import com.gymbross.usermanagement.service.AuthService;
import com.gymbross.usermanagement.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @org.springframework.web.bind.annotation.RequestParam Long organizationId,
            @org.springframework.web.bind.annotation.RequestParam("OTP") String otpCode) {
        authService.verifyOrganizationOtp(organizationId, otpCode);
        return ResponseEntity.ok("OTP verified successfully");
    }

    @PostMapping("/verify-account")
    public ResponseEntity<String> verifyAccount(
            @org.springframework.web.bind.annotation.RequestParam String email,
            @org.springframework.web.bind.annotation.RequestParam String otp) {
        otpService.verifyOtp(email, otp, "REGISTER");
        return ResponseEntity.ok("Account verified successfully");
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(
            @org.springframework.web.bind.annotation.RequestParam Long organizationId) {
        authService.resendOrganizationOtp(organizationId);
        return ResponseEntity.ok("OTP sent successfully");
    }

    @PostMapping("/register-organization")
    public ResponseEntity<RegisterResponse> registerOrganization(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.registerOrganization(request));
    }

    @PostMapping("/register-user")
    public ResponseEntity<String> registerUser(@RequestBody RegisterUserDto request) {
        return ResponseEntity.ok(authService.registerUser(request));
    }

    @PostMapping("/register-trainer")
    public ResponseEntity<String> registerTrainer(
            @RequestBody RegisterTrainerDto request) {
        return ResponseEntity.ok(authService.registerTrainer(request));
    }

    @PostMapping("/register-staff")
    public ResponseEntity<String> registerStaff(@RequestBody RegisterStaffDto request) {
        return ResponseEntity.ok(authService.registerStaff(request));
    }

    @PostMapping("/register-premium-user")
    public ResponseEntity<String> registerPremiumUser(
            @RequestBody RegisterPremiumUserDto request) {
        return ResponseEntity.ok(authService.registerPremiumUser(request));
    }

    @PostMapping("/complete-registration")
    public ResponseEntity<String> completeRegistration(
            @Valid @RequestBody com.gymbross.usermanagement.dto.AuthDtos.CompleteRegistrationRequest request) {
        return ResponseEntity.ok(authService.completeRegistration(request));
    }

    @PostMapping("/resend-invite")
    public ResponseEntity<String> resendInvite(
            @Valid @RequestBody com.gymbross.usermanagement.dto.AuthDtos.ResendInviteRequest request) {
        return ResponseEntity.ok(authService.resendInvite(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);

        org.springframework.http.ResponseCookie jwtCookie = org.springframework.http.ResponseCookie
                .from("accessToken", authResponse.getToken())
                .httpOnly(false) // Changed to false to allow frontend access
                .secure(false) // Set to true in production
                .path("/")
                .maxAge(24 * 60 * 60) // 1 day
                .build();

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(authResponse);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestBody com.gymbross.usermanagement.dto.AuthDtos.ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok("OTP sent to your email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody com.gymbross.usermanagement.dto.AuthDtos.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully");
    }

}
