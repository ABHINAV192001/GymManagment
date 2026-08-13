package com.gymbross.workout.service;

import com.Gym.GymCommonServices.dto.WorkoutDto;
import com.Gym.GymCommonServices.dto.WorkoutExerciseDto;
import com.Gym.GymCommonServices.entity.Exercise;
import com.Gym.GymCommonServices.entity.Workout;
import com.Gym.GymCommonServices.entity.WorkoutExercise;
import com.gymbross.workout.repository.ExerciseRepository;
import com.gymbross.workout.repository.WorkoutRepository;
import com.gymbross.workout.repository.UserRepository;
import com.Gym.GymCommonServices.entity.User;
import com.gymbross.workout.repository.WorkoutHistoryRepository;
import com.gymbross.workout.entity.WorkoutHistory;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;
    private final WorkoutHistoryRepository workoutHistoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WorkoutDto> getWorkoutsByCategory(String category) {
        List<Workout> workouts;
        if (category == null || category.isEmpty() || category.equalsIgnoreCase("all")) {
            workouts = workoutRepository.findAll();
        } else {
            workouts = workoutRepository.findByCategory(category);
        }
        return workouts.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkoutDto> getAllWorkouts() {
        return workoutRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public WorkoutDto getWorkoutById(java.util.UUID id) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));
        return mapToDto(workout);
    }

    @Transactional
    public void saveWorkoutHistory(String userEmail, java.util.UUID workoutId, Integer duration, Integer calories) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        WorkoutHistory history = WorkoutHistory.builder()
                .userId(user.getId())
                .workoutId(workoutId)
                .workoutTitle(workout.getTitle())
                .durationSeconds(duration)
                .caloriesBurned(calories)
                .completedAt(LocalDateTime.now())
                .build();

        workoutHistoryRepository.save(history);
    }

    @Transactional
    public WorkoutDto createWorkout(WorkoutDto dto) {
        Workout workout = Workout.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .difficulty("Intermediate") // Default or from DTO if added
                .calories(dto.getCalories())
                .duration(dto.getDuration())
                .imageUrl(dto.getImage())
                .mandatoryExercises(dto.getMandatoryExercises())
                .build();

        Workout saved = workoutRepository.save(workout);
        return mapToDto(saved);
    }

    @Transactional
    public WorkoutDto updateWorkout(java.util.UUID id, WorkoutDto dto) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        workout.setTitle(dto.getTitle());
        workout.setDescription(dto.getDescription());
        workout.setCategory(dto.getCategory());
        workout.setCalories(dto.getCalories());
        workout.setDuration(dto.getDuration());
        workout.setImageUrl(dto.getImage());
        workout.setMandatoryExercises(dto.getMandatoryExercises());

        Workout updated = workoutRepository.save(workout);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteWorkout(java.util.UUID id) {
        workoutRepository.deleteById(id);
    }

    private WorkoutDto mapToDto(Workout workout) {
        List<WorkoutExerciseDto> exerciseDtos = workout.getWorkoutExercises() != null ?
                workout.getWorkoutExercises().stream()
                .map(we -> WorkoutExerciseDto.builder()
                        .id(we.getId())
                        .exerciseId(we.getExercise() != null ? we.getExercise().getId() : null)
                        .name(we.getExercise() != null ? we.getExercise().getName() : "Exercise")
                        .muscleGroup(we.getExercise() != null ? we.getExercise().getMuscleGroup() : "TARGET")
                        .mechanics(we.getExercise() != null && we.getExercise().getMechanics() != null ? we.getExercise().getMechanics() : "COMPOUND")
                        .description(we.getExercise() != null ? we.getExercise().getDescription() : "")
                        .videoUrl(we.getExercise() != null ? we.getExercise().getVideoUrl() : null)
                        .sets(we.getSets())
                        .reps(we.getReps())
                        .time(we.getTime())
                        .stepOneImage(we.getExercise() != null ? we.getExercise().getStepOneImage() : null)
                        .stepOneDescription(we.getExercise() != null ? we.getExercise().getStepOneDescription() : null)
                        .stepTwoImage(we.getExercise() != null ? we.getExercise().getStepTwoImage() : null)
                        .stepTwoDescription(we.getExercise() != null ? we.getExercise().getStepTwoDescription() : null)
                        .build())
                .collect(Collectors.toList()) : java.util.Collections.emptyList();

        List<com.Gym.GymCommonServices.dto.WorkoutSplitDayDto> splitDayDtos = workout.getSplitDays() != null ?
                workout.getSplitDays().stream()
                        .map(sd -> com.Gym.GymCommonServices.dto.WorkoutSplitDayDto.builder()
                                .day(sd.getDayLabel())
                                .name(sd.getName())
                                .title(sd.getName())
                                .description(sd.getDescription())
                                .muscles(sd.getDescription())
                                .build())
                        .collect(Collectors.toList()) : java.util.Collections.emptyList();

        return WorkoutDto.builder()
                .id(workout.getId())
                .title(workout.getTitle())
                .name(workout.getTitle())
                .description(workout.getDescription())
                .category(workout.getCategory())
                .badge(workout.getCategory())
                .difficulty(workout.getDifficulty() != null ? workout.getDifficulty() : "BEGINNER")
                .level(workout.getDifficulty() != null ? workout.getDifficulty() : "BEGINNER")
                .daysPerWeek(workout.getDaysPerWeek() != null ? workout.getDaysPerWeek() : 3)
                .image(workout.getImageUrl())
                .calories(workout.getCalories())
                .duration(workout.getDuration())
                .totalExercises(exerciseDtos.size())
                .selectedExercises(exerciseDtos.size())
                .mandatoryExercises(workout.getMandatoryExercises())
                .splitDays(splitDayDtos)
                .exercises(exerciseDtos)
                .build();
    }
}
