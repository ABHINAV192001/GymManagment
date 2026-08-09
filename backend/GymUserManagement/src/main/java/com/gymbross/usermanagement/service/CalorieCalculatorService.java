package com.gymbross.usermanagement.service;

import com.Gym.GymCommonServices.entity.User;
import org.springframework.stereotype.Service;

@Service
public class CalorieCalculatorService {

    public int calculateTargetCalories(User user) {
        if (user == null || user.getHeight() == null || user.getWeight() == null || user.getHeight() <= 0 || user.getWeight() <= 0) {
            return 0;
        }

        Integer age = user.getAge();
        if (age == null && user.getDob() != null) {
            age = java.time.Period.between(user.getDob(), java.time.LocalDate.now()).getYears();
        }

        double weight = user.getWeight();
        double height = user.getHeight();
        int userAge = age != null ? age : 25;
        String gender = user.getGender() != null ? user.getGender() : "Male";

        double bmr;
        if ("Female".equalsIgnoreCase(gender)) {
            bmr = (10 * weight) + (6.25 * height) - (5 * userAge) - 161;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * userAge) + 5;
        }

        double multiplier = 1.2;
        String activityLevel = user.getActivityLevel() != null ? user.getActivityLevel().toLowerCase() : "sedentary";
        switch (activityLevel) {
            case "light":
                multiplier = 1.375;
                break;
            case "moderate":
                multiplier = 1.55;
                break;
            case "active":
                multiplier = 1.725;
                break;
            case "very_active":
                multiplier = 1.9;
                break;
        }

        int targetCalories = (int) (bmr * multiplier);
        String goal = user.getGoal() != null ? user.getGoal().toLowerCase() : "maintain";
        if (goal.contains("loss") || goal.contains("cut")) {
            targetCalories -= 500;
        } else if (goal.contains("gain") || goal.contains("bulk")) {
            targetCalories += 500;
        }
        return Math.max(0, targetCalories);
    }
}
