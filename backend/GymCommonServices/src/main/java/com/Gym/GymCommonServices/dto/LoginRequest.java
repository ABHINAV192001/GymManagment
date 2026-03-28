package com.Gym.GymCommonServices.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String identifier; // email or username
    private String password;
}
