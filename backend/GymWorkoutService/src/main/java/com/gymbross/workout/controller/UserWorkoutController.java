package com.gymbross.workout.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.Gym.GymCommonServices.dto.WeeklyWorkoutPlanDto;
import com.gymbross.workout.service.UserWorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout/user-plan")
@RequiredArgsConstructor
public class UserWorkoutController {

    private final UserWorkoutService userWorkoutService;

    @PutMapping("/{userId}")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<Void>> updateWorkoutPlan(@PathVariable Long userId, @RequestBody List<String> workoutPlan) {
        userWorkoutService.updateWorkoutPlan(userId, workoutPlan);
        return ResponseEntity.ok(ApiResponse.success(null, "Workout plan updated successfully"));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<String>>> getWorkoutPlan(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(userWorkoutService.getWorkoutPlan(userId)));
    }

    @PostMapping("/{userId}/weekly")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<Void>> updateWeeklyPlan(@PathVariable Long userId, @RequestBody WeeklyWorkoutPlanDto dto) {
        userWorkoutService.updateWeeklyPlan(userId, dto);
        return ResponseEntity.ok(ApiResponse.success(null, "Weekly plan updated successfully"));
    }

    @GetMapping("/{userId}/weekly")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<WeeklyWorkoutPlanDto>> getWeeklyPlan(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(userWorkoutService.getWeeklyPlan(userId)));
    }
}
