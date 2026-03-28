package com.gymbross.usermanagement.controller;

import com.gymbross.usermanagement.dto.FoodDto;
import com.gymbross.usermanagement.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/food")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;
    private final com.gymbross.usermanagement.service.FoodDataImportService importService;

    // Specific paths must come BEFORE path variables to avoid routing conflicts
    @GetMapping("/low-calorie")
    public ResponseEntity<java.util.List<FoodDto>> getLowCalorieRecipes() {
        System.out.println("FoodController: Fetching low-calorie recipes");
        try {
            java.util.List<FoodDto> recipes = foodService.getLowCalorieRecipes();
            System.out.println("FoodController: Successfully fetched " + recipes.size() + " low-calorie recipes");
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            System.err.println("FoodController: Error fetching low-calorie recipes");
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{id:[0-9-]+}")
    public ResponseEntity<FoodDto> getFoodDetails(@PathVariable Long id) {
        System.out.println("FoodController: Fetching details for Food ID: " + id);
        try {
            FoodDto dto = foodService.getFoodDetails(id);
            System.out.println("FoodController: Successfully fetched details for ID: " + id);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.err.println("FoodController: Error fetching details for ID: " + id);
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/list")
    public ResponseEntity<java.util.List<FoodDto>> getAllFoods(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(foodService.getAllFoods(page, size));
    }

    @PostMapping("/search")
    public ResponseEntity<java.util.List<FoodDto>> searchFoods(
            @RequestBody com.gymbross.usermanagement.dto.FoodSearchRequestDto dto) {
        System.out.println("FoodController: Received search request. DTO: " + dto);
        if (dto != null) {
            System.out.println("FoodController: Query string: '" + dto.getQuery() + "'");
        }
        if (dto == null || dto.getQuery() == null) {
            System.err.println("FoodController: Request body or query is null");
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(foodService.searchFoods(dto.getQuery()));
    }

    @PostMapping("/log")
    public ResponseEntity<Void> logFood(java.security.Principal principal,
            @RequestBody com.gymbross.usermanagement.dto.FoodLogRequestDto dto) {
        foodService.logFood(principal.getName(), dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/preference")
    public ResponseEntity<java.util.List<FoodDto>> getFoodsByPreference(@RequestParam String preference) {
        return ResponseEntity.ok(foodService.getFoodsByPreference(preference));
    }

    @PostMapping("/import")
    public ResponseEntity<String> importFoodData(@RequestParam String directoryPath) {
        try {
            importService.fullImport(directoryPath);
            return ResponseEntity.ok("Import started successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Import failed: " + e.getMessage());
        }
    }
}
