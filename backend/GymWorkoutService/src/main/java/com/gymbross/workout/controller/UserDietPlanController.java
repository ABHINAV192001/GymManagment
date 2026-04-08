package com.gymbross.workout.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.Gym.GymCommonServices.entity.UserDietPlan;
import com.gymbross.workout.service.UserDietPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workout/diet-plan")
@RequiredArgsConstructor
public class UserDietPlanController {

    private final UserDietPlanService userDietPlanService;

    @PostMapping("/{userId}")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<UserDietPlan>> assignDietPlan(@PathVariable Long userId, @RequestBody UserDietPlan dietPlan) {
        return ResponseEntity.ok(ApiResponse.success(userDietPlanService.assignDietPlan(userId, dietPlan), "Diet plan assigned successfully"));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<UserDietPlan>>> getUserDietPlans(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(userDietPlanService.getUserDietPlans(userId)));
    }

    @DeleteMapping("/{planId}")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<Void>> deleteDietPlan(@PathVariable Long planId) {
        userDietPlanService.deleteDietPlan(planId);
        return ResponseEntity.ok(ApiResponse.success(null, "Diet plan deleted successfully"));
    }
}
