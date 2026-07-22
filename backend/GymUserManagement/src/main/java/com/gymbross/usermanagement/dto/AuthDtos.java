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
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
        @NotBlank(message = "User email is required")
        private String adminEmail;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RegisterRequest {
        @JsonProperty("Gymname")
        @NotBlank(message = "Gym name is required")
        private String name; // Organization name

        @Email(message = "Invalid email format")
        @NotBlank(message = "Owner email is required")
        private String ownerEmail; // Owner email

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password; // Org password

        @NotBlank(message = "Address line 1 is required")
        private String addressLine1;

        private String addressLine2;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "Pincode is required")
        @Pattern(regexp = "^\\d{6}$", message = "Pincode must be exactly 6 digits")
        private String pincode;

        private String gst;

        private Integer numberOfOwners;

        @NotBlank(message = "Owner name is required")
        private String ownerName;

        private String ownerContactEmail;

        private String pan;

        @JsonProperty("Phone")
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
        private String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterResponse {
        private String message;
        private java.util.UUID organizationId;
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
        private String refreshToken;
        private String role;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TokenRefreshRequest {
        // No longer @NotBlank - the refresh token is primarily read from the httpOnly
        // cookie by the controller; this field is only a fallback for callers that still
        // send it in the body.
        private String refreshToken;
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

        @NotBlank(message = "User Code is required")
        private String adminCode;

        @NotBlank(message = "String is required")
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

        @NotBlank(message = "String is required")
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
