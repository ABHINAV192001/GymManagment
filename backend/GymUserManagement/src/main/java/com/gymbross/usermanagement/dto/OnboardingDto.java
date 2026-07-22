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
    @Min(value = 1, message = "Age must be positive")
    private Integer age;
    
    @NotBlank(message = "Gender is required")
    private String gender;
    
    @NotNull(message = "Height is required")
    @Min(value = 1, message = "Height must be positive")
    private Double height;
    
    @NotNull(message = "Weight is required")
    @Min(value = 1, message = "Weight must be positive")
    private Double weight;
    private String activityLevel;
    private String goal;
}
