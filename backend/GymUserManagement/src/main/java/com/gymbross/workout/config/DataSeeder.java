package com.gymbross.workout.config;

import com.gymbross.workout.repository.ExerciseRepository;
import com.gymbross.workout.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component("workoutDataSeeder")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;

    @Override
    public void run(String... args) throws Exception {
        long exerciseCount = exerciseRepository.count();
        long workoutCount = workoutRepository.count();
        log.info("Workout Service initialized: {} exercises and {} workout routines loaded from PostgreSQL.", exerciseCount, workoutCount);
    }
}
