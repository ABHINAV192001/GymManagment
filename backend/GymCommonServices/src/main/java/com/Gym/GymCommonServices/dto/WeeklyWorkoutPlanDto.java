package com.Gym.GymCommonServices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyWorkoutPlanDto {
    private Long id;
    private Long mondayWorkoutId;
    private Long tuesdayWorkoutId;
    private Long wednesdayWorkoutId;
    private Long thursdayWorkoutId;
    private Long fridayWorkoutId;
    private Long saturdayWorkoutId;
    private Long sundayWorkoutId;
}
