package com.gymbross.usermanagement.service;

import com.Gym.GymCommonServices.entity.UserDietPlan;

import java.util.List;

public interface DietPlanService {
    UserDietPlan assignDietPlan(Long userId, UserDietPlan dietPlan,
            org.springframework.web.multipart.MultipartFile file);

    List<UserDietPlan> getUserDietPlans(Long userId);

    void deleteDietPlan(Long id);
}
