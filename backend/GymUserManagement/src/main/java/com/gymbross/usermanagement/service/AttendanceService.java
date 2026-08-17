package com.gymbross.usermanagement.service;

import com.Gym.GymCommonServices.common.PageResponse;
import com.gymbross.usermanagement.dto.AttendanceDtos;

import java.util.UUID;

public interface AttendanceService {

    /**
     * Check in a member or staff member.
     */
    AttendanceDtos.AttendanceLogResponseDto checkIn(AttendanceDtos.CheckInRequestDto request, UUID organizationId);

    /**
     * Process a QR code scan check-in.
     */
    AttendanceDtos.QRScanResponseDto qrScan(AttendanceDtos.QRScanRequestDto request, UUID organizationId);


    /**
     * Check out a member or staff member.
     */
    AttendanceDtos.AttendanceLogResponseDto checkOut(UUID entityId);

    /**
     * Get paginated attendance logs for an organization / branch.
     */
    PageResponse<AttendanceDtos.AttendanceLogResponseDto> getAttendanceLogs(UUID orgId, UUID branchId, int page, int size);

    /**
     * Get today's check-ins for an organization / branch.
     */
    PageResponse<AttendanceDtos.AttendanceLogResponseDto> getTodayCheckins(UUID orgId, UUID branchId, int page, int size);

    /**
     * Get attendance history for a specific user (member).
     */
    PageResponse<AttendanceDtos.AttendanceLogResponseDto> getUserAttendance(UUID userId, int page, int size);

    /**
     * Get attendance history for a specific staff member.
     */
    PageResponse<AttendanceDtos.AttendanceLogResponseDto> getStaffAttendance(UUID staffId, int page, int size);

    /**
     * Get summary metrics for today's attendance.
     */
    AttendanceDtos.AttendanceReportDto getAttendanceReport(UUID orgId, UUID branchId);

    /**
     * Perform end-of-day bulk checkout for all active logs.
     */
    void bulkCheckout(UUID orgId, UUID branchId);

    /**
     * Export attendance data as CSV format.
     */
    String exportAttendanceCsv(UUID orgId, UUID branchId);

    /**
     * Generate a secure D-Day QR token for a branch.
     */
    String generateBranchQr(UUID branchId);

    /**
     * Search attendance with filters.
     */
    PageResponse<AttendanceDtos.AttendanceLogResponseDto> searchAttendance(UUID orgId, UUID branchId, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate, String search, int page, int size);
}
