package com.gymbross.usermanagement.repository;

import com.gymbross.usermanagement.entity.FoodLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.Gym.GymCommonServices.entity.User;
import java.time.LocalDate;
import java.util.List;

public interface FoodLogRepository extends JpaRepository<FoodLog, Long> {
    List<FoodLog> findByUserAndDate(User user, LocalDate date);
}
