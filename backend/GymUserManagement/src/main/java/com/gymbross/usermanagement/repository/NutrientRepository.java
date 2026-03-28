package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.Nutrient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NutrientRepository extends JpaRepository<Nutrient, Long> {
    Optional<Nutrient> findByNutrientNumber(String nutrientNumber);
}
