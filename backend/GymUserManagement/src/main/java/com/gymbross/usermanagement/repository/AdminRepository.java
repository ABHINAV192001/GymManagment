package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<User, java.util.UUID> {
    Optional<User> findByEmail(String email);

    Optional<User> findTopByEmail(String email);

    Optional<User> findTopByEmailIgnoreCase(String email);

    java.util.List<User> findAllByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByOrganizationOrgCode(String orgCode);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.userCode = :adminCode")
    Optional<User> findByAdminCode(@org.springframework.data.repository.query.Param("adminCode") String adminCode);

    Optional<User> findTopByBranchId(java.util.UUID branchId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE User a SET a.isActive = true, a.isEmailVerified = true WHERE a.email = :email")
    void updateStatusByEmail(String email);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE User a SET a.passwordHash = :password WHERE LOWER(a.email) = LOWER(:email)")
    void updatePasswordByEmail(String email, String password);
}
