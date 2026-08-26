package com.gymbross.workout.service;

import com.Gym.GymCommonServices.dto.ExerciseDto;
import com.Gym.GymCommonServices.dto.ExerciseSummaryDto;
import java.util.List;

public interface ExerciseService {
    ExerciseDto createExercise(ExerciseDto exerciseDto);

    ExerciseDto updateExercise(java.util.UUID id, ExerciseDto exerciseDto);

    void deleteExercise(java.util.UUID id);

    ExerciseDto getExercise(java.util.UUID id);

    List<ExerciseDto> getAllExercises(String muscleGroup, String search);

    List<ExerciseSummaryDto> getAllExerciseSummaries(String muscleGroup, String search);
}
