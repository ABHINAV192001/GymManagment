package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.dto.StaffShiftDto;

import java.util.List;
import java.util.UUID;

public interface StaffShiftService {

    List<StaffShiftDto> getShiftsByOrg(UUID orgId);

    List<StaffShiftDto> getShiftsByOrgAndMonth(UUID orgId, int year, int month);

    List<StaffShiftDto> getShiftsByOrgAndDateRange(UUID orgId, java.time.LocalDate from, java.time.LocalDate to);

    List<StaffShiftDto> getShiftsByBranch(UUID branchId);

    List<StaffShiftDto> getShiftsByStaff(UUID staffId);

    StaffShiftDto createShift(StaffShiftDto.CreateRequest request);

    StaffShiftDto updateShift(UUID id, StaffShiftDto.CreateRequest request);

    void deleteShift(UUID id);
}
