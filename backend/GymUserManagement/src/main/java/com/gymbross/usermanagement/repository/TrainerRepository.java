package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainerRepository extends JpaRepository<Trainer, Long> {
    List<Trainer> findByOrganizationId(Long orgId);

    List<Trainer> findByBranchId(Long branchId);

    Optional<Trainer> findByEmail(String email);

    Optional<Trainer> findByUsername(String username);

    Optional<Trainer> findByTrainerCode(String trainerCode);

    Optional<Trainer> findTopByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
