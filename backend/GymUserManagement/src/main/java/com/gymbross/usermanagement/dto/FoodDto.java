package com.gymbross.usermanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FoodDto {
    private Long id;
    private Long fdcId;
    private String description;
    private String foodCategory;
    private Double calories;
    private List<FoodNutrientDto> nutrients;
    private List<FoodPortionDto> portions;
    private String keyIngredients;
    private String foodAdded;
    private Integer cookingTime;
    private boolean isRecipe;
    private List<String> dietaryFlags;

    @Data
    @Builder
    public static class FoodNutrientDto {
        private String name;
        private String unitName;
        private Double amount;
    }

    @Data
    @Builder
    public static class FoodPortionDto {
        private Long id;
        private Double amount;
        private String measureUnit;
        private String modifier;
        private Double gramWeight;
        private Integer sequenceNumber;
    }
}
