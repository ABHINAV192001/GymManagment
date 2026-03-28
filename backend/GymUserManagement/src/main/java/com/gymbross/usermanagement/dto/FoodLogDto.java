package com.gymbross.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodLogDto {
    private Long id;
    private String foodName;
    private double quantity;
    private String portionName; // e.g., "1 cup" or "100g"
    private double calories;
    private double protein;
    private double carbs;
    private double fat;
    private String mealType;
}
