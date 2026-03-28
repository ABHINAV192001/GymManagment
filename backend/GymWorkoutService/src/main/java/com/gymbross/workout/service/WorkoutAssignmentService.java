package com.gymbross.workout.service;

import com.Gym.GymCommonServices.dto.AssignWorkoutRequest;
import com.Gym.GymCommonServices.dto.WeeklyWorkoutPlanDto;

public interface WorkoutAssignmentService {
    WeeklyWorkoutPlanDto assignWorkoutToUser(AssignWorkoutRequest request);

    WeeklyWorkoutPlanDto getUserWeeklyPlan(Long userId);
}
