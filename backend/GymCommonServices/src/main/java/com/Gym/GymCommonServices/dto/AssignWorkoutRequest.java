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
public class AssignWorkoutRequest {
    private Long userId;
    private String day; // "Monday", "Tuesday", etc.
    private List<WorkoutExerciseDto> exercises;
}
