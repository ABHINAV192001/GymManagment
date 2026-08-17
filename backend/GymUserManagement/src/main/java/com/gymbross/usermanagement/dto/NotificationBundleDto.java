package com.gymbross.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationBundleDto {

    private Boolean enabled;
    private String recipientEmail;

    // 1. Workout Routine Alert
    private WorkoutReminderDto workoutReminder;

    // 2. Diet & What To Eat Alert
    private DietReminderDto dietReminder;

    // 3. Hydration Level & Water Timer
    private WaterReminderDto waterReminder;

    // 4. Movement & Walk Timer
    private WalkReminderDto walkReminder;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkoutReminderDto {
        private Boolean enabled;
        private String preferredTime; // e.g. "07:00"
        private String splitFocus; // e.g. "Upper Body & Core Power"
        private Boolean includeWarmup;
        private Boolean includeMotivation;
        private List<String> targetExercises;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DietReminderDto {
        private Boolean enabled;
        private String breakfastTime; // e.g. "08:30"
        private String lunchTime; // e.g. "13:00"
        private String snackTime; // e.g. "17:00"
        private String dinnerTime; // e.g. "20:30"
        private Integer dailyCalorieTarget; // e.g. 2200
        private Integer proteinTargetGrams;
        private Integer carbsTargetGrams;
        private Integer fatTargetGrams;
        private Boolean suggestMealIdeas;
        private String dietPlanName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WaterReminderDto {
        private Boolean enabled;
        private Integer intervalHours; // e.g. 1 (Every 1 hour)
        private String startTime; // e.g. "08:00"
        private String endTime; // e.g. "22:00"
        private Double dailyTargetLiters; // e.g. 3.5
        private Double currentLoggedLiters; // e.g. 2.25
        private Integer percentageCompleted; // e.g. 64
        private Boolean alertIfBelowTarget;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WalkReminderDto {
        private Boolean enabled;
        private Integer intervalHours; // e.g. 1 (Hourly desk break / 5-10 min walk)
        private String walkTime; // e.g. "18:30" (Daily evening walk)
        private Integer dailyStepTarget; // e.g. 10000
        private String reminderType; // "HOURLY_BREAK", "SCHEDULED_WALK", "BOTH"
    }
}
