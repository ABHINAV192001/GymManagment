package com.gymbross.workout.controller;

import com.Gym.GymCommonServices.dto.AssignWorkoutRequest;
import com.Gym.GymCommonServices.dto.WeeklyWorkoutPlanDto;
import com.gymbross.workout.service.WorkoutAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workout")
@RequiredArgsConstructor
public class WorkoutAssignmentController {

    private final WorkoutAssignmentService workoutAssignmentService;

    @PostMapping("/assign")
    public ResponseEntity<WeeklyWorkoutPlanDto> assignWorkout(@RequestBody AssignWorkoutRequest request) {
        return ResponseEntity.ok(workoutAssignmentService.assignWorkoutToUser(request));
    }

    @GetMapping("/assignment/{userId}")
    public ResponseEntity<WeeklyWorkoutPlanDto> getUserWeeklyPlan(@PathVariable Long userId) {
        return ResponseEntity.ok(workoutAssignmentService.getUserWeeklyPlan(userId));
    }
}
