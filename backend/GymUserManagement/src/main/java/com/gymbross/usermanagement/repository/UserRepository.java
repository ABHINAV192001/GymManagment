package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, java.util.UUID> {
    Optional<User> findByEmail(String email);

    Optional<User> findTopByEmail(String email);

    Optional<User> findTopByEmailIgnoreCase(String email);

    java.util.List<User> findAllByEmail(String email);

    Optional<User> findTopByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByUserCode(String userCode);

    Optional<User> findByEmailOrUsername(String email, String username);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.memberProfile.plan.name = :planName")
    java.util.List<User> findByPlanName(@org.springframework.data.repository.query.Param("planName") String planName);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(u.staffProfile.salary) FROM User u WHERE u.organization.id = :orgId AND (:branchId IS NULL OR u.branch.id = :branchId)")
    java.math.BigDecimal sumSalaryByOrgAndBranch(@org.springframework.data.repository.query.Param("orgId") java.util.UUID orgId, @org.springframework.data.repository.query.Param("branchId") java.util.UUID branchId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE User u SET u.isActive = true, u.isEmailVerified = true WHERE u.email = :email")
    void updateStatusByEmail(String email);

    java.util.List<User> findByOrganizationId(java.util.UUID orgId);

    java.util.List<User> findByBranchId(java.util.UUID branchId);

    long countByBranchId(java.util.UUID branchId);

    Optional<User> findTopByBranchId(java.util.UUID branchId);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT u FROM User u LEFT JOIN u.roles r WHERE u.branch.id IN :branchIds AND (r.name IN :roleNames OR u.roles IS EMPTY)")
    java.util.List<User> findByBranchIdInAndRoleNamesIn(@org.springframework.data.repository.query.Param("branchIds") java.util.List<java.util.UUID> branchIds, @org.springframework.data.repository.query.Param("roleNames") java.util.List<String> roleNames);
}
