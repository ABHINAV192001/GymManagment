package com.Gym.GymCommonServices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Integer totalExercises;
    private Integer selectedExercises; // For user progress, maybe handled separately but good for UI
    private Integer calories;
    private String duration;
    private String image; // imageUrl in entity
    private Integer mandatoryExercises;
    private List<WorkoutExerciseDto> exercises;

}
