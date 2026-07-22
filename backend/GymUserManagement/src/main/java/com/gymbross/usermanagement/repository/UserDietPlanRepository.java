package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.UserDietPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserDietPlanRepository extends JpaRepository<UserDietPlan, java.util.UUID> {
    List<UserDietPlan> findByUserIdAndIsDeletedFalse(java.util.UUID userId);
}
