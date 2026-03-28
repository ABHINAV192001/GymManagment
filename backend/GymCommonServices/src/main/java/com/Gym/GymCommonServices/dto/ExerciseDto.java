package com.Gym.GymCommonServices.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseDto {
    private Long id;
    private String name;
    private String description;
    private String videoUrl;
    private String muscleGroup;
    private String stepOneImage;
    private String stepOneDescription;
    private String stepTwoImage;
    private String stepTwoDescription;
}
