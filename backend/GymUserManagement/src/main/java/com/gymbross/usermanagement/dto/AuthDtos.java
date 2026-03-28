package com.gymbross.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public class AuthDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchRequest {
        private String branchCode; // Optional if generated

        @NotBlank(message = "Branch name is required")
        private String name;

        @Email(message = "Invalid email format")
        @NotBlank(message = "Admin email is required")
        private String adminEmail;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Organization name is required")
        private String name; // Organization name

        @Email(message = "Invalid email format")
        @NotBlank(message = "Owner email is required")
        private String ownerEmail; // Owner email

        @Pattern(regexp = "^\\d{10}$", message = "Phone must be 10 digits")
        private String phone; // Owner phone

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password; // Org password

        @NotEmpty(message = "At least one branch is required")
        @Valid
        private List<BranchRequest> branches; // Required list of branches to create
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterResponse {
        private String message;
        private Long organizationId;
        private String organizationCode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String identifier; // email or username
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String role;
        private Long organizationId;
        private Long branchId;
        private Boolean isOnboardingCompleted;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyOtpRequest {
        private String email;
        private String otpCode;
        private String otpType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResendOtpRequest {
        private String email;
        private String phone;
        private String otpType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompleteRegistrationRequest {
        @NotBlank(message = "User Code is required")
        private String userCode;

        @NotBlank(message = "Admin Code is required")
        private String adminCode;

        @NotBlank(message = "Role is required")
        private String role;

        @NotBlank(message = "Password is required")
        private String password;

        @NotBlank(message = "OTP is required")
        private String otp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResendInviteRequest {
        @NotBlank(message = "User Code is required")
        private String userCode;

        @NotBlank(message = "Role is required")
        private String role;

        // We can infer admin from authenticated user, or pass it if necessary.
        // For simplicity, we'll infer or fetch based on user's branch admin.
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForgotPasswordRequest {
        @NotBlank(message = "Email is required")
        private String email;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetPasswordRequest {
        @NotBlank(message = "Email is required")
        private String email;
        @NotBlank(message = "OTP is required")
        private String otp;
        @NotBlank(message = "New password is required")
        private String newPassword;
    }
}
