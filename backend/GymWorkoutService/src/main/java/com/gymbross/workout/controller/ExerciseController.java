package com.gymbross.workout.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.Gym.GymCommonServices.dto.ExerciseDto;
import com.gymbross.workout.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<ExerciseDto>> createExercise(@RequestBody ExerciseDto exerciseDto) {
        return ResponseEntity.ok(ApiResponse.success(exerciseService.createExercise(exerciseDto), "Exercise created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<ExerciseDto>> updateExercise(@PathVariable Long id, @RequestBody ExerciseDto exerciseDto) {
        return ResponseEntity.ok(ApiResponse.success(exerciseService.updateExercise(id, exerciseDto), "Exercise updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteExercise(@PathVariable Long id) {
        exerciseService.deleteExercise(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Exercise deleted successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ExerciseDto>> getExercise(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(exerciseService.getExercise(id)));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ExerciseDto>>> getAllExercises(@RequestParam(required = false) String muscleGroup) {
        return ResponseEntity.ok(ApiResponse.success(exerciseService.getAllExercises(muscleGroup)));
    }
}
