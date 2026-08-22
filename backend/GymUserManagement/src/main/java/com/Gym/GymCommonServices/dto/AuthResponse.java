package com.Gym.GymCommonServices.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String role;
    private java.util.UUID organizationId;
    private java.util.UUID branchId;
}
