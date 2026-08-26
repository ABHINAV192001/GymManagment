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
public class WeeklyWorkoutPlan extends com.Gym.GymCommonServices.common.BaseEntity {

    

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private java.util.UUID mondayWorkoutId;
    private java.util.UUID tuesdayWorkoutId;
    private java.util.UUID wednesdayWorkoutId;
    private java.util.UUID thursdayWorkoutId;
    private java.util.UUID fridayWorkoutId;
    private java.util.UUID saturdayWorkoutId;
    private java.util.UUID sundayWorkoutId;

    // Helper method to get workout ID by day name
    public java.util.UUID getWorkoutIdForDay(String day) {
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
