package com.gymbross.usermanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

public class OrganizationDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationRequest {
        @NotBlank(message = "Organization Code is required")
        private String orgCode;

        @NotBlank(message = "Username is required")
        private String username;

        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Owner Email is required")
        @Email(message = "Invalid email format")
        private String ownerEmail;

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^\\+?[0-9. ()-]{7,25}$", message = "Invalid phone number")
        private String phone;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationResponse {
        private UUID id;
        private String orgCode;
        private String username;
        private String name;
        private String ownerEmail;
        private String phone;
        private Boolean isActive;
        private Boolean isEmailVerified;
        private Boolean isPhoneVerified;
    }
}
