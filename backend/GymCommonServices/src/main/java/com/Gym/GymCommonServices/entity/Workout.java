package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "workouts")
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    private String category; // e.g., "PPL", "Single Muscle", "Full Body"

    // For single muscle, maybe "Chest", "Back" etc.
    // We can use category for broad type (PPL) and maybe a subCategory or just
    // flexible string.

    private String difficulty; // "Beginner", "Intermediate", "Advanced"

    private Integer calories;

    private String duration; // e.g., "45 Min", "1 Hr"

    private String imageUrl;
    private Integer mandatoryExercises;

    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutExercise> workoutExercises;
}
