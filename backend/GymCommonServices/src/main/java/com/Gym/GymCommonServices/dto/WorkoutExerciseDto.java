package com.Gym.GymCommonServices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutExerciseDto {
    private Long id;
    private Long exerciseId;
    private String name; // Exercise name for convenience
    private String description; // Exercise description
    private String videoUrl;
    private Integer sets;
    private Integer reps;
    private Integer time;

    // Step-by-step instructions
    private String stepOneImage;
    private String stepOneDescription;
    private String stepTwoImage;
    private String stepTwoDescription;
}
