package com.Gym.GymCommonServices.dto.fdc;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FoundationFoodDto {
    private Long fdcId;
    private String description;
    private String publicationDate;
    private FoodCategoryDto foodCategory;
    private List<FoodNutrientDto> foodNutrients;
    private List<FoodPortionDto> foodPortions;
    private String ndbNumber;
}
