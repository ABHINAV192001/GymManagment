package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.dto.FoodDto;
import com.gymbross.usermanagement.dto.FoodSearchRequestDto;
import com.gymbross.usermanagement.dto.FoodLogRequestDto;
import com.gymbross.usermanagement.service.FoodService;
import com.gymbross.usermanagement.service.FoodDataImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user/food")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;
    private final FoodDataImportService importService;

    @GetMapping("/low-calorie")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<FoodDto>>> getLowCalorieRecipes() {
        log.info("Fetching low-calorie recipes");
        return ResponseEntity.ok(ApiResponse.success(foodService.getLowCalorieRecipes()));
    }

    @GetMapping("/{id:[0-9-]+}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FoodDto>> getFoodDetails(@PathVariable Long id) {
        log.info("Fetching details for Food ID: {}", id);
        return ResponseEntity.ok(ApiResponse.success(foodService.getFoodDetails(id)));
    }

    @GetMapping("/list")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<FoodDto>>> getAllFoods(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(foodService.getAllFoods(page, size)));
    }

    @PostMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<FoodDto>>> searchFoods(@RequestBody FoodSearchRequestDto dto) {
        log.info("Searching foods for query: {}", dto.getQuery());
        if (dto.getQuery() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Query cannot be null", 400));
        }
        return ResponseEntity.ok(ApiResponse.success(foodService.searchFoods(dto.getQuery())));
    }

    @PostMapping("/log")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logFood(Principal principal, @RequestBody FoodLogRequestDto dto) {
        foodService.logFood(principal.getName(), dto);
        return ResponseEntity.ok(ApiResponse.success(null, "Food logged successfully"));
    }

    @GetMapping("/preference")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<FoodDto>>> getFoodsByPreference(@RequestParam String preference) {
        return ResponseEntity.ok(ApiResponse.success(foodService.getFoodsByPreference(preference)));
    }

    @PostMapping("/import")
    @PreAuthorize("hasAuthority('ORG_ADMIN')") // Admin only
    public ResponseEntity<ApiResponse<String>> importFoodData(@RequestParam String directoryPath) {
        try {
            importService.fullImport(directoryPath);
            return ResponseEntity.ok(ApiResponse.success("Import started successfully"));
        } catch (Exception e) {
            log.error("Import failed", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Import failed: " + e.getMessage(), 500));
        }
    }
}
