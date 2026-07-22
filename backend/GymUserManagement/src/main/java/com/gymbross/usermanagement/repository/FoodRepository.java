package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodRepository extends JpaRepository<Food, java.util.UUID> {

        java.util.List<Food> findByFoodNameContainingIgnoreCase(String foodName);

}
