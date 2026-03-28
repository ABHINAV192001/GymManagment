package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.UserDietPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DietPlanRepository extends JpaRepository<UserDietPlan, Long> {
    List<UserDietPlan> findByUserIdAndIsDeletedFalse(Long userId);

    List<UserDietPlan> findByPremiumUserIdAndIsDeletedFalse(Long premiumUserId);
}
