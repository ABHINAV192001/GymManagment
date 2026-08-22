package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "workout_split_days")
public class WorkoutSplitDay extends com.Gym.GymCommonServices.common.BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_id", nullable = false)
    private Workout workout;

    @Column(name = "day_label")
    private String dayLabel; // e.g. "Day 1", "Workout A"

    private String name;     // e.g. "Latin Dance Cardio"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "display_order")
    private Integer displayOrder;
}
