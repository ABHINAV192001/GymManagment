package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.FoodPortion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodPortionRepository extends JpaRepository<FoodPortion, Long> {
}
