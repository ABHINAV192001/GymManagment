package com.gymbross.workout.service.impl;

import com.Gym.GymCommonServices.dto.ExerciseDto;
import com.Gym.GymCommonServices.entity.Exercise;
import com.gymbross.workout.repository.ExerciseRepository;
import com.gymbross.workout.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExerciseServiceImpl implements ExerciseService {

    private final ExerciseRepository exerciseRepository;

    @Override
    public ExerciseDto createExercise(ExerciseDto dto) {
        Exercise exercise = mapToEntity(dto);
        Exercise saved = exerciseRepository.save(exercise);
        return mapToDto(saved);
    }

    @Override
    public ExerciseDto updateExercise(java.util.UUID id, ExerciseDto dto) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        exercise.setName(dto.getName());
        exercise.setDescription(dto.getDescription());
        exercise.setVideoUrl(dto.getVideoUrl());
        exercise.setMuscleGroup(dto.getMuscleGroup());
        exercise.setSecondaryMuscles(dto.getSecondaryMuscles());
        exercise.setEquipment(dto.getEquipment());
        exercise.setMechanics(dto.getMechanics());
        exercise.setDifficultyLevel(dto.getDifficultyLevel());
        exercise.setRecommendedSets(dto.getRecommendedSets());
        exercise.setRecommendedReps(dto.getRecommendedReps());
        exercise.setRestInterval(dto.getRestInterval());
        exercise.setExecutionSteps(dto.getExecutionSteps());
        exercise.setSafetyTips(dto.getSafetyTips());
        exercise.setStepOneImage(dto.getStepOneImage());
        exercise.setStepOneDescription(dto.getStepOneDescription());
        exercise.setStepTwoImage(dto.getStepTwoImage());
        exercise.setStepTwoDescription(dto.getStepTwoDescription());

        Exercise updated = exerciseRepository.save(exercise);
        return mapToDto(updated);
    }

    @Override
    public void deleteExercise(java.util.UUID id) {
        exerciseRepository.deleteById(id);
    }

    @Override
    public ExerciseDto getExercise(java.util.UUID id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        return mapToDto(exercise);
    }

    @Override
    public List<ExerciseDto> getAllExercises(String muscleGroup, String search) {
        List<Exercise> exercises;
        if (search != null && !search.trim().isEmpty()) {
            exercises = exerciseRepository.searchExercises(search.trim());
        } else if (muscleGroup != null && !muscleGroup.trim().isEmpty()) {
            exercises = exerciseRepository.findByMuscleGroupIgnoreCase(muscleGroup.trim());
        } else {
            exercises = exerciseRepository.findAll();
        }
        return exercises.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private ExerciseDto mapToDto(Exercise e) {
        return ExerciseDto.builder()
                .id(e.getId())
                .name(e.getName())
                .description(e.getDescription())
                .videoUrl(e.getVideoUrl())
                .muscleGroup(e.getMuscleGroup())
                .secondaryMuscles(e.getSecondaryMuscles())
                .equipment(e.getEquipment())
                .mechanics(e.getMechanics())
                .difficultyLevel(e.getDifficultyLevel())
                .recommendedSets(e.getRecommendedSets())
                .recommendedReps(e.getRecommendedReps())
                .restInterval(e.getRestInterval())
                .executionSteps(e.getExecutionSteps())
                .safetyTips(e.getSafetyTips())
                .stepOneImage(e.getStepOneImage())
                .stepOneDescription(e.getStepOneDescription())
                .stepTwoImage(e.getStepTwoImage())
                .stepTwoDescription(e.getStepTwoDescription())
                .build();
    }

    private Exercise mapToEntity(ExerciseDto dto) {
        return Exercise.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .videoUrl(dto.getVideoUrl())
                .muscleGroup(dto.getMuscleGroup())
                .secondaryMuscles(dto.getSecondaryMuscles())
                .equipment(dto.getEquipment())
                .mechanics(dto.getMechanics())
                .difficultyLevel(dto.getDifficultyLevel())
                .recommendedSets(dto.getRecommendedSets())
                .recommendedReps(dto.getRecommendedReps())
                .restInterval(dto.getRestInterval())
                .executionSteps(dto.getExecutionSteps())
                .safetyTips(dto.getSafetyTips())
                .stepOneImage(dto.getStepOneImage())
                .stepOneDescription(dto.getStepOneDescription())
                .stepTwoImage(dto.getStepTwoImage())
                .stepTwoDescription(dto.getStepTwoDescription())
                .build();
    }
}
