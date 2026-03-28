package com.gymbross.workout.service;

import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.UserDietPlan;
import com.Gym.GymCommonServices.entity.Role;
import com.gymbross.workout.repository.UserDietPlanRepository;
import com.gymbross.workout.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDietPlanService {

    private final UserDietPlanRepository userDietPlanRepository;
    private final UserRepository userRepository;

    @Transactional
    public UserDietPlan assignDietPlan(Long userId, UserDietPlan dietPlan) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Role.PREMIUM_USER.equals(user.getRole())) {
            throw new RuntimeException("Diet plans can only be assigned to Prime (Premium) Users.");
        }

        dietPlan.setUser(user);
        return userDietPlanRepository.save(dietPlan);
    }

    public List<UserDietPlan> getUserDietPlans(Long userId) {
        return userDietPlanRepository.findByUserIdAndIsDeletedFalse(userId);
    }

    @Transactional
    public void deleteDietPlan(Long planId) {
        UserDietPlan plan = userDietPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Diet plan not found"));
        plan.setIsDeleted(true);
        userDietPlanRepository.save(plan);
    }
}
