package com.gymbross.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthCalculationResponseDto {
    private Double bmi;
    private String bmiStatus;
    private String bmiColor;
    private Integer bmr;
    private Integer tdee;
    private Integer bulkCals;
    private Integer cutCals;
    private Integer fiberGrams;
    private String waterLiters;
    private Integer normalizedHeightCm;
    private String normalizedHeightM;
    private String heightFtInDisplay;
    private Integer normalizedWeightKg;
    private Integer normalizedWeightLbs;
}
