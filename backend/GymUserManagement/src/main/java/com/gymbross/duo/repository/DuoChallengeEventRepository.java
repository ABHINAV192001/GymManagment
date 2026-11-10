package com.gymbross.duo.repository;

import com.gymbross.duo.entity.DuoChallengeEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DuoChallengeEventRepository extends JpaRepository<DuoChallengeEvent, UUID> {

    List<DuoChallengeEvent> findByChallengeIdOrderByCreatedAtDesc(UUID challengeId);

    List<DuoChallengeEvent> findTop20ByChallengeIdOrderByCreatedAtDesc(UUID challengeId);

    void deleteByChallengeId(UUID challengeId);

    @org.springframework.data.jpa.repository.Query("""
        SELECT COUNT(e) > 0 FROM DuoChallengeEvent e
        WHERE e.challenge.id = :challengeId
          AND e.user.id = :userId
          AND e.eventType = :eventType
          AND e.createdAt >= :startOfDay
    """)
    boolean hasLoggedEventToday(
        @org.springframework.data.repository.query.Param("challengeId") UUID challengeId,
        @org.springframework.data.repository.query.Param("userId") UUID userId,
        @org.springframework.data.repository.query.Param("eventType") String eventType,
        @org.springframework.data.repository.query.Param("startOfDay") java.time.OffsetDateTime startOfDay
    );
}
