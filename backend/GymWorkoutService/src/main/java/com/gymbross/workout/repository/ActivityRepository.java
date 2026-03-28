package com.gymbross.workout.repository;

import com.gymbross.workout.entity.Activity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByCategory(String category);
}
