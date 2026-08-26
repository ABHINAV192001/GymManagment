package com.Gym.GymCommonServices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseSummaryDto {
    private java.util.UUID id;
    private String name;
    private String muscleGroup;
    private String secondaryMuscles;
    private String equipment;
    private String mechanics;
    private String difficultyLevel;
    private Integer recommendedSets;
    private String recommendedReps;
    private String restInterval;
    private String stepOneImage;
    private String stepTwoImage;
}
