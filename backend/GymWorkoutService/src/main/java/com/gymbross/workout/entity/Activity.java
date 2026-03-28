package com.gymbross.workout.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String time;
    private String calories;
    private String image;
    private String gradient; // CSS gradient string

    @Column(length = 1000)
    private String description;

    @ElementCollection
    private List<String> benefits;

    @ElementCollection
    private List<String> schedule; // e.g., "Mon 6pm", "Wed 7pm"

    private String instructorName;
    private String instructorRole;
    private String instructorImage;

    private String category; // "CLASS" or "PROGRAM"

    private Long linkedWorkoutId;
}
