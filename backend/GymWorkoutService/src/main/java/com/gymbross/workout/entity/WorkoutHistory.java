package com.gymbross.workout.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "workout_history")
public class WorkoutHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long workoutId;

    private String workoutTitle;

    private Integer durationSeconds;

    private Integer caloriesBurned;

    private LocalDateTime completedAt;
}
