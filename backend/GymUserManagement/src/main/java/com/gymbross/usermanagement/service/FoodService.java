package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.dto.FoodDto;
import com.gymbross.usermanagement.dto.FoodLogRequestDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface FoodService {
    Page<FoodDto> searchFoods(String query, int page, int size);

    Page<FoodDto> getAllFoods(int page, int size);

    FoodDto getFoodDetails(java.util.UUID id);

    void logFood(String username, FoodLogRequestDto dto);

    List<FoodDto> getFoodsByPreference(String preference);

    List<FoodDto> getLowCalorieRecipes();

    Page<FoodDto> getFoodsByFilter(String preset, int page, int size);

    Page<FoodDto> filterFoods(String query, String category, String preset, Boolean isRecipe, int page, int size);
}
