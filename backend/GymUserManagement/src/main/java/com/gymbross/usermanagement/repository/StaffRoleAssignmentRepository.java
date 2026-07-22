package com.gymbross.usermanagement.repository;

import com.gymbross.usermanagement.entity.StaffRoleAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffRoleAssignmentRepository extends JpaRepository<StaffRoleAssignment, UUID> {
    List<StaffRoleAssignment> findByStaffId(UUID staffId);
    Optional<StaffRoleAssignment> findByStaffIdAndRoleId(UUID staffId, UUID roleId);
    List<StaffRoleAssignment> findByRoleId(UUID roleId);
    void deleteByStaffIdAndRoleId(UUID staffId, UUID roleId);
}
