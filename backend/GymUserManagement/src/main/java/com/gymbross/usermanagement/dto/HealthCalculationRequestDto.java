package com.gymbross.usermanagement.dto;

import lombok.Data;

@Data
public class HealthCalculationRequestDto {
    private Double weightKg;
    private Double heightCm;
    private Integer age;
    private String gender;
    private String activityLevel;
}
