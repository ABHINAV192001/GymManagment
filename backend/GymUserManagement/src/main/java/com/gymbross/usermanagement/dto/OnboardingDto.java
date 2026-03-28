package com.gymbross.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingDto {
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private String activityLevel;
    private String goal;
}
