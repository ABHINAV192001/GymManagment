package com.Gym.GymCommonServices.dto.fdc;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FoodNutrientDto {
    private NutrientDto nutrient;
    private Double amount;
    private Double min;
    private Double max;
    private Double median;
    private String derivedMethod;
}
