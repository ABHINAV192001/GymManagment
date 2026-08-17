package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "workout_exercises")
public class WorkoutExercise extends com.Gym.GymCommonServices.common.BaseEntity {

    

    @ManyToOne
    @JoinColumn(name = "workout_id")
    private Workout workout;

    @ManyToOne
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    private Integer sets;

    private String reps;

    private Integer time; // in seconds

    @Column(name = "target_days")
    private String targetDays; // e.g. "Monday,Wednesday,Friday"
}
