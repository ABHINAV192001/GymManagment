package com.gymbross.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private java.util.UUID id;
    private String username;
    @NotBlank(message = "Name cannot be blank")
    private String name;
    
    @Email(message = "Email should be valid")
    private String email;
    
    private String phone;
    private String role;
    private String userCode; // Member ID
    private Boolean isActive;

    // Personal (Transient in DB, but needed in UI)
    private LocalDate dob;
    private Integer age; // Calculated
    private String gender;
    private String whatsappNumber;

    // Membership
    private String plan; // e.g. "Gold Plan"
    private LocalDate startDate;
    private LocalDate endDate; // Calculated in service
    private String membershipStatus; // Active/Expired
    private String trainerName;
    private java.util.UUID trainerId;
    private Boolean hasTrainer;
    private String workoutPlanName;

    // Fitness Background
    private String fitnessLevel;
    private String workoutExperience;
    private String careerGap;
    private Boolean hasPreviousGymExperience;

    // Location
    private String state;
    private String city;
    private String areaType;
    private String preferredLocation;

    // Health
    private Double height;
    private Double weight;
    private Double bmi; // Calculated
    private Integer dailyCalorieTarget;
    private String activityLevel;
    private String goal;
    private Boolean isOnboardingCompleted;
    private String medicalConditions;
    private Boolean injuryHistory;
    private String notes;

    // Preferences
    private String preferredWorkoutType;
    private String workoutTiming;
    private String workoutDays;

    // Social
    private String instagramProfile;

    // User Specific
    private Integer experience;
    private Boolean isPersonalTrainer;
    private String shiftTimings;

    // User Specific
    private String staffRole;
    private String paymentStatus;

    // Rating
    private Double averageRating;
}
