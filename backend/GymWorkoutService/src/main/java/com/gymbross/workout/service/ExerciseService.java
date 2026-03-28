package com.gymbross.workout.service;

import com.Gym.GymCommonServices.dto.ExerciseDto;
import java.util.List;

public interface ExerciseService {
    ExerciseDto createExercise(ExerciseDto exerciseDto);

    ExerciseDto updateExercise(Long id, ExerciseDto exerciseDto);

    void deleteExercise(Long id);

    ExerciseDto getExercise(Long id);

    List<ExerciseDto> getAllExercises(String muscleGroup);
}
