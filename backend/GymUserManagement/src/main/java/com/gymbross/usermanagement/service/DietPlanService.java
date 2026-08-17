package com.gymbross.usermanagement.service;

import com.Gym.GymCommonServices.entity.UserDietPlan;

import java.util.List;

public interface DietPlanService {
    UserDietPlan assignDietPlan(java.util.UUID userId, UserDietPlan dietPlan,
            org.springframework.web.multipart.MultipartFile file, java.util.UUID orgId, java.util.UUID branchId);

    List<UserDietPlan> getUserDietPlans(java.util.UUID userId, java.util.UUID orgId, java.util.UUID branchId);

    void deleteDietPlan(java.util.UUID id, java.util.UUID orgId, java.util.UUID branchId);
}
