package com.gymbross.usermanagement.repository;

import com.gymbross.usermanagement.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByCategory(String category);

    List<Recipe> findByCategoryContainingIgnoreCase(String category);

    List<Recipe> findByCaloriesLessThanEqualOrderByCaloriesAsc(Double maxCalories);

    List<Recipe> findByKetoFriendlyTrue();

    List<Recipe> findByVeganOptionsTrue();

    List<Recipe> findByGlutenFreeTrue();

    List<Recipe> findByLowCholesterolTrue();

    List<Recipe> findByHighCholesterolTrue();

    List<Recipe> findByHighSodiumTrue();

    List<Recipe> findByLowSodiumTrue();

    List<Recipe> findByHighFiberTrue();
}
