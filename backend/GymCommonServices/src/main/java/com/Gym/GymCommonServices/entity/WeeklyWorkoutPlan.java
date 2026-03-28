package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "weekly_workout_plans")
public class WeeklyWorkoutPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private Long mondayWorkoutId;
    private Long tuesdayWorkoutId;
    private Long wednesdayWorkoutId;
    private Long thursdayWorkoutId;
    private Long fridayWorkoutId;
    private Long saturdayWorkoutId;
    private Long sundayWorkoutId;

    // Helper method to get workout ID by day name
    public Long getWorkoutIdForDay(String day) {
        if (day == null)
            return null;
        return switch (day.toLowerCase()) {
            case "monday" -> mondayWorkoutId;
            case "tuesday" -> tuesdayWorkoutId;
            case "wednesday" -> wednesdayWorkoutId;
            case "thursday" -> thursdayWorkoutId;
            case "friday" -> fridayWorkoutId;
            case "saturday" -> saturdayWorkoutId;
            case "sunday" -> sundayWorkoutId;
            default -> null;
        };
    }
}
