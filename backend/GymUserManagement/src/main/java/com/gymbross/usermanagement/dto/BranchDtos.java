package com.gymbross.usermanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

public class BranchDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchRequest {
        private String branchCode;
        private String username;

        @NotBlank(message = "Name is required")
        private String name;

        private String adminEmail;
        private String password;
        
        private UUID adminUserId;
        
        // orgId may be derived from the path variable or JWT in some contexts, but can be provided here
        private UUID orgId; 
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchResponse {
        private UUID id;
        private UUID orgId;
        private String branchCode;
        private String username;
        private String name;
        private String adminEmail;
        private Boolean isActive;
        private UUID adminUserId;
    }
}
