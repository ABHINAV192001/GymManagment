package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.common.PageResponse;
import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.dto.AttendanceDtos;
import com.gymbross.usermanagement.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/checkin")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AttendanceDtos.AttendanceLogResponseDto>> checkIn(
            @RequestBody AttendanceDtos.CheckInRequestDto request,
            @RequestAttribute(value = "organizationId", required = false) UUID orgId) {
        AttendanceDtos.AttendanceLogResponseDto response = attendanceService.checkIn(request, orgId);
        return ResponseEntity.ok(ApiResponse.success(response, "Check-in successful"));
    }

    @PostMapping("/qr-scan")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AttendanceDtos.QRScanResponseDto>> qrScan(
            @RequestBody AttendanceDtos.QRScanRequestDto request,
            @RequestAttribute(value = "organizationId", required = false) UUID orgId) {
        AttendanceDtos.QRScanResponseDto response = attendanceService.qrScan(request, orgId);
        return ResponseEntity.ok(ApiResponse.success(response, "QR Attendance successfully marked"));
    }

    @PostMapping("/checkout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AttendanceDtos.AttendanceLogResponseDto>> checkOut(@RequestParam UUID entityId) {
        AttendanceDtos.AttendanceLogResponseDto response = attendanceService.checkOut(entityId);
        return ResponseEntity.ok(ApiResponse.success(response, "Check-out successful"));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ATTENDANCE:VIEW') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ORG_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<AttendanceDtos.AttendanceLogResponseDto>>> getAttendanceLogs(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestAttribute(required = false) UUID branchId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        PageResponse<AttendanceDtos.AttendanceLogResponseDto> logs = attendanceService.getAttendanceLogs(orgId, branchId, page, size);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/today")
    @PreAuthorize("hasAuthority('ATTENDANCE:VIEW') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ORG_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<AttendanceDtos.AttendanceLogResponseDto>>> getTodayCheckins(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestAttribute(required = false) UUID branchId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        PageResponse<AttendanceDtos.AttendanceLogResponseDto> logs = attendanceService.getTodayCheckins(orgId, branchId, page, size);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/branch-qr/{branchId}")
    @PreAuthorize("hasAuthority('ATTENDANCE:VIEW') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ORG_ADMIN')")
    public ResponseEntity<ApiResponse<String>> generateBranchQr(@PathVariable UUID branchId) {
        String qrData = attendanceService.generateBranchQr(branchId);
        return ResponseEntity.ok(ApiResponse.success(qrData, "QR generated successfully"));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('ATTENDANCE:VIEW') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ORG_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<AttendanceDtos.AttendanceLogResponseDto>>> searchAttendance(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime endDate,
            @RequestParam(required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        PageResponse<AttendanceDtos.AttendanceLogResponseDto> logs = attendanceService.searchAttendance(orgId, branchId, startDate, endDate, search, page, size);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<AttendanceDtos.AttendanceLogResponseDto>>> getUserAttendance(
            @PathVariable UUID userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        PageResponse<AttendanceDtos.AttendanceLogResponseDto> logs = attendanceService.getUserAttendance(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<AttendanceDtos.AttendanceLogResponseDto>>> getStaffAttendance(
            @PathVariable UUID staffId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        PageResponse<AttendanceDtos.AttendanceLogResponseDto> logs = attendanceService.getStaffAttendance(staffId, page, size);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/report")
    @PreAuthorize("hasAuthority('ATTENDANCE:VIEW') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ORG_ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceDtos.AttendanceReportDto>> getAttendanceReport(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestAttribute(required = false) UUID branchId) {
        AttendanceDtos.AttendanceReportDto report = attendanceService.getAttendanceReport(orgId, branchId);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @PostMapping("/bulk-checkout")
    @PreAuthorize("hasAuthority('ATTENDANCE:EDIT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ORG_ADMIN')")
    public ResponseEntity<ApiResponse<String>> bulkCheckout(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestAttribute(required = false) UUID branchId) {
        attendanceService.bulkCheckout(orgId, branchId);
        return ResponseEntity.ok(ApiResponse.success("Bulk check-out completed successfully"));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAuthority('ATTENDANCE:EXPORT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_ORG_ADMIN')")
    public ResponseEntity<ApiResponse<String>> exportAttendance(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestAttribute(required = false) UUID branchId) {
        String csvData = attendanceService.exportAttendanceCsv(orgId, branchId);
        return ResponseEntity.ok(ApiResponse.success(csvData));
    }
}
