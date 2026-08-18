package com.gymbross.workout.repository;

import com.Gym.GymCommonServices.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, java.util.UUID> {
    List<Workout> findByCategory(String category);
    List<Workout> findByCreatedByUserId(java.util.UUID createdByUserId);
}
