package com.Gym.GymCommonServices.dto;

import lombok.Data;

@Data
public class BranchRequest {
    private String code;
    private String name;
    private String adminEmail;
    private String password;
}
