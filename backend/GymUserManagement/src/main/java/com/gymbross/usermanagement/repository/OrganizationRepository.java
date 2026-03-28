package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByOwnerEmail(String ownerEmail);

    Optional<Organization> findTopByOwnerEmail(String ownerEmail);

    java.util.List<Organization> findAllByOwnerEmail(String ownerEmail);

    boolean existsByOwnerEmail(String ownerEmail);

    boolean existsByOwnerEmailIgnoreCase(String ownerEmail);

    Optional<Organization> findTopByOwnerEmailIgnoreCase(String ownerEmail);

    Optional<Organization> findByName(String name);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE Organization o SET o.isEmailVerified = true, o.isActive = true WHERE o.ownerEmail = :email")
    void updateStatusByEmail(String email);
}
