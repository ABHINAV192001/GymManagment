package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.entity.UserDietPlan;
import com.gymbross.usermanagement.service.DietPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diet")
@RequiredArgsConstructor
public class DietPlanController {

    private final DietPlanService dietPlanService;

    @PostMapping(value = "/assign", consumes = { "multipart/form-data" })
    public ResponseEntity<UserDietPlan> assignDietPlan(
            @RequestParam Long userId,
            @RequestPart("dietPlan") UserDietPlan dietPlan,
            @RequestPart(value = "file", required = false) org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(dietPlanService.assignDietPlan(userId, dietPlan, file));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserDietPlan>> getUserDietPlans(@PathVariable Long userId) {
        return ResponseEntity.ok(dietPlanService.getUserDietPlans(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDietPlan(@PathVariable Long id) {
        dietPlanService.deleteDietPlan(id);
        return ResponseEntity.ok().build();
    }
}
