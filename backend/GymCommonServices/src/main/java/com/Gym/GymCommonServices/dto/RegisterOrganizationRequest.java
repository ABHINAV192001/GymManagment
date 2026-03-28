package com.Gym.GymCommonServices.dto;

import lombok.Data;
import java.util.List;

@Data
public class RegisterOrganizationRequest {
    private String name;
    private String ownerEmail;
    private String contactNumber;
    private String password;
    private List<BranchRequest> branches;
}
