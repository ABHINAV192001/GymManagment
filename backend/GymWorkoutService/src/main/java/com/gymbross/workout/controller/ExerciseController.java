package com.gymbross.workout.controller;

import com.Gym.GymCommonServices.dto.ExerciseDto;
import com.gymbross.workout.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @PostMapping
    public ResponseEntity<ExerciseDto> createExercise(@RequestBody ExerciseDto exerciseDto) {
        return ResponseEntity.ok(exerciseService.createExercise(exerciseDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExerciseDto> updateExercise(@PathVariable Long id, @RequestBody ExerciseDto exerciseDto) {
        return ResponseEntity.ok(exerciseService.updateExercise(id, exerciseDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id) {
        exerciseService.deleteExercise(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExerciseDto> getExercise(@PathVariable Long id) {
        return ResponseEntity.ok(exerciseService.getExercise(id));
    }

    @GetMapping
    public ResponseEntity<List<ExerciseDto>> getAllExercises(@RequestParam(required = false) String muscleGroup) {
        return ResponseEntity.ok(exerciseService.getAllExercises(muscleGroup));
    }
}
