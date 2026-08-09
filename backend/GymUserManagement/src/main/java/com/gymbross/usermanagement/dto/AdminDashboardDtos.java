package com.gymbross.usermanagement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AdminDashboardDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserTrackingDto {
        private String name;
        private String email;
        private String phoneNumber;
        private String plan;
        private Boolean personalTrainer;
        private String personalTrainerName;
        private BigDecimal amountPaid; // Assuming this is derived or stored
        private LocalDate startedDate;
        private LocalDate endingDate; // derived from plan?
        private List<String> workoutDetails; // Placeholder
        private List<String> diet; // Placeholder
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StaffTrackingDto {
        private java.util.UUID id;
        private String code; // staffCode or trainerCode
        private String username;
        private String role;
        private String name;
        private String email;
        private String phoneNumber;
        private BigDecimal salary;
        private LocalDate startedDate;
        private String shiftTimings;
        private boolean isPersonalTrainer;
        private List<String> customerNames;
        private String paymentStatus; // Added
        private String entityType; // "STAFF" or "TRAINER"
        private List<java.util.UUID> accessibleBranchIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDetailDto {
        private java.util.UUID id;
        private java.util.UUID branchId;
        private String branchName;
        private List<java.util.UUID> accessibleBranchIds;
        private String userCode;
        private String username;
        private String name;
        private String firstName;
        private String lastName;
        @jakarta.validation.constraints.Email(message = "Invalid email format")
        private String email;

        @jakarta.validation.constraints.Pattern(regexp = "^$|^\\d{10}$", message = "Phone number must be exactly 10 digits")
        private String phone;
        private LocalDate dob;
        private String plan;
        private BigDecimal amountPaid;
        private BigDecimal salary;
        private String trainerName;
        private String trainerCode;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer attendanceCount;
        private Boolean isActive;
        private Boolean isEmailVerified;
        private String status;
        private String role;
        private Boolean isStaff;
        private List<AttendanceDtos.AttendanceLogResponseDto> attendanceLogs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainerDetailDto {
        private java.util.UUID id;
        private java.util.UUID branchId;
        private List<java.util.UUID> accessibleBranchIds;
        private String trainerCode;
        private String username;
        private String name;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private BigDecimal salary;
        private LocalDate startDate;
        private String shiftTimings;
        private Boolean isPersonalTrainer;
        private Integer experience;
        private BigDecimal ptTrainerPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StaffDetailDto {
        private java.util.UUID id;
        private java.util.UUID userId;
        private java.util.UUID branchId;
        private List<java.util.UUID> accessibleBranchIds;
        private String staffCode;
        private String username;
        private String name;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private BigDecimal salary;
        private LocalDate startDate;
        private String shiftTimings;
        private Integer experience;
        private String role;
        private Boolean isPersonalTrainer;
        private BigDecimal ptTrainerPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStatsDto {
        private Long totalMembers;
        private String memberGrowth; // e.g. "+12%"
        private Long activeTrainers;
        private String trainerGrowth;
        private BigDecimal monthlyRevenue;
        private String revenueGrowth;
        private Long pendingRenewals;
        private String renewalTrend; // "up", "down", "neutral"
        private List<ActivityLogDto> recentActivity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityLogDto {
        private java.util.UUID id;
        private String message; // e.g. "John Doe checked in" or "New member registered"
        private String timeAgo; // e.g. "2 hours ago"
        private String type; // "CHECKIN", "REGISTRATION", "PAYMENT"
        private String userInitials; // "JD"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchDto {
        private java.util.UUID id;
        private String name;
        private String branchCode;
        private String adminEmail;
        private Boolean adminEmailVerified;
        private Long memberCount;
        private String status;
    }
}
