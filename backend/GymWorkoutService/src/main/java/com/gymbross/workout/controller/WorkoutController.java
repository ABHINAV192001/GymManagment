package com.gymbross.workout.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.Gym.GymCommonServices.dto.WorkoutDto;
import com.gymbross.workout.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import java.util.List;

@RestController
@RequestMapping("/api/workout") // Changed from /api/user/workout for clarity
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<WorkoutDto>>> getWorkouts(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(ApiResponse.success(workoutService.getWorkoutsByCategory(category)));
    }

    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<WorkoutDto>>> getAllWorkouts() {
        return ResponseEntity.ok(ApiResponse.success(workoutService.getAllWorkouts()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<WorkoutDto>> getWorkout(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(workoutService.getWorkoutById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<WorkoutDto>> createWorkout(@RequestBody WorkoutDto workoutDto) {
        return ResponseEntity.ok(ApiResponse.success(workoutService.createWorkout(workoutDto), "Workout created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<WorkoutDto>> updateWorkout(@PathVariable Long id, @RequestBody WorkoutDto workoutDto) {
        return ResponseEntity.ok(ApiResponse.success(workoutService.updateWorkout(id, workoutDto), "Workout updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteWorkout(@PathVariable Long id) {
        workoutService.deleteWorkout(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Workout deleted successfully"));
    }

    @PostMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> saveHistory(@RequestBody WorkoutHistoryRequest request, Principal principal) {
        String email = principal.getName();
        workoutService.saveWorkoutHistory(email, request.getWorkoutId(), request.getDuration(), request.getCalories());
        return ResponseEntity.ok(ApiResponse.success(null, "Workout history saved"));
    }

    @Data
    public static class WorkoutHistoryRequest {
        private Long workoutId;
        private Integer duration;
        private Integer calories;
    }
}
