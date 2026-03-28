package com.Gym.GymCommonServices.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String role;
    private Long organizationId;
    private Long branchId;
}
