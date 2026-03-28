package com.gymbross.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDietPlanDto {
    private Long id;
    private String foodName;
    private String description;
    private String timingFood;
}
