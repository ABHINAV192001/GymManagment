package com.gymbross.chatservice.repository;

import com.Gym.GymCommonServices.entity.SessionVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SessionVoteRepository extends JpaRepository<SessionVote, java.util.UUID> {
    Optional<SessionVote> findBySessionIdAndUsername(java.util.UUID sessionId, String username);
}
