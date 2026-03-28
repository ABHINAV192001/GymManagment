package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "workout_exercises")
public class WorkoutExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "workout_id")
    private Workout workout;

    @ManyToOne
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    private Integer sets;

    private Integer reps;

    private Integer time; // in seconds
}
