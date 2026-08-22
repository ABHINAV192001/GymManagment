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
    private java.util.UUID id;
    private java.util.UUID mondayWorkoutId;
    private java.util.UUID tuesdayWorkoutId;
    private java.util.UUID wednesdayWorkoutId;
    private java.util.UUID thursdayWorkoutId;
    private java.util.UUID fridayWorkoutId;
    private java.util.UUID saturdayWorkoutId;
    private java.util.UUID sundayWorkoutId;
}
