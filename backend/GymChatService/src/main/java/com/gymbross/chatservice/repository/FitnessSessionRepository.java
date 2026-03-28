package com.gymbross.chatservice.repository;

import com.Gym.GymCommonServices.entity.FitnessSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FitnessSessionRepository extends JpaRepository<FitnessSession, Long> {
}
