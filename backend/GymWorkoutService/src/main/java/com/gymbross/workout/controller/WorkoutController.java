package com.gymbross.workout.controller;

import com.Gym.GymCommonServices.dto.WorkoutDto;
import com.gymbross.workout.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import java.util.List;

@RestController
@RequestMapping("/api/user/workout")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @GetMapping
    public ResponseEntity<List<WorkoutDto>> getWorkouts(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(workoutService.getWorkoutsByCategory(category));
    }

    @GetMapping("/all")
    public ResponseEntity<List<WorkoutDto>> getAllWorkouts() {
        return ResponseEntity.ok(workoutService.getAllWorkouts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutDto> getWorkout(@PathVariable Long id) {
        return ResponseEntity.ok(workoutService.getWorkoutById(id));
    }

    @PostMapping
    public ResponseEntity<WorkoutDto> createWorkout(@RequestBody WorkoutDto workoutDto) {
        return ResponseEntity.ok(workoutService.createWorkout(workoutDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutDto> updateWorkout(@PathVariable Long id, @RequestBody WorkoutDto workoutDto) {
        return ResponseEntity.ok(workoutService.updateWorkout(id, workoutDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(@PathVariable Long id) {
        workoutService.deleteWorkout(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/history")
    public ResponseEntity<Void> saveHistory(@RequestBody WorkoutHistoryRequest request, Principal principal) {
        // If security config is correct, principal will be populated with email
        String email = principal != null ? principal.getName() : "unknown@example.com";
        // For development if auth is bypassed, might need fallback.
        // But user passed auth to get here.

        workoutService.saveWorkoutHistory(email, request.getWorkoutId(), request.getDuration(), request.getCalories());
        return ResponseEntity.ok().build();
    }

    @Data
    public static class WorkoutHistoryRequest {
        private Long workoutId;
        private Integer duration;
        private Integer calories;
    }
}
