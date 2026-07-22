package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.entity.AttendanceLog;
import com.gymbross.usermanagement.repository.AttendanceLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceLogRepository attendanceLogRepository;

    @PostMapping("/checkin")
    @PreAuthorize("hasAuthority('ATTENDANCE:CREATE')")
    public ResponseEntity<ApiResponse<AttendanceLog>> checkIn(@RequestBody AttendanceLog request) {
        request.setCheckInTime(LocalDateTime.now());
        request.setStatus("ACTIVE");
        
        // Safety check to prevent double check-ins
        Optional<AttendanceLog> activeLog = attendanceLogRepository
                .findFirstByEntityIdAndStatusOrderByCheckInTimeDesc(request.getEntityId(), "ACTIVE");
        if (activeLog.isPresent()) {
            throw new IllegalArgumentException("Entity is already checked in");
        }

        return ResponseEntity.ok(ApiResponse.success(attendanceLogRepository.save(request), "Check-in successful"));
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasAuthority('ATTENDANCE:EDIT')")
    public ResponseEntity<ApiResponse<AttendanceLog>> checkOut(@RequestParam UUID entityId) {
        AttendanceLog activeLog = attendanceLogRepository
                .findFirstByEntityIdAndStatusOrderByCheckInTimeDesc(entityId, "ACTIVE")
                .orElseThrow(() -> new IllegalArgumentException("No active check-in found for this entity"));

        activeLog.setCheckOutTime(LocalDateTime.now());
        activeLog.setStatus("COMPLETED");
        return ResponseEntity.ok(ApiResponse.success(attendanceLogRepository.save(activeLog), "Check-out successful"));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ATTENDANCE:VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getAttendanceLogs(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestAttribute(required = false) UUID branchId) {
        if (branchId != null) {
            return ResponseEntity.ok(ApiResponse.success(attendanceLogRepository.findByBranchId(branchId)));
        }
        return ResponseEntity.ok(ApiResponse.success(attendanceLogRepository.findByOrganizationId(orgId)));
    }

    @GetMapping("/today")
    @PreAuthorize("hasAuthority('ATTENDANCE:VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getTodayCheckins(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestAttribute(required = false) UUID branchId) {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        List<AttendanceLog> logs;
        if (branchId != null) {
            logs = attendanceLogRepository.findByCheckInTimeBetweenAndBranchId(startOfDay, endOfDay, branchId);
        } else {
            logs = attendanceLogRepository.findByCheckInTimeBetweenAndOrganizationId(startOfDay, endOfDay, orgId);
        }
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getUserAttendance(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceLogRepository.findByEntityId(userId)));
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AttendanceLog>>> getStaffAttendance(@PathVariable UUID staffId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceLogRepository.findByEntityId(staffId)));
    }

    @GetMapping("/report")
    @PreAuthorize("hasAuthority('ATTENDANCE:VIEW')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAttendanceReport(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestAttribute(required = false) UUID branchId) {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        List<AttendanceLog> todayLogs;
        if (branchId != null) {
            todayLogs = attendanceLogRepository.findByCheckInTimeBetweenAndBranchId(startOfDay, endOfDay, branchId);
        } else {
            todayLogs = attendanceLogRepository.findByCheckInTimeBetweenAndOrganizationId(startOfDay, endOfDay, orgId);
        }

        long totalCheckinsToday = todayLogs.size();
        long activeCheckinsToday = todayLogs.stream()
                .filter(l -> "ACTIVE".equalsIgnoreCase(l.getStatus()))
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCheckinsToday", totalCheckinsToday);
        stats.put("activeCheckinsToday", activeCheckinsToday);
        stats.put("completedCheckinsToday", totalCheckinsToday - activeCheckinsToday);
        stats.put("date", LocalDate.now());

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping("/bulk-checkout")
    @PreAuthorize("hasAuthority('ATTENDANCE:EDIT')")
    public ResponseEntity<ApiResponse<Void>> bulkCheckout(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestAttribute(required = false) UUID branchId) {
        List<AttendanceLog> activeLogs;
        if (branchId != null) {
            activeLogs = attendanceLogRepository.findByBranchId(branchId);
        } else {
            activeLogs = attendanceLogRepository.findByOrganizationId(orgId);
        }
        activeLogs = activeLogs.stream()
                .filter(l -> "ACTIVE".equalsIgnoreCase(l.getStatus()))
                .collect(Collectors.toList());

        LocalDateTime now = LocalDateTime.now();
        for (AttendanceLog log : activeLogs) {
            log.setCheckOutTime(now);
            log.setStatus("COMPLETED");
        }
        attendanceLogRepository.saveAll(activeLogs);

        return ResponseEntity.ok(ApiResponse.success(null, "Bulk check-out completed successfully for " + activeLogs.size() + " logs"));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAuthority('ATTENDANCE:EXPORT')")
    public ResponseEntity<ApiResponse<String>> exportAttendance(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestAttribute(required = false) UUID branchId) {
        StringBuilder csv = new StringBuilder("Log_ID,Entity_Type,Entity_ID,Branch_ID,Check_In,Check_Out,Status,Method\n");
        List<AttendanceLog> logs;
        if (branchId != null) {
            logs = attendanceLogRepository.findByBranchId(branchId);
        } else {
            logs = attendanceLogRepository.findByOrganizationId(orgId);
        }
        for (AttendanceLog log : logs) {
            csv.append(log.getId()).append(",")
               .append(log.getEntityType()).append(",")
               .append(log.getEntityId()).append(",")
               .append(log.getBranchId()).append(",")
               .append(log.getCheckInTime()).append(",")
               .append(log.getCheckOutTime() != null ? log.getCheckOutTime() : "N/A").append(",")
               .append(log.getStatus()).append(",")
               .append(log.getMethod()).append("\n");
        }
        return ResponseEntity.ok(ApiResponse.success(csv.toString()));
    }
}
