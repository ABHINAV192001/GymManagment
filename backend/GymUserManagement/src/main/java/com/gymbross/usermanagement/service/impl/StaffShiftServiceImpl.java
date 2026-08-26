package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.dto.StaffShiftDto;
import com.gymbross.usermanagement.entity.StaffShift;
import com.gymbross.usermanagement.repository.StaffShiftRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.service.StaffShiftService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaffShiftServiceImpl implements StaffShiftService {

    private final StaffShiftRepository staffShiftRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StaffShiftDto> getShiftsByOrg(UUID orgId) {
        return staffShiftRepository.findByOrgId(orgId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffShiftDto> getShiftsByOrgAndMonth(UUID orgId, int year, int month) {
        return staffShiftRepository.findByOrgIdAndMonth(orgId, year, month)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffShiftDto> getShiftsByOrgAndDateRange(UUID orgId, java.time.LocalDate from, java.time.LocalDate to) {
        java.time.LocalDateTime fromDt = from.atStartOfDay();
        java.time.LocalDateTime toDt = to.plusDays(1).atStartOfDay(); // inclusive end
        return staffShiftRepository.findByOrgIdAndDateRange(orgId, fromDt, toDt)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffShiftDto> getShiftsByBranch(UUID branchId) {
        return staffShiftRepository.findByBranchId(branchId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffShiftDto> getShiftsByStaff(UUID staffId) {
        return staffShiftRepository.findByStaffId(staffId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StaffShiftDto createShift(StaffShiftDto.CreateRequest request) {
        User staffUser = null;
        UUID branchId = request.getBranchId();
        UUID orgId = request.getOrgId();

        if (request.getStaff() != null && request.getStaff().getId() != null) {
            staffUser = userRepository.findById(request.getStaff().getId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Staff user not found with id: " + request.getStaff().getId()));

            if (branchId == null && staffUser.getBranch() != null) {
                branchId = staffUser.getBranch().getId();
            }
            if (orgId == null && staffUser.getOrganization() != null) {
                orgId = staffUser.getOrganization().getId();
            }
        }

        StaffShift shift = StaffShift.builder()
                .staff(staffUser)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .taskDescription(request.getTaskDescription())
                .branchId(branchId)
                .orgId(orgId)
                .build();

        StaffShift saved = staffShiftRepository.save(shift);
        // Re-fetch with all lazy associations loaded inside the same transaction
        return staffShiftRepository.findByIdWithDetails(saved.getId())
                .map(this::toDto)
                .orElseGet(() -> toDto(saved));
    }

    @Override
    @Transactional
    public StaffShiftDto updateShift(UUID id, StaffShiftDto.CreateRequest request) {
        StaffShift shift = staffShiftRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Shift not found with id: " + id));

        if (request.getStaff() != null && request.getStaff().getId() != null) {
            User staffUser = userRepository.findById(request.getStaff().getId()).orElse(null);
            if (staffUser != null) {
                shift.setStaff(staffUser);
                if (request.getBranchId() == null && staffUser.getBranch() != null) {
                    shift.setBranchId(staffUser.getBranch().getId());
                }
            }
        }
        if (request.getBranchId() != null) {
            shift.setBranchId(request.getBranchId());
        }
        if (request.getStartTime() != null) {
            shift.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            shift.setEndTime(request.getEndTime());
        }
        if (request.getTaskDescription() != null) {
            shift.setTaskDescription(request.getTaskDescription());
        }

        StaffShift updated = staffShiftRepository.save(shift);
        return toDto(updated);
    }

    @Override
    @Transactional
    public void deleteShift(UUID id) {
        if (staffShiftRepository.existsById(id)) {
            staffShiftRepository.deleteById(id);
        }
    }

    // -------------------------------------------------------------------------
    // Private mapping — safe to call inside a transaction
    // -------------------------------------------------------------------------

    private StaffShiftDto toDto(StaffShift shift) {
        if (shift == null) return null;

        StaffShiftDto.StaffSummary staffSummary = null;
        if (shift.getStaff() != null) {
            User u = shift.getStaff();

            StaffShiftDto.BranchSummary branchSummary = null;
            if (u.getBranch() != null) {
                branchSummary = StaffShiftDto.BranchSummary.builder()
                        .id(u.getBranch().getId())
                        .name(u.getBranch().getName())
                        .build();
            }

            staffSummary = StaffShiftDto.StaffSummary.builder()
                    .id(u.getId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .phone(u.getPhone())
                    .userCode(u.getUserCode())
                    .staffCode(u.getStaffCode())   // safe: staffProfile fetched via findByIdWithDetails
                    .role(u.getRole())             // safe: roles is FetchType.EAGER
                    .branch(branchSummary)
                    .build();
        }

        return StaffShiftDto.builder()
                .id(shift.getId())
                .staff(staffSummary)
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .taskDescription(shift.getTaskDescription())
                .orgId(shift.getOrgId())
                .branchId(shift.getBranchId())
                .createdAt(shift.getCreatedAt())
                .build();
    }
}
