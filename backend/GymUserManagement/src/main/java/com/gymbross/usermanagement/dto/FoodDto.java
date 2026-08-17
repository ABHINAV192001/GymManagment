package com.gymbross.usermanagement.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FoodDto {
    private java.util.UUID id;
    private Long fdcId;
    private String description;
    private String foodCategory;
    private Double calories;
    private Double protein;

    private Double carbohydrates;
    private Double fat;
    private Double fiber;
    private Double magnesium;
    private Double calcium;
    private Double iron;
    private Double potassium;
    private Double sodium;
    private Double vitaminC;
    private Double vitaminD;
    private List<FoodNutrientDto> nutrients;
    private List<FoodPortionDto> portions;
    private String keyIngredients;
    private String foodAdded;
    private Integer cookingTime;
    @com.fasterxml.jackson.annotation.JsonProperty("isRecipe")
    private boolean isRecipe;
    private List<String> recipeIngredients;
    private List<String> recipeInstructions;
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
        private java.util.UUID id;
        private Double amount;
        private String measureUnit;
        private String modifier;
        private Double gramWeight;
        private Integer sequenceNumber;
    }
}
