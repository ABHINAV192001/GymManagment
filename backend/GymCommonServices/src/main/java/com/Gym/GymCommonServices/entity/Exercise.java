package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "exercises")
public class Exercise extends com.Gym.GymCommonServices.common.BaseEntity {

    

    private String name;

    @Column(length = 1000)
    private String description;

    private String videoUrl;

    private String muscleGroup; // e.g., "CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "FOREARMS", "ABS", "QUADS", "HAMSTRINGS", "GLUTES", "CALVES"

    private String secondaryMuscles;

    private String equipment; // e.g., "Barbell", "Dumbbell", "Cable", "Machine", "Bodyweight"

    private String mechanics; // e.g., "COMPOUND", "ISOLATION"

    private String difficultyLevel; // e.g., "BEGINNER", "INTERMEDIATE", "PRO"

    private Integer recommendedSets;

    private String recommendedReps;

    private String restInterval;

    @Column(columnDefinition = "TEXT")
    private String executionSteps;

    @Column(columnDefinition = "TEXT")
    private String safetyTips;

    // Step-by-step instructions
    private String stepOneImage;
    private String stepOneDescription;
    private String stepTwoImage;
    private String stepTwoDescription;
}
