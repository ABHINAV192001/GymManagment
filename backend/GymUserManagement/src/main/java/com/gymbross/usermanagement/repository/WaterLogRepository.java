package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.entity.WaterLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WaterLogRepository extends JpaRepository<WaterLog, Long> {
    List<WaterLog> findByUserAndDate(User user, LocalDate date);
}
