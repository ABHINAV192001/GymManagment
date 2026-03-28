package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findTopByEmail(String email);

    Optional<User> findTopByEmailIgnoreCase(String email);

    java.util.List<User> findAllByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByUserCode(String userCode);

    Optional<User> findByEmailOrUsername(String email, String username);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE User u SET u.isActive = true, u.isEmailVerified = true WHERE u.email = :email")
    void updateStatusByEmail(String email);

    java.util.List<User> findByOrganizationId(Long orgId);

    java.util.List<User> findByBranchId(Long branchId);

    long countByBranchId(Long branchId);
}
