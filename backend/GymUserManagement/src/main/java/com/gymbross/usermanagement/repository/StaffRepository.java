package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<User, java.util.UUID> {
    List<User> findByOrganizationId(java.util.UUID orgId);

    List<User> findByBranchId(java.util.UUID branchId);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.userCode = :staffCode")
    Optional<User> findByStaffCode(@org.springframework.data.repository.query.Param("staffCode") String staffCode);

    Optional<User> findTopByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE User s SET s.passwordHash = :password WHERE LOWER(s.email) = LOWER(:email)")
    void updatePasswordByEmail(String email, String password);

    @Query("SELECT SUM(s.staffProfile.salary) FROM User s WHERE s.organization.id = :organizationId AND (:branchId IS NULL OR s.branch.id = :branchId)")
    java.math.BigDecimal sumSalaryByOrgAndBranch(@org.springframework.data.repository.query.Param("organizationId") java.util.UUID organizationId, @org.springframework.data.repository.query.Param("branchId") java.util.UUID branchId);
}
