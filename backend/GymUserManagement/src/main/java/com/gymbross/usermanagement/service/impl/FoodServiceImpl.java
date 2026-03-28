package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.Food;
import com.gymbross.usermanagement.dto.FoodDto;
import com.gymbross.usermanagement.repository.FoodRepository;
import com.gymbross.usermanagement.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodServiceImpl implements FoodService {

        private final FoodRepository foodRepository;
        private final com.gymbross.usermanagement.repository.UserRepository userRepository;
        // private final com.gymbross.usermanagement.repository.FoodPortionRepository
        // foodPortionRepository; // Removed
        private final com.gymbross.usermanagement.repository.FoodLogRepository foodLogRepository;
        private final com.gymbross.usermanagement.repository.RecipeRepository recipeRepository;
        private final jakarta.persistence.EntityManager entityManager;

        @Override
        @Transactional(readOnly = true)
        public List<FoodDto> searchFoods(String query) {
                // Modified to search by foodName instead of description if description is gone,
                // but assuming description field still maps to new description or using
                // foodName
                // Food entity has 'foodName' and 'keyIngredients' now.
                // Assuming repository allows searching by foodName or we need to update it.
                // Let's assume finding by FoodName for now or just generic search.
                // Ideally findByFoodNameContainingIgnoreCase or
                // findByKeyIngredientsContainingIgnoreCase
                // But since the Repo is likely generic or needs update, I'll use what matches
                // the entity.
                // The old code used 'description'. The new entity has 'foodName'.

                System.out.println("FoodServiceImpl: Searching for food with query: '" + query + "'");
                List<Food> foods = foodRepository.findByFoodNameContainingIgnoreCase(query);
                System.out.println("FoodServiceImpl: Found " + foods.size() + " matches.");
                // If this method doesn't exist in repo, verify repo later.

                return foods.stream().limit(20).map(this::mapToSummaryDto).collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public List<FoodDto> getAllFoods(int page, int size) {
                org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page,
                                size);
                return foodRepository.findAll(pageable).stream()
                                .map(this::mapToSummaryDto)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public FoodDto getFoodDetails(Long id) {
                if (id < 0) {
                        // It's a recipe
                        Long recipeId = Math.abs(id);
                        com.gymbross.usermanagement.entity.Recipe recipe = recipeRepository.findById(recipeId)
                                        .orElseThrow(() -> new RuntimeException("Recipe not found"));
                        return mapRecipeToSummaryDto(recipe);
                }
                Food food = foodRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Food not found"));

                return mapToFullDto(food);
        }

        private FoodDto mapToSummaryDto(Food food) {
                return FoodDto.builder()
                                .id(food.getId())
                                .description(food.getFoodName()) // Mapping foodName to DTO description for consistency
                                .foodCategory(food.getCategory())
                                .calories(food.getCalories())
                                .isRecipe(false)
                                .build();
        }

        private FoodDto mapToFullDto(Food food) {
                List<FoodDto.FoodNutrientDto> nutrients = new ArrayList<>();
                addNutrient(nutrients, "Protein", "g", food.getProtein());
                addNutrient(nutrients, "Carbohydrates", "g", food.getCarbohydrates());
                addNutrient(nutrients, "Fiber", "g", food.getFiber());
                addNutrient(nutrients, "Sugar", "g", food.getSugar());
                addNutrient(nutrients, "Fat", "g", food.getFat());
                addNutrient(nutrients, "Saturated Fat", "g", food.getSaturatedFat());
                addNutrient(nutrients, "Mono Unsaturated Fat", "g", food.getMonoUnsaturatedFat());
                addNutrient(nutrients, "Poly Unsaturated Fat", "g", food.getPolyUnsaturatedFat());

                addNutrient(nutrients, "Calcium", "mg", food.getCalcium());
                addNutrient(nutrients, "Iron", "mg", food.getIron());
                addNutrient(nutrients, "Cholesterol", "mg", food.getCholesterol());
                addNutrient(nutrients, "Sodium", "mg", food.getSodium());

                return FoodDto.builder()
                                .id(food.getId())
                                .description(food.getFoodName())
                                .foodCategory(food.getCategory())
                                .calories(food.getCalories())
                                .nutrients(nutrients)
                                .keyIngredients(food.getKeyIngredients())
                                .foodAdded(null) // Food entity doesn't have this
                                .cookingTime(food.getCookingTime()) // DTO needs this field if not present
                                .isRecipe(false)
                                .build();
        }

        private void addNutrient(List<FoodDto.FoodNutrientDto> list, String name, String unit, Double amount) {
                if (amount != null) {
                        list.add(FoodDto.FoodNutrientDto.builder()
                                        .name(name)
                                        .unitName(unit)
                                        .amount(amount)
                                        .build());
                }
        }

        @Override
        @Transactional
        public void logFood(String username, com.gymbross.usermanagement.dto.FoodLogRequestDto dto) {
                com.Gym.GymCommonServices.entity.User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found: " + username));

                Food food = foodRepository.findById(dto.getFoodId())
                                .orElseThrow(() -> new RuntimeException("Food not found"));

                // Logic for portion calculation removed as entity is deleted.
                // Assuming Quantity is simple multiplier.

                com.gymbross.usermanagement.entity.FoodLog log = com.gymbross.usermanagement.entity.FoodLog.builder()
                                .user(user)
                                .food(food)
                                // .portion(portion) // Removed
                                .quantity(dto.getQuantity())
                                .date(dto.getDate() != null ? dto.getDate() : java.time.LocalDate.now())
                                .mealType(dto.getMealType())
                                .build();

                foodLogRepository.save(log);
        }

        @Override
        @Transactional(readOnly = true)
        public List<FoodDto> getFoodsByPreference(String preference) {
                List<com.gymbross.usermanagement.entity.Recipe> recipes = new ArrayList<>();

                if (preference == null)
                        return new ArrayList<>();

                switch (preference) {
                        case "Low Cholesterol":
                                recipes = recipeRepository.findByLowCholesterolTrue();
                                break;
                        case "High Cholesterol":
                                recipes = recipeRepository.findByHighCholesterolTrue();
                                break;
                        case "High Sodium":
                                recipes = recipeRepository.findByHighSodiumTrue();
                                break;
                        case "Low Sodium":
                                recipes = recipeRepository.findByLowSodiumTrue();
                                break;
                        case "High Fiber":
                                recipes = recipeRepository.findByHighFiberTrue();
                                break;
                        case "Gluten Free":
                                recipes = recipeRepository.findByGlutenFreeTrue();
                                break;
                        case "Keto Friendly":
                                recipes = recipeRepository.findByKetoFriendlyTrue();
                                break;
                        case "Vegan Options":
                                recipes = recipeRepository.findByVeganOptionsTrue();
                                break;
                        default:
                                // Fallback to searching category name if no exact match found
                                recipes = recipeRepository.findByCategoryContainingIgnoreCase(preference);
                }

                return recipes.stream()
                                .map(this::mapRecipeToSummaryDto)
                                .collect(Collectors.toList());
        }

        private FoodDto mapRecipeToSummaryDto(com.gymbross.usermanagement.entity.Recipe recipe) {
                Long summaryId = -1 * recipe.getId();
                // System.out.println("Mapping Recipe: " + recipe.getRecipeName() + " |
                // Calories: " + recipe.getCalories());
                System.out.println("Mapping Recipe ID: " + recipe.getId() + " - Name: " + recipe.getRecipeName()
                                + " - Calories: " + recipe.getCalories());

                List<FoodDto.FoodNutrientDto> nutrients = new ArrayList<>();
                addNutrient(nutrients, "Protein", "g", recipe.getProtein());
                addNutrient(nutrients, "Carbohydrates", "g", recipe.getCarbohydrates());
                addNutrient(nutrients, "Fiber", "g", recipe.getFiber());
                addNutrient(nutrients, "Sugar", "g", recipe.getSugar());
                addNutrient(nutrients, "Fat", "g", recipe.getFat());
                addNutrient(nutrients, "Saturated Fat", "g", recipe.getSaturatedFat());
                addNutrient(nutrients, "Mono Unsaturated Fat", "g", recipe.getMonoUnsaturatedFat());
                addNutrient(nutrients, "Poly Unsaturated Fat", "g", recipe.getPolyUnsaturatedFat());

                addNutrient(nutrients, "Calcium", "mg", recipe.getCalcium());
                addNutrient(nutrients, "Iron", "mg", recipe.getIron());
                addNutrient(nutrients, "Cholesterol", "mg", recipe.getCholesterol());
                addNutrient(nutrients, "Sodium", "mg", recipe.getSodium());

                List<String> flags = new ArrayList<>();
                if (Boolean.TRUE.equals(recipe.getKetoFriendly()))
                        flags.add("Keto");
                if (Boolean.TRUE.equals(recipe.getVeganOptions()))
                        flags.add("Vegan");
                if (Boolean.TRUE.equals(recipe.getGlutenFree()))
                        flags.add("Gluten Free");
                if (Boolean.TRUE.equals(recipe.getLowCholesterol()))
                        flags.add("Low Cholesterol");
                if (Boolean.TRUE.equals(recipe.getHighCholesterol()))
                        flags.add("High Cholesterol");
                if (Boolean.TRUE.equals(recipe.getHighSodium()))
                        flags.add("High Sodium");
                if (Boolean.TRUE.equals(recipe.getLowSodium()))
                        flags.add("Low Sodium");
                if (Boolean.TRUE.equals(recipe.getHighFiber()))
                        flags.add("High Fiber");

                return FoodDto.builder()
                                .id(summaryId)
                                .description(recipe.getRecipeName())
                                .foodCategory(recipe.getCategory())
                                .calories(recipe.getCalories())
                                .nutrients(nutrients)
                                .keyIngredients(recipe.getKeyIngredients())
                                .foodAdded(recipe.getFoodAdded())
                                .cookingTime(recipe.getCookingTime())
                                .isRecipe(true)
                                .dietaryFlags(flags)
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public List<FoodDto> getLowCalorieRecipes() {
                System.out.println("FoodServiceImpl: Fetching low-calorie recipes from DB");
                // Fetch recipes with calories <= 250, ordered by calories ascending
                List<com.gymbross.usermanagement.entity.Recipe> recipes = recipeRepository
                                .findByCaloriesLessThanEqualOrderByCaloriesAsc(250.0);

                System.out.println("FoodServiceImpl: Found " + recipes.size() + " recipes below 250kcal");

                return recipes.stream()
                                .map(this::mapRecipeToSummaryDto)
                                .collect(Collectors.toList());
        }
}
