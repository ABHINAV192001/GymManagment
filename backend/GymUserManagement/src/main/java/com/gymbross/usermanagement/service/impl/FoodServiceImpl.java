package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.Food;
import com.gymbross.usermanagement.dto.FoodDto;
import com.gymbross.usermanagement.repository.FoodRepository;
import com.gymbross.usermanagement.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
        private final com.gymbross.usermanagement.repository.FoodLogRepository foodLogRepository;
        private final com.gymbross.usermanagement.repository.RecipeRepository recipeRepository;

        @Override
        @Transactional(readOnly = true)
        public Page<FoodDto> searchFoods(String query, int page, int size) {
                Pageable pageable = PageRequest.of(Math.max(0, page), size <= 0 ? 20 : size);
                Page<Food> foodPage = foodRepository.findByFoodNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(query, query, pageable);
                return foodPage.map(this::mapToSummaryDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<FoodDto> getAllFoods(int page, int size) {
                Pageable pageable = PageRequest.of(Math.max(0, page), size <= 0 ? 20 : size);
                return foodRepository.findAll(pageable).map(this::mapToSummaryDto);
        }

        @Override
        @Transactional(readOnly = true)
        public FoodDto getFoodDetails(java.util.UUID id) {
                java.util.Optional<Food> foodOpt = foodRepository.findById(id);
                if (foodOpt.isPresent()) {
                    return mapToFullDto(foodOpt.get());
                }
                
                com.gymbross.usermanagement.entity.Recipe recipe = recipeRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Food or Recipe not found"));
                return mapRecipeToSummaryDto(recipe);
        }

        private FoodDto mapToSummaryDto(Food food) {
                boolean isRecipe = Boolean.TRUE.equals(food.getIsRecipe());

                List<String> flags = new ArrayList<>();
                if (Boolean.TRUE.equals(food.getMagnesiumRich()) || (food.getMagnesium() != null && food.getMagnesium() >= 25)) {
                        flags.add("MAGNESIUM_RICH");
                }
                if (food.getProtein() != null && food.getProtein() >= 12) {
                        flags.add("HIGH_PROTEIN");
                }
                if (food.getCalories() != null && food.getCalories() <= 100) {
                        flags.add("LOW_CALORIE");
                }
                if (food.getCalories() != null && food.getCalories() >= 300) {
                        flags.add("HIGH_CALORIE");
                }
                if (isRecipe) {
                        flags.add("FAT_LOSS");
                }

                return FoodDto.builder()
                                .id(food.getId())
                                .description(food.getFoodName())
                                .foodCategory(food.getCategory())
                                .calories(food.getCalories())
                                .protein(food.getProtein())
                                .carbohydrates(food.getCarbohydrates())
                                .fat(food.getFat())
                                .fiber(food.getFiber())
                                .magnesium(food.getMagnesium())
                                .calcium(food.getCalcium())
                                .iron(food.getIron())
                                .potassium(food.getPotassium())
                                .sodium(food.getSodium())
                                .vitaminC(food.getVitaminC())
                                .vitaminD(food.getVitaminD())
                                .cookingTime(food.getCookingTime() != null ? food.getCookingTime() : (isRecipe ? 15 : null))
                                .isRecipe(isRecipe)
                                .dietaryFlags(flags)
                                .build();
        }

        private FoodDto mapToFullDto(Food food) {
                List<String> ingredientsList = null;
                if (food.getRecipeIngredients() != null && !food.getRecipeIngredients().trim().isEmpty()) {
                        ingredientsList = java.util.Arrays.stream(food.getRecipeIngredients().split("\n"))
                                        .map(String::trim)
                                        .filter(s -> !s.isEmpty())
                                        .collect(Collectors.toList());
                }

                List<String> instructionsList = null;
                if (food.getRecipeInstructions() != null && !food.getRecipeInstructions().trim().isEmpty()) {
                        instructionsList = java.util.Arrays.stream(food.getRecipeInstructions().split("\n"))
                                        .map(String::trim)
                                        .filter(s -> !s.isEmpty())
                                        .collect(Collectors.toList());
                }

                boolean isRecipe = Boolean.TRUE.equals(food.getIsRecipe());

                // Fallback for recipes without explicit ingredients/instructions in DB
                if (isRecipe) {
                        if (ingredientsList == null || ingredientsList.isEmpty()) {
                                String name = food.getFoodName() != null ? food.getFoodName() : "Recipe";
                                ingredientsList = java.util.Arrays.asList(
                                                "150g " + name,
                                                "200ml Water or Milk (for boiling/mixing)",
                                                "1/2 tsp Sea Salt & Cracked Black Pepper",
                                                "1 tbsp Extra Virgin Olive Oil",
                                                "1 tsp Mixed Herbs or Minced Garlic"
                                );
                        }
                        if (instructionsList == null || instructionsList.isEmpty()) {
                                String name = food.getFoodName() != null ? food.getFoodName() : "Recipe";
                                instructionsList = java.util.Arrays.asList(
                                                "Measure out 150g of " + name + " and prepare all cooking utensils.",
                                                "Boil 300ml of water or heat 1 tbsp olive oil in a skillet over medium heat for 3 minutes.",
                                                "Add ingredients to the pan/pot and cook for 8 to 12 minutes, stirring evenly.",
                                                "Season with 1/2 tsp salt, pepper, and herbs to taste.",
                                                "Plate and serve warm immediately."
                                );
                        }
                }

                List<String> flags = new ArrayList<>();
                if (Boolean.TRUE.equals(food.getMagnesiumRich()) || (food.getMagnesium() != null && food.getMagnesium() >= 25)) {
                        flags.add("MAGNESIUM_RICH");
                }
                if (food.getProtein() != null && food.getProtein() >= 12) {
                        flags.add("HIGH_PROTEIN");
                }
                if (food.getCalories() != null && food.getCalories() <= 100) {
                        flags.add("LOW_CALORIE");
                }
                if (food.getCalories() != null && food.getCalories() >= 300) {
                        flags.add("HIGH_CALORIE");
                }
                if (isRecipe) {
                        flags.add("FAT_LOSS");
                }

                List<FoodDto.FoodNutrientDto> nutrients = new ArrayList<>();
                addNutrient(nutrients, "Protein", "g", food.getProtein());
                addNutrient(nutrients, "Carbohydrates", "g", food.getCarbohydrates());
                addNutrient(nutrients, "Fiber", "g", food.getFiber());
                addNutrient(nutrients, "Fat", "g", food.getFat());
                addNutrient(nutrients, "Magnesium", "mg", food.getMagnesium());
                addNutrient(nutrients, "Calcium", "mg", food.getCalcium());
                addNutrient(nutrients, "Iron", "mg", food.getIron());
                addNutrient(nutrients, "Potassium", "mg", food.getPotassium());
                addNutrient(nutrients, "Sodium", "mg", food.getSodium());
                addNutrient(nutrients, "Vitamin C", "mg", food.getVitaminC());
                addNutrient(nutrients, "Vitamin D", "IU", food.getVitaminD());

                return FoodDto.builder()
                                .id(food.getId())
                                .description(food.getFoodName())
                                .foodCategory(food.getCategory())
                                .calories(food.getCalories())
                                .protein(food.getProtein())
                                .carbohydrates(food.getCarbohydrates())
                                .fat(food.getFat())
                                .fiber(food.getFiber())
                                .magnesium(food.getMagnesium())
                                .calcium(food.getCalcium())
                                .iron(food.getIron())
                                .potassium(food.getPotassium())
                                .sodium(food.getSodium())
                                .vitaminC(food.getVitaminC())
                                .vitaminD(food.getVitaminD())
                                .nutrients(nutrients)
                                .cookingTime(food.getCookingTime() != null ? food.getCookingTime() : 15)
                                .isRecipe(isRecipe)
                                .recipeIngredients(ingredientsList)
                                .recipeInstructions(instructionsList)
                                .dietaryFlags(flags)
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
        @Transactional(readOnly = true)
        public Page<FoodDto> filterFoods(String query, String category, String preset, Boolean isRecipe, int page, int size) {
                Pageable pageable = PageRequest.of(Math.max(0, page), size <= 0 ? 20 : size);

                // Derive isRecipe from preset if not explicitly passed
                Boolean effectiveIsRecipe = isRecipe;
                if (effectiveIsRecipe == null && preset != null) {
                        if ("FOOD_RAW".equalsIgnoreCase(preset) || "RAW_FOOD".equalsIgnoreCase(preset)) {
                                effectiveIsRecipe = false;
                        } else if (preset.startsWith("RECIPE_") || "RECIPES".equalsIgnoreCase(preset)) {
                                effectiveIsRecipe = true;
                        }
                }

                // 1. If query is provided (e.g. "banana", "apple", "chicken", "paneer", "dal"), search across foods
                if (query != null && !query.trim().isEmpty()) {
                        String cleanQuery = query.trim();
                        Page<Food> foodPage = foodRepository.searchByFilter(
                                cleanQuery,
                                (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) ? category.trim() : null,
                                effectiveIsRecipe,
                                pageable
                        );
                        return foodPage.map(this::mapToSummaryDto);
                }

                // 2. If preset is provided and not "ALL", delegate to preset filter logic
                if (preset != null && !preset.trim().isEmpty() && !"ALL".equalsIgnoreCase(preset)) {
                        return getFoodsByFilter(preset, page, size);
                }

                // 3. If only category is provided
                if (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) {
                        return foodRepository.findByCategoryContainingIgnoreCase(category.trim(), pageable).map(this::mapToSummaryDto);
                }

                // 4. If isRecipe flag is specified
                if (isRecipe != null) {
                        if (isRecipe) {
                                return foodRepository.findByIsRecipeTrue(pageable).map(this::mapToSummaryDto);
                        } else {
                                return foodRepository.findByIsRecipeFalse(pageable).map(this::mapToSummaryDto);
                        }
                }

                // 5. Default return all foods
                return foodRepository.findAll(pageable).map(this::mapToSummaryDto);
        }

        @Override
        @Transactional
        public void logFood(String username, com.gymbross.usermanagement.dto.FoodLogRequestDto dto) {
                com.Gym.GymCommonServices.entity.User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found: " + username));

                Food food = null;
                // 1. Try finding by UUID
                if (dto.getFoodId() != null && !dto.getFoodId().trim().isEmpty()) {
                        try {
                                java.util.UUID foodUuid = java.util.UUID.fromString(dto.getFoodId().trim());
                                food = foodRepository.findById(foodUuid).orElse(null);
                        } catch (Exception ignored) {
                                // Not a standard UUID format
                        }
                }

                // 2. Try finding by Food Name or Description
                String queryName = (dto.getFoodName() != null && !dto.getFoodName().trim().isEmpty())
                                ? dto.getFoodName().trim()
                                : (dto.getFoodId() != null ? dto.getFoodId().trim() : "");

                if (food == null && !queryName.isEmpty()) {
                        final String lowerQuery = queryName.toLowerCase();
                        food = foodRepository.findAll().stream()
                                        .filter(f -> f.getFoodName() != null && f.getFoodName().toLowerCase().contains(lowerQuery))
                                        .findFirst()
                                        .orElse(null);
                }

                // 3. If food is not found in database, dynamically persist it with provided macros so calculations are exact
                if (food == null) {
                        String name = !queryName.isEmpty() ? queryName : "Logged Food Item";
                        double qty = dto.getQuantity() != null && dto.getQuantity() > 0 ? dto.getQuantity() : 1.0;
                        double cal = dto.getCalories() != null ? dto.getCalories() / qty : 52.0;
                        double prot = dto.getProtein() != null ? dto.getProtein() / qty : 0.3;
                        double carb = dto.getCarbohydrates() != null ? dto.getCarbohydrates() / qty : 13.8;
                        double fat = dto.getFat() != null ? dto.getFat() / qty : 0.2;

                        food = Food.builder()
                                        .foodName(name)
                                        .category("General")
                                        .calories(cal)
                                        .protein(prot)
                                        .carbohydrates(carb)
                                        .fat(fat)
                                        .build();
                        food = foodRepository.save(food);
                }

                com.gymbross.usermanagement.entity.FoodLog log = com.gymbross.usermanagement.entity.FoodLog.builder()
                                .user(user)
                                .food(food)
                                .quantity(dto.getQuantity())
                                .servingUnit(dto.getServingUnit() != null ? dto.getServingUnit() : "portion")
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
                                recipes = recipeRepository.findByCategoryContainingIgnoreCase(preference);
                }

                return recipes.stream()
                                .map(this::mapRecipeToSummaryDto)
                                .collect(Collectors.toList());
        }

        private FoodDto mapRecipeToSummaryDto(com.gymbross.usermanagement.entity.Recipe recipe) {
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
                                .id(recipe.getId())
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
                List<Food> foods = foodRepository.findByCaloriesLessThanEqual(250.0);
                if (foods != null && !foods.isEmpty()) {
                        return foods.stream().map(this::mapToSummaryDto).collect(Collectors.toList());
                }

                List<com.gymbross.usermanagement.entity.Recipe> recipes = recipeRepository
                                .findByCaloriesLessThanEqualOrderByCaloriesAsc(250.0);

                return recipes.stream()
                                .map(this::mapRecipeToSummaryDto)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public Page<FoodDto> getFoodsByFilter(String preset, int page, int size) {
                Pageable pageable = PageRequest.of(Math.max(0, page), size <= 0 ? 20 : size);
                if (preset == null || preset.trim().isEmpty() || "ALL".equalsIgnoreCase(preset)) {
                        return foodRepository.findAll(pageable).map(this::mapToSummaryDto);
                }

                Page<Food> foodPage;
                switch (preset.toUpperCase()) {
                        // All Database Foods & Indian Food
                        case "FOOD_ALL":
                        case "FOODS":
                        case "ALL_FOODS":
                                foodPage = foodRepository.findAll(pageable);
                                break;
                        case "INDIAN_FOOD":
                        case "FOOD_INDIAN":
                        case "RECIPE_INDIAN":
                        case "INDIAN":
                                foodPage = foodRepository.findByCategoryContainingIgnoreCase("INDIAN_FOOD", pageable);
                                break;
                        case "FOOD_RAW":
                        case "RAW_FOOD":
                                foodPage = foodRepository.findByIsRecipeFalse(pageable);
                                break;
                        case "FOOD_MAGNESIUM":
                                foodPage = foodRepository.findByMagnesiumRichTrueOrMagnesiumGreaterThanEqual(25.0, pageable);
                                break;
                        case "FOOD_HIGH_PROTEIN":
                                foodPage = foodRepository.findByProteinGreaterThanEqual(12.0, pageable);
                                break;
                        case "FOOD_LOW_CALORIE":
                                foodPage = foodRepository.findByCaloriesLessThanEqual(100.0, pageable);
                                break;
                        case "FOOD_HIGH_CALORIE":
                                foodPage = foodRepository.findByCaloriesGreaterThanEqual(300.0, pageable);
                                break;

                        // Recipes Tree Options
                        case "RECIPE_ALL":
                        case "RECIPES":
                        case "FAT_LOSS_RECIPES":
                        case "RECIPE_FAT_LOSS":
                                foodPage = foodRepository.findByIsRecipeTrue(pageable);
                                break;
                        case "RECIPE_MAGNESIUM":
                                foodPage = foodRepository.findByIsRecipeTrueAndMagnesiumGreaterThanEqual(25.0, pageable);
                                break;
                        case "RECIPE_HIGH_PROTEIN":
                                foodPage = foodRepository.findByIsRecipeTrueAndProteinGreaterThanEqual(12.0, pageable);
                                break;
                        case "RECIPE_LOW_CALORIE":
                                foodPage = foodRepository.findByIsRecipeTrueAndCaloriesLessThanEqual(100.0, pageable);
                                break;
                        case "RECIPE_HIGH_CALORIE":
                                foodPage = foodRepository.findByIsRecipeTrueAndCaloriesGreaterThanEqual(300.0, pageable);
                                break;

                        // Legacy / Fallbacks
                        case "MAGNESIUM":
                                foodPage = foodRepository.findByMagnesiumRichTrueOrMagnesiumGreaterThanEqual(25.0, pageable);
                                break;
                        case "HIGH_PROTEIN":
                                foodPage = foodRepository.findByProteinGreaterThanEqual(12.0, pageable);
                                break;
                        case "LOW_CALORIE":
                                foodPage = foodRepository.findByCaloriesLessThanEqual(100.0, pageable);
                                break;
                        case "HIGH_CALORIE":
                                foodPage = foodRepository.findByCaloriesGreaterThanEqual(300.0, pageable);
                                break;

                        default:
                                foodPage = foodRepository.findByCategoryContainingIgnoreCase(preset, pageable);
                                if (foodPage.isEmpty()) {
                                        foodPage = foodRepository.findByFoodNameContainingIgnoreCase(preset, pageable);
                                }
                }

                return foodPage.map(this::mapToSummaryDto);
        }
}
