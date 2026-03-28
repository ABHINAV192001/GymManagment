package com.gymbross.workout.controller;

import com.Gym.GymCommonServices.entity.UserDietPlan;
import com.gymbross.workout.service.UserDietPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout/diet-plan")
@RequiredArgsConstructor
public class UserDietPlanController {

    private final UserDietPlanService userDietPlanService;

    @PostMapping("/{userId}")
    public ResponseEntity<UserDietPlan> assignDietPlan(@PathVariable Long userId, @RequestBody UserDietPlan dietPlan) {
        return ResponseEntity.ok(userDietPlanService.assignDietPlan(userId, dietPlan));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<UserDietPlan>> getUserDietPlans(@PathVariable Long userId) {
        return ResponseEntity.ok(userDietPlanService.getUserDietPlans(userId));
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deleteDietPlan(@PathVariable Long planId) {
        userDietPlanService.deleteDietPlan(planId);
        return ResponseEntity.ok().build();
    }
}
