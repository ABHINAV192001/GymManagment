package com.gymbross.usermanagement.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class FoodLogRequestDto {
    private java.util.UUID foodId;
    private java.util.UUID portionId;
    private Double quantity;
    private LocalDate date;
    private String mealType;
}
