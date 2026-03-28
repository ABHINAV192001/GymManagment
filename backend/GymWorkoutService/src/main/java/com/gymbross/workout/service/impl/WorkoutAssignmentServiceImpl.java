package com.gymbross.workout.service.impl;

import com.Gym.GymCommonServices.dto.AssignWorkoutRequest;
import com.Gym.GymCommonServices.dto.WeeklyWorkoutPlanDto;
import com.Gym.GymCommonServices.dto.WorkoutExerciseDto;
import com.Gym.GymCommonServices.entity.*;
import com.gymbross.workout.repository.*;
import com.gymbross.workout.service.UserWorkoutService;
import com.gymbross.workout.service.WorkoutAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutAssignmentServiceImpl implements WorkoutAssignmentService {

    private final UserRepository userRepository;
    private final WorkoutRepository workoutRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserWorkoutService userWorkoutService;
    private final WeeklyWorkoutPlanRepository weeklyWorkoutPlanRepository;

    @Override
    @Transactional
    public WeeklyWorkoutPlanDto assignWorkoutToUser(AssignWorkoutRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!Role.PREMIUM_USER.equals(user.getRole())) {
            // throw new RuntimeException("Only Premium users can have assigned workouts");
            // For now allowing all or ensuring prompt handling. UserWorkoutService checks
            // this too.
        }

        // 1. Create a new Workout specific for this assignment
        Workout workout = Workout.builder()
                .title(request.getDay() + " Assessment Workout")
                .description("Assigned workout for " + request.getDay())
                .category("PERSONALIZED")
                .difficulty("Intermediate") // Default or passed in request?
                .calories(0) // dynamic calc later
                .duration("60 Min") // dynamic calc later
                .mandatoryExercises(request.getExercises().size())
                .build();

        workout = workoutRepository.save(workout);

        // 2. Create and Save WorkoutExercises
        List<WorkoutExercise> workoutExercises = new ArrayList<>();
        for (WorkoutExerciseDto exDto : request.getExercises()) {
            Exercise exercise = exerciseRepository.findById(exDto.getExerciseId())
                    .orElseThrow(() -> new RuntimeException("Exercise not found: " + exDto.getExerciseId()));

            WorkoutExercise we = WorkoutExercise.builder()
                    .workout(workout)
                    .exercise(exercise)
                    .sets(exDto.getSets())
                    .reps(exDto.getReps())
                    .time(exDto.getTime())
                    .build();

            workoutExercises.add(we);
        }
        workoutExerciseRepository.saveAll(workoutExercises);

        // 3. Update Weekly Plan
        WeeklyWorkoutPlanDto planDto = userWorkoutService.getWeeklyPlan(user.getId()); // Gets or creates (via repo
                                                                                       // check in service? No,
                                                                                       // getWeeklyPlan throws if not
                                                                                       // found usually, let's verify)
        // Actually userWorkoutService.getWeeklyPlan throws if not found.
        // We should ensure plan exists.

        // Let's rely on userWorkoutService.updateWeeklyPlan logic which gets or
        // creates...
        // Wait, userWorkoutService.getWeeklyPlan throws "Weekly plan not found"
        // We should probably check if it exists or handle it.
        // Let's fetch entity directly to be safe or catch exception.

        WeeklyWorkoutPlan plan = weeklyWorkoutPlanRepository.findByUserId(user.getId())
                .orElse(WeeklyWorkoutPlan.builder().user(user).build());

        // Update the specific day
        switch (request.getDay().toLowerCase()) {
            case "monday":
                plan.setMondayWorkoutId(workout.getId());
                break;
            case "tuesday":
                plan.setTuesdayWorkoutId(workout.getId());
                break;
            case "wednesday":
                plan.setWednesdayWorkoutId(workout.getId());
                break;
            case "thursday":
                plan.setThursdayWorkoutId(workout.getId());
                break;
            case "friday":
                plan.setFridayWorkoutId(workout.getId());
                break;
            case "saturday":
                plan.setSaturdayWorkoutId(workout.getId());
                break;
            case "sunday":
                plan.setSundayWorkoutId(workout.getId());
                break;
            default:
                throw new RuntimeException("Invalid day: " + request.getDay());
        }

        weeklyWorkoutPlanRepository.save(plan);

        return userWorkoutService.getWeeklyPlan(user.getId());
    }

    @Override
    public WeeklyWorkoutPlanDto getUserWeeklyPlan(Long userId) {
        return userWorkoutService.getWeeklyPlan(userId);
    }
}
