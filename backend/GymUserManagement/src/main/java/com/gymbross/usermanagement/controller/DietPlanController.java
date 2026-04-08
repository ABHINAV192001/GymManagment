package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.entity.UserDietPlan;
import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.service.DietPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/diet")
@RequiredArgsConstructor
public class DietPlanController {

    private final DietPlanService dietPlanService;

    @PostMapping(value = "/assign", consumes = { "multipart/form-data" })
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<UserDietPlan>> assignDietPlan(
            @RequestParam Long userId,
            @RequestPart("dietPlan") UserDietPlan dietPlan,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(dietPlanService.assignDietPlan(userId, dietPlan, file), "Diet plan assigned successfully"));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<UserDietPlan>>> getUserDietPlans(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(dietPlanService.getUserDietPlans(userId)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<Void>> deleteDietPlan(@PathVariable Long id) {
        dietPlanService.deleteDietPlan(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Diet plan deleted successfully"));
    }
}
