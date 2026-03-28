package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByEmail(String email);

    Optional<Admin> findTopByEmail(String email);

    Optional<Admin> findTopByEmailIgnoreCase(String email);

    java.util.List<Admin> findAllByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<Admin> findByUsername(String username);

    Optional<Admin> findByOrganizationOrgCode(String orgCode);

    Optional<Admin> findByAdminCode(String adminCode);

    Optional<Admin> findTopByBranchId(Long branchId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE Admin a SET a.isActive = true, a.isEmailVerified = true WHERE a.email = :email")
    void updateStatusByEmail(String email);
}
