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
    @PreAuthorize("hasAuthority('DIET:ASSIGN')")
    public ResponseEntity<ApiResponse<UserDietPlan>> assignDietPlan(
            @RequestParam java.util.UUID userId,
            @RequestPart("dietPlan") UserDietPlan dietPlan,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestAttribute("organizationId") java.util.UUID orgId,
            @RequestAttribute(required = false) java.util.UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(dietPlanService.assignDietPlan(userId, dietPlan, file, orgId, branchId), "Diet plan assigned successfully"));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<UserDietPlan>>> getUserDietPlans(@PathVariable java.util.UUID userId,
            @RequestAttribute("organizationId") java.util.UUID orgId,
            @RequestAttribute(required = false) java.util.UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(dietPlanService.getUserDietPlans(userId, orgId, branchId)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DIET:DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteDietPlan(@PathVariable java.util.UUID id,
            @RequestAttribute("organizationId") java.util.UUID orgId,
            @RequestAttribute(required = false) java.util.UUID branchId) {
        dietPlanService.deleteDietPlan(id, orgId, branchId);
        return ResponseEntity.ok(ApiResponse.success(null, "Diet plan deleted successfully"));
    }
}
