package com.gymbross.workout.controller;

import com.Gym.GymCommonServices.dto.WeeklyWorkoutPlanDto;
import com.gymbross.workout.service.UserWorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout/user-plan")
@RequiredArgsConstructor
public class UserWorkoutController {

    private final UserWorkoutService userWorkoutService;

    @PutMapping("/{userId}")
    public ResponseEntity<Void> updateWorkoutPlan(@PathVariable Long userId, @RequestBody List<String> workoutPlan) {
        userWorkoutService.updateWorkoutPlan(userId, workoutPlan);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<String>> getWorkoutPlan(@PathVariable Long userId) {
        return ResponseEntity.ok(userWorkoutService.getWorkoutPlan(userId));
    }

    @PostMapping("/{userId}/weekly")
    public ResponseEntity<Void> updateWeeklyPlan(@PathVariable Long userId, @RequestBody WeeklyWorkoutPlanDto dto) {
        userWorkoutService.updateWeeklyPlan(userId, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/weekly")
    public ResponseEntity<WeeklyWorkoutPlanDto> getWeeklyPlan(@PathVariable Long userId) {
        return ResponseEntity.ok(userWorkoutService.getWeeklyPlan(userId));
    }
}
