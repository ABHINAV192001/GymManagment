package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.PremiumUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PremiumUserRepository extends JpaRepository<PremiumUser, Long> {
    Optional<PremiumUser> findByEmail(String email);

    Optional<PremiumUser> findByUsername(String username);

    Optional<PremiumUser> findByPremiumCode(String premiumCode);

    Optional<PremiumUser> findTopByEmailIgnoreCase(String email);
}
