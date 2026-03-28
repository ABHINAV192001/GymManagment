package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "exercises")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(length = 1000)
    private String description;

    private String videoUrl;

    private String muscleGroup; // e.g., "Chest", "Back", "Legs"

    // Step-by-step instructions
    private String stepOneImage;
    private String stepOneDescription;
    private String stepTwoImage;
    private String stepTwoDescription;
}
