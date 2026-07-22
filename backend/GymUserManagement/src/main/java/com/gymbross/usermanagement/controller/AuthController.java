package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.dto.AuthDtos.*;
import com.gymbross.usermanagement.dto.RegisterPremiumUserDto;
import com.gymbross.usermanagement.dto.RegisterStaffDto;
import com.gymbross.usermanagement.dto.RegisterTrainerDto;
import com.gymbross.usermanagement.dto.RegisterUserDto;
import com.gymbross.usermanagement.service.AuthService;
import com.gymbross.usermanagement.service.OtpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @org.springframework.beans.factory.annotation.Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @org.springframework.beans.factory.annotation.Value("${app.cookie.sameSite:Lax}")
    private String cookieSameSite;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildCookie("accessToken", response.getToken(), 8 * 60 * 60).toString())
                .header(HttpHeaders.SET_COOKIE, buildCookie("refreshToken", response.getRefreshToken(), 7 * 24 * 60 * 60).toString())
                .body(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestBody(required = false) TokenRefreshRequest request,
            HttpServletRequest httpRequest) {
        String refreshTokenValue = extractCookie(httpRequest, "refreshToken");
        if (refreshTokenValue == null && request != null) {
            refreshTokenValue = request.getRefreshToken();
        }
        TokenRefreshRequest resolved = new TokenRefreshRequest(refreshTokenValue);
        AuthResponse response = authService.refreshAccessToken(resolved);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildCookie("accessToken", response.getToken(), 8 * 60 * 60).toString())
                .header(HttpHeaders.SET_COOKIE, buildCookie("refreshToken", response.getRefreshToken(), 7 * 24 * 60 * 60).toString())
                .body(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(Authentication authentication, HttpServletRequest request) {
        String email = authentication.getName();
        authService.logout(email, extractAccessToken(request));

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildCookie("accessToken", "", 0).toString())
                .header(HttpHeaders.SET_COOKIE, buildCookie("refreshToken", "", 0).toString())
                .body(ApiResponse.success(null, "Logged out successfully"));
    }

    private String extractAccessToken(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return extractCookie(request, "accessToken");
    }

    private String extractCookie(HttpServletRequest request, String name) {
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if (name.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                    return cookie.getValue();
                }
            }
        }
        return null;
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
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        authService.verifyEmailOtp(email, otp);
        return ResponseEntity.ok(ApiResponse.success(null, "Email verified successfully"));
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

    @PostMapping("/resend-invite")
    public ResponseEntity<ApiResponse<String>> resendInvite(@Valid @RequestBody ResendInviteRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.resendInvite(request)));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return ResponseEntity.ok(ApiResponse.success(null, "OTP resent successfully"));
    }

    @PostMapping("/complete-registration")
    public ResponseEntity<ApiResponse<String>> completeRegistration(@Valid @RequestBody CompleteRegistrationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.completeRegistration(request)));
    }


    private ResponseCookie buildCookie(String name, String value, long maxAge) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAge)
                .sameSite(cookieSameSite)
                .build();
    }
}
