package com.gymbross.workout.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.Gym.GymCommonServices.dto.AssignWorkoutRequest;
import com.Gym.GymCommonServices.dto.WeeklyWorkoutPlanDto;
import com.gymbross.workout.service.WorkoutAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workout")
@RequiredArgsConstructor
public class WorkoutAssignmentController {

    private final WorkoutAssignmentService workoutAssignmentService;

    @PostMapping("/assign")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<WeeklyWorkoutPlanDto>> assignWorkout(@RequestBody AssignWorkoutRequest request) {
        return ResponseEntity.ok(ApiResponse.success(workoutAssignmentService.assignWorkoutToUser(request), "Workout assigned successfully"));
    }

    @GetMapping("/assignment/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<WeeklyWorkoutPlanDto>> getUserWeeklyPlan(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(workoutAssignmentService.getUserWeeklyPlan(userId)));
    }
}
