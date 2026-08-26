package com.gymbross.workout.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.Gym.GymCommonServices.dto.WorkoutDto;
import com.gymbross.workout.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import java.security.Principal;

import java.util.List;

@RestController
@RequestMapping("/api/workout") // Changed from /api/user/workout for clarity
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkoutDto>>> getWorkouts(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(ApiResponse.success(workoutService.getWorkoutsByCategory(category)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<WorkoutDto>>> getAllWorkouts() {
        return ResponseEntity.ok(ApiResponse.success(workoutService.getAllWorkouts()));
    }

    @GetMapping("/my-splits")
    public ResponseEntity<ApiResponse<List<WorkoutDto>>> getMySplits(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(workoutService.getWorkoutsByCategory("CUSTOM_SPLIT")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkoutDto>> getWorkout(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(ApiResponse.success(workoutService.getWorkoutById(id)));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<WorkoutDto>> createWorkout(@RequestBody WorkoutDto workoutDto) {
        return ResponseEntity.ok(ApiResponse.success(workoutService.createWorkout(workoutDto), "Workout created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<WorkoutDto>> updateWorkout(@PathVariable java.util.UUID id, @RequestBody WorkoutDto workoutDto) {
        return ResponseEntity.ok(ApiResponse.success(workoutService.updateWorkout(id, workoutDto), "Workout updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteWorkout(@PathVariable java.util.UUID id) {
        workoutService.deleteWorkout(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Workout deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<WorkoutDto>>> searchWorkouts(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<WorkoutDto> result = workoutService.searchWorkouts(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
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
        private java.util.UUID workoutId;
        private Integer duration;
        private Integer calories;
    }
}
