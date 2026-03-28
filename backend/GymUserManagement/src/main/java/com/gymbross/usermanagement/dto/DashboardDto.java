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
public class DashboardDto {

    private Calories calories;
    private Macros macros;
    private Activity activity;
    private Today today;
    private Biometrics biometrics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Calories {
        private int current;
        private int target;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Macros {
        private MacroDetail carbs;
        private MacroDetail protein;
        private MacroDetail fat;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MacroDetail {
        private int current;
        private int target;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Activity {
        private ActivityDetail steps;
        private ActivityDetail water;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityDetail {
        private double current;
        private double target;
        private String unit;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Today {
        private String date;
        private String workoutDay;
        private String workoutPlan;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Biometrics {
        private double height;
        private double weight;
    }
}
