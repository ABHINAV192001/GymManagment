package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.entity.Recipe;
import com.gymbross.usermanagement.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeRepository recipeRepository;

    @PreAuthorize("hasAuthority(\'DIET:VIEW\')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Recipe>>> getAllRecipes() {
        return ResponseEntity.ok(ApiResponse.success(recipeRepository.findAll()));
    }

    @PreAuthorize("hasAuthority(\'DIET:CREATE\')")
    @PostMapping
    public ResponseEntity<ApiResponse<Recipe>> createRecipe(@RequestBody Recipe recipe) {
        return ResponseEntity.ok(ApiResponse.success(recipeRepository.save(recipe), "Recipe created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DIET:VIEW')")
    public ResponseEntity<ApiResponse<Recipe>> getRecipeById(@PathVariable UUID id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found"));
        return ResponseEntity.ok(ApiResponse.success(recipe));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('DIET:EDIT')")
    public ResponseEntity<ApiResponse<Recipe>> updateRecipe(@PathVariable UUID id, @RequestBody Recipe details) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found"));

        recipe.setRecipeName(details.getRecipeName());
        recipe.setCategory(details.getCategory());
        recipe.setKeyIngredients(details.getKeyIngredients());
        recipe.setFoodAdded(details.getFoodAdded());
        recipe.setProtein(details.getProtein());
        recipe.setCarbohydrates(details.getCarbohydrates());
        recipe.setFiber(details.getFiber());
        recipe.setSugar(details.getSugar());
        recipe.setFat(details.getFat());
        recipe.setSaturatedFat(details.getSaturatedFat());
        recipe.setMonoUnsaturatedFat(details.getMonoUnsaturatedFat());
        recipe.setPolyUnsaturatedFat(details.getPolyUnsaturatedFat());
        recipe.setCalcium(details.getCalcium());
        recipe.setIron(details.getIron());
        recipe.setCholesterol(details.getCholesterol());
        recipe.setSodium(details.getSodium());
        recipe.setCookingTime(details.getCookingTime());
        recipe.setCalories(details.getCalories());
        recipe.setKetoFriendly(details.getKetoFriendly());
        recipe.setVeganOptions(details.getVeganOptions());
        recipe.setGlutenFree(details.getGlutenFree());
        recipe.setLowCholesterol(details.getLowCholesterol());
        recipe.setHighCholesterol(details.getHighCholesterol());
        recipe.setHighSodium(details.getHighSodium());
        recipe.setLowSodium(details.getLowSodium());
        recipe.setHighFiber(details.getHighFiber());

        return ResponseEntity.ok(ApiResponse.success(recipeRepository.save(recipe), "Recipe updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DIET:DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteRecipe(@PathVariable UUID id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Recipe not found"));
        recipeRepository.delete(recipe);
        return ResponseEntity.ok(ApiResponse.success(null, "Recipe deleted successfully"));
    }
}
