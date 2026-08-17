package com.gymbross.workout.repository;

import com.Gym.GymCommonServices.entity.WeeklyWorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeeklyWorkoutPlanRepository extends JpaRepository<WeeklyWorkoutPlan, java.util.UUID> {
    java.util.Optional<WeeklyWorkoutPlan> findByUserId(java.util.UUID userId);
}
