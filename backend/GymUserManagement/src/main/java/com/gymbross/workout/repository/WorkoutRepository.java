package com.gymbross.workout.repository;

import com.Gym.GymCommonServices.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, UUID> {

    /**
     * Fetch all workouts with their splitDays eagerly in a single JOIN FETCH.
     * NOTE: Only one @OneToMany bag can be JOIN FETCHed at a time in JPQL.
     * workoutExercises are accessed lazily within the @Transactional service boundary.
     */
    @Query("SELECT DISTINCT w FROM Workout w LEFT JOIN FETCH w.splitDays sd ORDER BY w.title ASC")
    List<Workout> findAllWithSplitDays();

    /**
     * Fetch workouts by category with splitDays eagerly loaded.
     */
    @Query("SELECT DISTINCT w FROM Workout w LEFT JOIN FETCH w.splitDays sd WHERE w.category = :category ORDER BY w.title ASC")
    List<Workout> findByCategoryWithSplitDays(@Param("category") String category);

    /**
     * Fetch workouts created by a specific user with splitDays eagerly loaded.
     */
    @Query("SELECT DISTINCT w FROM Workout w LEFT JOIN FETCH w.splitDays sd WHERE w.createdByUserId = :userId ORDER BY w.title ASC")
    List<Workout> findByCreatedByUserIdWithSplitDays(@Param("userId") UUID userId);

    // Keep original methods for backward compatibility
    List<Workout> findByCategory(String category);
    List<Workout> findByCreatedByUserId(UUID createdByUserId);
    @Query("SELECT DISTINCT w FROM Workout w LEFT JOIN w.workoutExercises we LEFT JOIN we.exercise e WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(w.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(w.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(w.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(e IS NOT NULL AND (LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.muscleGroup) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.equipment) LIKE LOWER(CONCAT('%', :query, '%')))))")
    Page<Workout> searchByTitle(@Param("query") String query, Pageable pageable);
}

