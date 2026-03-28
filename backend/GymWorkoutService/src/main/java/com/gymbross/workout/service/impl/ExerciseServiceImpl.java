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
    public ExerciseDto updateExercise(Long id, ExerciseDto dto) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        exercise.setName(dto.getName());
        exercise.setDescription(dto.getDescription());
        exercise.setVideoUrl(dto.getVideoUrl());
        exercise.setMuscleGroup(dto.getMuscleGroup());
        exercise.setStepOneImage(dto.getStepOneImage());
        exercise.setStepOneDescription(dto.getStepOneDescription());
        exercise.setStepTwoImage(dto.getStepTwoImage());
        exercise.setStepTwoDescription(dto.getStepTwoDescription());

        Exercise updated = exerciseRepository.save(exercise);
        return mapToDto(updated);
    }

    @Override
    public void deleteExercise(Long id) {
        exerciseRepository.deleteById(id);
    }

    @Override
    public ExerciseDto getExercise(Long id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
        return mapToDto(exercise);
    }

    @Override
    public List<ExerciseDto> getAllExercises(String muscleGroup) {
        List<Exercise> exercises;
        if (muscleGroup != null && !muscleGroup.isEmpty()) {
            // Assuming we might need to add findByMuscleGroup to repo if not exists,
            // but for now filtering locally or using existing methods if any.
            // Let's implement findAll and filter for now as dataset isn't huge yet.
            exercises = exerciseRepository.findAll().stream()
                    .filter(e -> e.getMuscleGroup().equalsIgnoreCase(muscleGroup))
                    .collect(Collectors.toList());
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
                .stepOneImage(dto.getStepOneImage())
                .stepOneDescription(dto.getStepOneDescription())
                .stepTwoImage(dto.getStepTwoImage())
                .stepTwoDescription(dto.getStepTwoDescription())
                .build();
    }
}
