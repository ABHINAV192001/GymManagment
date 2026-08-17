package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.common.PageResponse;
import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.dto.AttendanceDtos;
import com.gymbross.usermanagement.entity.AttendanceLog;
import com.gymbross.usermanagement.repository.AttendanceLogRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

import com.gymbross.usermanagement.repository.BranchRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceLogRepository attendanceLogRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final com.gymbross.usermanagement.service.EmailService emailService;

    @Override
    public AttendanceDtos.AttendanceLogResponseDto checkIn(AttendanceDtos.CheckInRequestDto request, UUID organizationId) {
        if (request.getEntityId() == null) {
            throw new IllegalArgumentException("Entity ID is required for check-in");
        }

        // Check if entity is already checked in
        Optional<AttendanceLog> activeLog = attendanceLogRepository
                .findFirstByEntityIdAndStatusOrderByCheckInTimeDesc(request.getEntityId(), "ACTIVE");
        if (activeLog.isPresent()) {
            throw new IllegalArgumentException("User or Staff is already checked in");
        }

        String entityType = request.getEntityType() != null ? request.getEntityType().toUpperCase() : "USER";
        String method = request.getMethod() != null ? request.getMethod().toUpperCase() : "MANUAL";

        UUID effectiveOrgId = organizationId;
        UUID effectiveBranchId = request.getBranchId();

        User user = null;
        if (request.getEntityId() != null) {
            user = userRepository.findById(request.getEntityId()).orElse(null);
        }

        if (user != null) {
            if (effectiveOrgId == null && user.getOrganization() != null) {
                effectiveOrgId = user.getOrganization().getId();
            }
            if (effectiveBranchId == null && user.getBranch() != null) {
                effectiveBranchId = user.getBranch().getId();
            }

            // Legal Branch Access Control: User must be registered at effectiveBranchId or have accessible branch permissions
            if (effectiveBranchId != null && user.getBranch() != null) {
                UUID homeBranchId = user.getBranch().getId();
                List<UUID> accessibleBranches = user.getAccessibleBranchUUIDs();
                boolean isHomeBranch = homeBranchId.equals(effectiveBranchId);
                boolean hasAccess = isHomeBranch || (accessibleBranches != null && accessibleBranches.contains(effectiveBranchId));
                if (!hasAccess) {
                    String homeBranchName = user.getBranch().getName() != null ? user.getBranch().getName() : "assigned branch";
                    throw new IllegalArgumentException("Access Denied: Member is registered at '" + homeBranchName + "' and does not have permission to check in at this branch.");
                }
            }
        }

        if (effectiveOrgId == null) {
            throw new IllegalArgumentException("Organization ID is required for check-in");
        }

        AttendanceLog newLog = AttendanceLog.builder()
                .orgId(effectiveOrgId)
                .entityType(entityType)
                .entityId(request.getEntityId())
                .userId(request.getEntityId())
                .branchId(effectiveBranchId)
                .checkInTime(LocalDateTime.now())
                .method(method)
                .status("ACTIVE")
                .build();

        AttendanceLog savedLog = attendanceLogRepository.save(newLog);

        // Update attendance count if user
        if ("USER".equalsIgnoreCase(entityType) && user != null) {
            Integer currentCount = user.getAttendanceCount() != null ? user.getAttendanceCount() : 0;
            user.setAttendanceCount(currentCount + 1);
            userRepository.save(user);
        }

        return mapToResponseDto(savedLog);
    }

    @Override
    public AttendanceDtos.QRScanResponseDto qrScan(AttendanceDtos.QRScanRequestDto request, UUID organizationId) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required for QR scan");
        }
        if (request.getQrData() == null || request.getQrData().isBlank()) {
            throw new IllegalArgumentException("QR Data token is required");
        }

        UUID effectiveBranchId = request.getBranchId();
        
        // Parse the qrData token
        try {
            String decoded = new String(Base64.getDecoder().decode(request.getQrData()));
            String[] parts = decoded.split("\\|");
            if (parts.length < 2) throw new IllegalArgumentException("Invalid QR format");
            
            UUID tokenBranchId = UUID.fromString(parts[0]);
            String tokenDate = parts[1];
            
            if (!LocalDate.now().toString().equals(tokenDate)) {
                throw new IllegalArgumentException("QR Code has expired. Please use today's QR code.");
            }
            
            // Override with token branch ID
            effectiveBranchId = tokenBranchId;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid or expired QR token.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (effectiveBranchId == null && user.getBranch() != null) {
            effectiveBranchId = user.getBranch().getId();
        }

        // Branch access validation
        if (effectiveBranchId != null && user.getBranch() != null) {
            UUID homeBranchId = user.getBranch().getId();
            List<UUID> accessibleBranches = user.getAccessibleBranchUUIDs();
            boolean isHomeBranch = homeBranchId.equals(effectiveBranchId);
            boolean hasAccess = isHomeBranch || (accessibleBranches != null && accessibleBranches.contains(effectiveBranchId));
            if (!hasAccess) {
                String homeBranchName = user.getBranch().getName() != null ? user.getBranch().getName() : "assigned branch";
                throw new IllegalArgumentException("Access Denied: Member is registered at '" + homeBranchName + "' and does not have permission to check in at this branch.");
            }
        }

        // Check if already marked for today
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        List<AttendanceLog> todayLogs = attendanceLogRepository.findByCheckInTimeBetweenAndOrgId(startOfDay, endOfDay, organizationId);
        boolean alreadyScannedToday = todayLogs.stream()
                .anyMatch(log -> log.getEntityId() != null && log.getEntityId().equals(request.getUserId()));

        if (alreadyScannedToday) {
            throw new IllegalArgumentException("Attendance already marked for today");
        }

        // Calculate Streak (did they visit yesterday?)
        LocalDateTime startOfYesterday = startOfDay.minusDays(1);
        LocalDateTime endOfYesterday = endOfDay.minusDays(1);
        List<AttendanceLog> yesterdayLogs = attendanceLogRepository.findByCheckInTimeBetweenAndOrgId(startOfYesterday, endOfYesterday, organizationId);
        boolean visitedYesterday = yesterdayLogs.stream()
                .anyMatch(log -> log.getEntityId() != null && log.getEntityId().equals(request.getUserId()));

        int streakGained = visitedYesterday ? 1 : 0;

        // Perform Check-In
        AttendanceLog newLog = AttendanceLog.builder()
                .orgId(organizationId)
                .entityType("USER")
                .entityId(request.getUserId())
                .userId(request.getUserId())
                .branchId(effectiveBranchId)
                .checkInTime(LocalDateTime.now())
                .method("QR")
                .status("COMPLETED") // Automatically complete or leave ACTIVE? Requirements didn't specify check-out for QR. We'll mark it ACTIVE for now to match normal check-in behavior.
                .build();
        newLog.setStatus("ACTIVE");

        attendanceLogRepository.save(newLog);

        Integer currentCount = user.getAttendanceCount() != null ? user.getAttendanceCount() : 0;
        int newTotalStreak = currentCount + streakGained; // Or just tracking visits
        user.setAttendanceCount(currentCount + 1); // increment visit count anyway
        userRepository.save(user);

        // Membership tracking
        Long daysLeft = null;
        if (user.getMemberProfile() != null && user.getMemberProfile().getMembershipEndDate() != null) {
            LocalDate endDate = user.getMemberProfile().getMembershipEndDate();
            daysLeft = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), endDate);
            if (daysLeft < 0) daysLeft = 0L;
        }

        // Email Notification
        emailService.sendAttendanceNotification(
                user.getEmail(), 
                user.getName(), 
                newLog.getCheckInTime(), 
                daysLeft, 
                streakGained
        );

        return AttendanceDtos.QRScanResponseDto.builder()
                .success(true)
                .message("Attendance successfully marked!")
                .checkInTime(newLog.getCheckInTime())
                .streakGained(streakGained)
                .totalStreak(newTotalStreak)
                .daysLeftOnMembership(daysLeft)
                .build();
    }

    @Override
    public AttendanceDtos.AttendanceLogResponseDto checkOut(UUID entityId) {
        if (entityId == null) {
            throw new IllegalArgumentException("Entity ID is required for check-out");
        }

        AttendanceLog activeLog = attendanceLogRepository
                .findFirstByEntityIdAndStatusOrderByCheckInTimeDesc(entityId, "ACTIVE")
                .orElseThrow(() -> new IllegalArgumentException("No active check-in found for this entity"));

        activeLog.setCheckOutTime(LocalDateTime.now());
        activeLog.setStatus("COMPLETED");
        AttendanceLog savedLog = attendanceLogRepository.save(activeLog);

        return mapToResponseDto(savedLog);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AttendanceDtos.AttendanceLogResponseDto> getAttendanceLogs(UUID orgId, UUID branchId, int page, int size) {
        List<AttendanceLog> logs;
        if (branchId != null) {
            logs = attendanceLogRepository.findByBranchId(branchId);
        } else {
            logs = attendanceLogRepository.findByOrgId(orgId);
        }
        return paginateAndMap(logs, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AttendanceDtos.AttendanceLogResponseDto> getTodayCheckins(UUID orgId, UUID branchId, int page, int size) {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        List<AttendanceLog> logs;
        if (branchId != null) {
            logs = attendanceLogRepository.findByCheckInTimeBetweenAndBranchId(startOfDay, endOfDay, branchId);
        } else {
            logs = attendanceLogRepository.findByCheckInTimeBetweenAndOrgId(startOfDay, endOfDay, orgId);
        }
        return paginateAndMap(logs, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AttendanceDtos.AttendanceLogResponseDto> getUserAttendance(UUID userId, int page, int size) {
        List<AttendanceLog> logs = attendanceLogRepository.findByEntityIdOrderByCheckInTimeDesc(userId);
        return paginateAndMap(logs, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AttendanceDtos.AttendanceLogResponseDto> getStaffAttendance(UUID staffId, int page, int size) {
        List<AttendanceLog> logs = attendanceLogRepository.findByEntityIdOrderByCheckInTimeDesc(staffId);
        return paginateAndMap(logs, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceDtos.AttendanceReportDto getAttendanceReport(UUID orgId, UUID branchId) {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        List<AttendanceLog> todayLogs;
        if (branchId != null) {
            todayLogs = attendanceLogRepository.findByCheckInTimeBetweenAndBranchId(startOfDay, endOfDay, branchId);
        } else {
            todayLogs = attendanceLogRepository.findByCheckInTimeBetweenAndOrgId(startOfDay, endOfDay, orgId);
        }

        long totalCheckinsToday = todayLogs.size();
        long activeCheckinsToday = todayLogs.stream()
                .filter(l -> "ACTIVE".equalsIgnoreCase(l.getStatus()))
                .count();

        return AttendanceDtos.AttendanceReportDto.builder()
                .totalCheckinsToday(totalCheckinsToday)
                .activeCheckinsToday(activeCheckinsToday)
                .completedCheckinsToday(totalCheckinsToday - activeCheckinsToday)
                .date(LocalDate.now())
                .build();
    }

    @Override
    public void bulkCheckout(UUID orgId, UUID branchId) {
        List<AttendanceLog> activeLogs;
        if (branchId != null) {
            activeLogs = attendanceLogRepository.findByBranchId(branchId);
        } else {
            activeLogs = attendanceLogRepository.findByOrgId(orgId);
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
    }

    @Override
    @Transactional(readOnly = true)
    public String exportAttendanceCsv(UUID orgId, UUID branchId) {
        StringBuilder csv = new StringBuilder("Log_ID,Entity_Type,Entity_ID,Branch_ID,Check_In,Check_Out,Status,Method\n");
        List<AttendanceLog> logs;
        if (branchId != null) {
            logs = attendanceLogRepository.findByBranchId(branchId);
        } else {
            logs = attendanceLogRepository.findByOrgId(orgId);
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
        return csv.toString();
    }

    @Override
    public String generateBranchQr(UUID branchId) {
        if (branchId == null) {
            throw new IllegalArgumentException("Branch ID is required to generate QR");
        }
        String today = LocalDate.now().toString();
        String raw = branchId.toString() + "|" + today;
        return Base64.getEncoder().encodeToString(raw.getBytes());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AttendanceDtos.AttendanceLogResponseDto> searchAttendance(UUID orgId, UUID branchId, LocalDateTime startDate, LocalDateTime endDate, String search, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "checkInTime"));
        
        org.springframework.data.domain.Page<AttendanceLog> resultPage = attendanceLogRepository.searchLogs(
            orgId,
            branchId,
            startDate,
            endDate,
            (search != null && !search.isBlank()) ? search : null,
            pageable
        );

        List<AttendanceDtos.AttendanceLogResponseDto> pageContent = resultPage.getContent().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        PageResponse.Pagination paginationInfo = PageResponse.Pagination.builder()
                .page(page)
                .size(size)
                .totalElements((int) resultPage.getTotalElements())
                .totalPages(resultPage.getTotalPages())
                .hasNext(resultPage.hasNext())
                .hasPrev(resultPage.hasPrevious())
                .build();

        return PageResponse.<AttendanceDtos.AttendanceLogResponseDto>builder()
                .success(true)
                .data(pageContent)
                .pagination(paginationInfo)
                .build();
    }

    private PageResponse<AttendanceDtos.AttendanceLogResponseDto> paginateAndMap(List<AttendanceLog> logs, int page, int size) {
        if (logs == null) logs = Collections.emptyList();
        int totalElements = logs.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        if (totalPages == 0) totalPages = 1;
        int start = Math.min(page * size, totalElements);
        int end = Math.min(start + size, totalElements);

        List<AttendanceDtos.AttendanceLogResponseDto> pageContent = logs.subList(start, end)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        PageResponse.Pagination paginationInfo = PageResponse.Pagination.builder()
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .hasNext(page < totalPages - 1)
                .hasPrev(page > 0)
                .build();

        return PageResponse.<AttendanceDtos.AttendanceLogResponseDto>builder()
                .success(true)
                .data(pageContent)
                .pagination(paginationInfo)
                .build();
    }

    private AttendanceDtos.AttendanceLogResponseDto mapToResponseDto(AttendanceLog log) {
        String entityName = null;
        String entityCode = null;

        if (log.getEntityId() != null) {
            Optional<User> uOpt = userRepository.findById(log.getEntityId());
            if (uOpt.isPresent()) {
                User u = uOpt.get();
                entityName = u.getName();
                entityCode = u.getUserCode();
            }
        }

        String branchName = null;
        if (log.getBranchId() != null) {
            com.Gym.GymCommonServices.entity.Branch b = branchRepository.findById(log.getBranchId()).orElse(null);
            if (b != null) {
                branchName = b.getName();
            }
        }

        return AttendanceDtos.AttendanceLogResponseDto.builder()
                .id(log.getId())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .branchId(log.getBranchId())
                .branchName(branchName)
                .entityName(entityName)
                .entityCode(entityCode)
                .checkInTime(log.getCheckInTime())
                .checkOutTime(log.getCheckOutTime())
                .method(log.getMethod())
                .status(log.getStatus())
                .build();
    }
}
