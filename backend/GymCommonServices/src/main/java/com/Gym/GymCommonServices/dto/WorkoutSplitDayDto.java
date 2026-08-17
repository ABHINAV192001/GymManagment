package com.Gym.GymCommonServices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutSplitDayDto {
    private String day;         // e.g., "Day 1", "Workout A"
    private String name;        // e.g., "Latin Dance Cardio"
    private String title;       // Alias for name
    private String description; // e.g., "High-energy salsa, merengue, & bachata cardio intervals."
    private String muscles;     // Alias for description
}
