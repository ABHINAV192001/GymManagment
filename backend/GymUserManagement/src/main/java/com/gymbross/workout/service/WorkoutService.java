package com.gymbross.workout.service;

import com.Gym.GymCommonServices.dto.WorkoutDto;
import com.Gym.GymCommonServices.dto.WorkoutExerciseDto;
import com.Gym.GymCommonServices.entity.Exercise;
import com.Gym.GymCommonServices.entity.Workout;
import com.Gym.GymCommonServices.entity.WorkoutExercise;
import com.gymbross.workout.repository.ExerciseRepository;
import com.gymbross.workout.repository.WorkoutRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.Gym.GymCommonServices.entity.User;
import com.gymbross.workout.repository.WorkoutHistoryRepository;
import com.gymbross.workout.entity.WorkoutHistory;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

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
            workouts = workoutRepository.findAllWithSplitDays();
        } else {
            workouts = workoutRepository.findByCategoryWithSplitDays(category);
        }
        return workouts.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkoutDto> getAllWorkouts() {
        return workoutRepository.findAllWithSplitDays().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<WorkoutDto> searchWorkouts(String query, Pageable pageable) {
        Page<Workout> page = workoutRepository.searchByTitle(query != null ? query.trim() : "", pageable);
        return page.map(this::mapToDto);
    }

    public WorkoutDto getWorkoutById(java.util.UUID id) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));
        return mapToDto(workout);
    }

    @Transactional(readOnly = true)
    public List<WorkoutDto> getUserWorkouts(java.util.UUID userId) {
        if (userId == null) {
            return getAllWorkouts();
        }
        return workoutRepository.findByCreatedByUserIdWithSplitDays(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
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
                .title(dto.getTitle() != null ? dto.getTitle() : dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory() != null ? dto.getCategory() : "CUSTOM_SPLIT")
                .difficulty(dto.getDifficulty() != null ? dto.getDifficulty() : "Intermediate")
                .calories(dto.getCalories() != null ? dto.getCalories() : 350)
                .duration(dto.getDuration() != null ? dto.getDuration() : "45 Min")
                .imageUrl(dto.getImage())
                .mandatoryExercises(dto.getMandatoryExercises())
                .daysPerWeek(dto.getDaysPerWeek() != null ? dto.getDaysPerWeek() : 3)
                .createdByUserId(dto.getCreatedByUserId())
                .targetDays(dto.getTargetDays())
                .build();

        if (dto.getExercises() != null && !dto.getExercises().isEmpty()) {
            List<WorkoutExercise> exercises = new java.util.ArrayList<>();
            for (WorkoutExerciseDto exDto : dto.getExercises()) {
                Exercise exercise = null;
                if (exDto.getExerciseId() != null) {
                    exercise = exerciseRepository.findById(exDto.getExerciseId()).orElse(null);
                    if (exercise == null && exDto.getName() != null && !exDto.getName().isEmpty()) {
                        exercise = Exercise.builder()
                                .name(exDto.getName())
                                .muscleGroup(exDto.getMuscleGroup() != null ? exDto.getMuscleGroup() : "TARGET")
                                .description(exDto.getDescription() != null ? exDto.getDescription() : "")
                                .mechanics(exDto.getMechanics() != null ? exDto.getMechanics() : "COMPOUND")
                                .build();
                        exercise.setId(exDto.getExerciseId());
                        exercise = exerciseRepository.save(exercise);
                    }
                }
                WorkoutExercise we = WorkoutExercise.builder()
                        .workout(workout)
                        .exercise(exercise)
                        .sets(exDto.getSets() != null ? exDto.getSets() : 3)
                        .reps(exDto.getReps() != null ? exDto.getReps() : "10-12")
                        .time(exDto.getTime() != null ? exDto.getTime() : 60)
                        .targetDays(exDto.getTargetDays())
                        .build();
                exercises.add(we);
            }
            workout.setWorkoutExercises(exercises);
        }

        Workout saved = workoutRepository.save(workout);
        return mapToDto(saved);
    }

    @Transactional
    public WorkoutDto updateWorkout(java.util.UUID id, WorkoutDto dto) {
        Workout workout = workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        if (dto.getTitle() != null || dto.getName() != null) {
            workout.setTitle(dto.getTitle() != null ? dto.getTitle() : dto.getName());
        }
        if (dto.getDescription() != null) workout.setDescription(dto.getDescription());
        if (dto.getCategory() != null) workout.setCategory(dto.getCategory());
        if (dto.getDifficulty() != null) workout.setDifficulty(dto.getDifficulty());
        if (dto.getCalories() != null) workout.setCalories(dto.getCalories());
        if (dto.getDuration() != null) workout.setDuration(dto.getDuration());
        if (dto.getImage() != null) workout.setImageUrl(dto.getImage());
        if (dto.getMandatoryExercises() != null) workout.setMandatoryExercises(dto.getMandatoryExercises());
        if (dto.getDaysPerWeek() != null) workout.setDaysPerWeek(dto.getDaysPerWeek());
        if (dto.getTargetDays() != null) workout.setTargetDays(dto.getTargetDays());
        if (dto.getCreatedByUserId() != null) workout.setCreatedByUserId(dto.getCreatedByUserId());

        if (dto.getExercises() != null) {
            if (workout.getWorkoutExercises() != null) {
                workout.getWorkoutExercises().clear();
            } else {
                workout.setWorkoutExercises(new java.util.ArrayList<>());
            }
            for (WorkoutExerciseDto exDto : dto.getExercises()) {
                Exercise exercise = null;
                if (exDto.getExerciseId() != null) {
                    exercise = exerciseRepository.findById(exDto.getExerciseId()).orElse(null);
                    if (exercise == null && exDto.getName() != null && !exDto.getName().isEmpty()) {
                        exercise = Exercise.builder()
                                .name(exDto.getName())
                                .muscleGroup(exDto.getMuscleGroup() != null ? exDto.getMuscleGroup() : "TARGET")
                                .description(exDto.getDescription() != null ? exDto.getDescription() : "")
                                .mechanics(exDto.getMechanics() != null ? exDto.getMechanics() : "COMPOUND")
                                .build();
                        exercise.setId(exDto.getExerciseId());
                        exercise = exerciseRepository.save(exercise);
                    }
                }
                WorkoutExercise we = WorkoutExercise.builder()
                        .workout(workout)
                        .exercise(exercise)
                        .sets(exDto.getSets() != null ? exDto.getSets() : 3)
                        .reps(exDto.getReps() != null ? exDto.getReps() : "10-12")
                        .time(exDto.getTime() != null ? exDto.getTime() : 60)
                        .targetDays(exDto.getTargetDays())
                        .build();
                workout.getWorkoutExercises().add(we);
            }
        }

        Workout updated = workoutRepository.save(workout);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteWorkout(java.util.UUID id) {
        if (id == null) return;
        Workout workout = workoutRepository.findById(id).orElse(null);
        if (workout != null) {
            workoutRepository.delete(workout);
        }
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
                        .targetDays(we.getTargetDays())
                        .stepOneImage(we.getExercise() != null ? we.getExercise().getStepOneImage() : null)
                        .stepOneDescription(we.getExercise() != null ? we.getExercise().getStepOneDescription() : null)
                        .stepTwoImage(we.getExercise() != null ? we.getExercise().getStepTwoImage() : null)
                        .stepTwoDescription(we.getExercise() != null ? we.getExercise().getStepTwoDescription() : null)
                        .build())
                .collect(Collectors.toList()) : java.util.Collections.emptyList();

        List<com.Gym.GymCommonServices.dto.WorkoutSplitDayDto> splitDayDtos = workout.getSplitDays() != null ?
                workout.getSplitDays().stream()
                        .sorted(java.util.Comparator.comparingInt(sd -> sd.getDisplayOrder() != null ? sd.getDisplayOrder() : 99))
                        .map(sd -> com.Gym.GymCommonServices.dto.WorkoutSplitDayDto.builder()
                                .day(sd.getDayLabel())
                                .name(sd.getName())
                                .title(sd.getName())
                                .description(sd.getDescription())
                                .muscles(sd.getDescription())
                                .displayOrder(sd.getDisplayOrder())
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
                .createdByUserId(workout.getCreatedByUserId())
                .targetDays(workout.getTargetDays())
                .splitDays(splitDayDtos)
                .exercises(exerciseDtos)
                .build();
    }
}
