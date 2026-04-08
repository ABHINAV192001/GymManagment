package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findByOrganizationId(Long orgId);

    List<Staff> findByBranchId(Long branchId);

    Optional<Staff> findByEmail(String email);

    Optional<Staff> findByUsername(String username);

    Optional<Staff> findByStaffCode(String staffCode);

    Optional<Staff> findTopByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);
}
