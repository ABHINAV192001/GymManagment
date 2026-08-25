package com.gymbross.workout.repository;

import com.Gym.GymCommonServices.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, java.util.UUID> {
    Optional<Exercise> findByName(String name);

    List<Exercise> findByMuscleGroupIgnoreCase(String muscleGroup);

    @Query("SELECT e FROM Exercise e WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.muscleGroup) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.equipment) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Exercise> searchExercises(@Param("query") String query);
}
