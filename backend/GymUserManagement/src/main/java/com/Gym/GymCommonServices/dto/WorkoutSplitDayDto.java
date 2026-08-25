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
    private String day;           // e.g., "Day 1", "Workout A"
    private String name;          // e.g., "Push A (Chest, Shoulders & Triceps)"
    private String title;         // Alias for name
    private String description;   // Comma-separated exercise list
    private String muscles;       // Alias for description
    private Integer displayOrder; // Sort order from DB (1-based)
}
