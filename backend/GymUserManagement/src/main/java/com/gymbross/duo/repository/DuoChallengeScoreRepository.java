package com.gymbross.duo.repository;

import com.gymbross.duo.entity.DuoChallengeScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DuoChallengeScoreRepository extends JpaRepository<DuoChallengeScore, UUID> {

    List<DuoChallengeScore> findByChallengeId(UUID challengeId);

    Optional<DuoChallengeScore> findByChallengeIdAndUserId(UUID challengeId, UUID userId);

    void deleteByChallengeId(UUID challengeId);

    @Query("""
        SELECT dcs FROM DuoChallengeScore dcs
        WHERE dcs.challenge.id = :challengeId
        ORDER BY dcs.totalPoints DESC, dcs.currentStreak DESC
    """)
    List<DuoChallengeScore> findLeaderboardForChallenge(@Param("challengeId") UUID challengeId);
}
