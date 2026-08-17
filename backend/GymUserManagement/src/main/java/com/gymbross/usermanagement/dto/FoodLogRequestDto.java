package com.gymbross.usermanagement.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class FoodLogRequestDto {
    private String foodId;

    private String foodName;

    private String portionId;

    private String servingUnit;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.001", message = "Quantity must be at least 0.001")
    @DecimalMax(value = "100.0", message = "Quantity cannot exceed 100 servings")
    private Double quantity;

    private Double calories;

    private Double protein;

    private Double carbohydrates;

    private Double fat;

    private LocalDate date;

    @NotBlank(message = "Meal type is required")
    private String mealType;
}
