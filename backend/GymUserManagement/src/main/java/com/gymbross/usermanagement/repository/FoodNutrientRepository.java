package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.FoodNutrient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodNutrientRepository extends JpaRepository<FoodNutrient, Long> {
}
