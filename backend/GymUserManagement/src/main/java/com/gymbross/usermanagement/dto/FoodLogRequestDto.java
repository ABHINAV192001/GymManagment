package com.gymbross.usermanagement.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class FoodLogRequestDto {
    private Long foodId;
    private Long portionId;
    private Double quantity;
    private LocalDate date;
    private String mealType;
}
