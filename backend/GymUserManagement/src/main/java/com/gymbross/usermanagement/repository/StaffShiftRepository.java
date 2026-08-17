package com.gymbross.usermanagement.repository;

import com.gymbross.usermanagement.entity.StaffShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface StaffShiftRepository extends JpaRepository<StaffShift, UUID> {
    List<StaffShift> findByOrgId(UUID orgId);
    List<StaffShift> findByBranchId(UUID branchId);
    List<StaffShift> findByStaffId(UUID staffId);
    List<StaffShift> findByStaffIdAndStartTimeBetween(UUID staffId, LocalDateTime start, LocalDateTime end);
}
