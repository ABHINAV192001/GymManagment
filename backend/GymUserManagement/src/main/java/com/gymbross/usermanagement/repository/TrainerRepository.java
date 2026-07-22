package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainerRepository extends JpaRepository<User, java.util.UUID> {
    List<User> findByOrganizationId(java.util.UUID orgId);

    List<User> findByBranchId(java.util.UUID branchId);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.userCode = :trainerCode")
    Optional<User> findByTrainerCode(@org.springframework.data.repository.query.Param("trainerCode") String trainerCode);

    Optional<User> findTopByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE User t SET t.passwordHash = :password WHERE LOWER(t.email) = LOWER(:email)")
    void updatePasswordByEmail(String email, String password);
}
