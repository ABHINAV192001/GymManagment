package com.gymbross.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyLogDto {
    private List<FoodLogDto> foodLogs;
    private List<WaterLogDto> waterLogs;
    private double totalWater; // In Liters
    private int totalCalories;
    private int totalCarbs;
    private int totalProtein;
    private int totalFat;
}
