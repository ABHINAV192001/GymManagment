package com.gymbross.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class AttendanceDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckInRequestDto {
        private UUID entityId;
        private String entityType; // "USER", "STAFF"
        private UUID branchId;
        private String method; // "QR", "MANUAL", "BIOMETRIC"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceLogResponseDto {
        private UUID id;
        private String entityType;
        private UUID entityId;
        private UUID branchId;
        private String branchName;
        private String entityName;
        private String entityCode;
        private LocalDateTime checkInTime;
        private LocalDateTime checkOutTime;
        private String method;
        private String status; // "ACTIVE", "COMPLETED"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceReportDto {
        private long totalCheckinsToday;
        private long activeCheckinsToday;
        private long completedCheckinsToday;
        private LocalDate date;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QRScanRequestDto {
        private UUID userId;
        private UUID branchId;
        private String qrData;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QRScanResponseDto {
        private boolean success;
        private String message;
        private LocalDateTime checkInTime;
        private int streakGained; // +1 or +0
        private Integer totalStreak; // optional tracking
        private Long daysLeftOnMembership;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TodayStatusDto {
        private boolean checkedIn;
        private LocalDateTime checkinTime; // null when not yet checked in
    }
}
