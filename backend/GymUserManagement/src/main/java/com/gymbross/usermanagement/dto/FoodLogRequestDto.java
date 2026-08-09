package com.gymbross.usermanagement.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class FoodLogRequestDto {
    @NotNull(message = "Food ID is required")
    private java.util.UUID foodId;

    private java.util.UUID portionId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be at least 0.01")
    @DecimalMax(value = "50.0", message = "Quantity cannot exceed 50 servings")
    private Double quantity;

    private LocalDate date;

    @NotBlank(message = "Meal type is required")
    private String mealType;
}
