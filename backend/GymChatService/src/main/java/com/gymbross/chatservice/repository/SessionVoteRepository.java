package com.gymbross.chatservice.repository;

import com.Gym.GymCommonServices.entity.SessionVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SessionVoteRepository extends JpaRepository<SessionVote, Long> {
    Optional<SessionVote> findBySessionIdAndUsername(Long sessionId, String username);
}
