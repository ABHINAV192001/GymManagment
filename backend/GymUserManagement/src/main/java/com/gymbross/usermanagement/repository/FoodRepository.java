package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.Food;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Food, java.util.UUID> {

        List<Food> findByCaloriesLessThanEqual(Double maxCalories);

        Page<Food> findByFoodNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(String foodName, String category, Pageable pageable);

        Page<Food> findByFoodNameContainingIgnoreCase(String foodName, Pageable pageable);

        Page<Food> findByMagnesiumRichTrueOrMagnesiumGreaterThanEqual(Double minMg, Pageable pageable);

        Page<Food> findByProteinGreaterThanEqual(Double minProtein, Pageable pageable);

        Page<Food> findByCaloriesLessThanEqual(Double maxCalories, Pageable pageable);

        Page<Food> findByCaloriesGreaterThanEqual(Double minCalories, Pageable pageable);

        Page<Food> findByIsRecipeTrue(Pageable pageable);

        Page<Food> findByIsRecipeFalse(Pageable pageable);

        Page<Food> findByCategoryContainingIgnoreCase(String category, Pageable pageable);

        // Raw Foods Specific
        Page<Food> findByIsRecipeFalseAndMagnesiumGreaterThanEqual(Double minMg, Pageable pageable);
        Page<Food> findByIsRecipeFalseAndProteinGreaterThanEqual(Double minProtein, Pageable pageable);
        Page<Food> findByIsRecipeFalseAndCaloriesLessThanEqual(Double maxCals, Pageable pageable);
        Page<Food> findByIsRecipeFalseAndCaloriesGreaterThanEqual(Double minCals, Pageable pageable);

        // Recipes Specific
        Page<Food> findByIsRecipeTrueAndMagnesiumGreaterThanEqual(Double minMg, Pageable pageable);
        Page<Food> findByIsRecipeTrueAndProteinGreaterThanEqual(Double minProtein, Pageable pageable);
        Page<Food> findByIsRecipeTrueAndCaloriesLessThanEqual(Double maxCals, Pageable pageable);
        Page<Food> findByIsRecipeTrueAndCaloriesGreaterThanEqual(Double minCals, Pageable pageable);

        @Query("SELECT f FROM Food f WHERE " +
               "(:query IS NULL OR :query = '' OR " +
               "LOWER(f.foodName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
               "LOWER(f.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
               "(f.keyIngredients IS NOT NULL AND LOWER(f.keyIngredients) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
               "(f.recipeIngredients IS NOT NULL AND LOWER(f.recipeIngredients) LIKE LOWER(CONCAT('%', :query, '%')))) AND " +
               "(:category IS NULL OR :category = '' OR :category = 'ALL' OR LOWER(f.category) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
               "(:isRecipe IS NULL OR f.isRecipe = :isRecipe)")
        Page<Food> searchByFilter(
            @Param("query") String query,
            @Param("category") String category,
            @Param("isRecipe") Boolean isRecipe,
            Pageable pageable
        );
}
