package com.gymbross.workout.repository;

import com.Gym.GymCommonServices.entity.WeeklyWorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeeklyWorkoutPlanRepository extends JpaRepository<WeeklyWorkoutPlan, Long> {
    java.util.Optional<WeeklyWorkoutPlan> findByUserId(Long userId);
}
