package com.gymbross.workout.repository;

import com.gymbross.workout.entity.WorkoutHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutHistoryRepository extends JpaRepository<WorkoutHistory, java.util.UUID> {
    List<WorkoutHistory> findByUserId(java.util.UUID userId);
}
