package com.gymbross.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingDto {
    @NotNull(message = "Age is required")
    @Min(value = 10, message = "Age must be at least 10 years")
    @jakarta.validation.constraints.Max(value = 120, message = "Age cannot exceed 120 years")
    private Integer age;
    
    @NotBlank(message = "Gender is required")
    private String gender;
    
    @NotNull(message = "Height is required")
    @Min(value = 50, message = "Height must be at least 50 cm")
    @jakarta.validation.constraints.Max(value = 300, message = "Height cannot exceed 300 cm")
    private Double height;
    
    @NotNull(message = "Weight is required")
    @Min(value = 20, message = "Weight must be at least 20 kg")
    @jakarta.validation.constraints.Max(value = 500, message = "Weight cannot exceed 500 kg")
    private Double weight;
    
    @NotBlank(message = "Activity level is required")
    private String activityLevel;
    
    @NotBlank(message = "Fitness goal is required")
    private String goal;
}
