package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.dto.FoodDto;
import com.gymbross.usermanagement.dto.FoodLogRequestDto;

import java.util.List;

public interface FoodService {
    List<FoodDto> searchFoods(String query);

    List<FoodDto> getAllFoods(int page, int size);

    FoodDto getFoodDetails(Long id);

    void logFood(String username, com.gymbross.usermanagement.dto.FoodLogRequestDto dto);

    List<FoodDto> getFoodsByPreference(String preference);

    List<FoodDto> getLowCalorieRecipes();
}
