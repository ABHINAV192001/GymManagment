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
    @GeneratedValue
    private java.util.UUID id;

    private java.util.UUID userId;

    private java.util.UUID workoutId;

    private String workoutTitle;

    private Integer durationSeconds;

    private Integer caloriesBurned;

    private LocalDateTime completedAt;
}
