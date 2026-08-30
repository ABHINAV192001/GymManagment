package com.gymbross.duo.repository;

import com.gymbross.duo.entity.DuoChallengeTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DuoChallengeTaskRepository extends JpaRepository<DuoChallengeTask, UUID> {
    List<DuoChallengeTask> findByChallengeId(UUID challengeId);
    List<DuoChallengeTask> findByChallengeIdAndDayIndex(UUID challengeId, Integer dayIndex);
    void deleteByChallengeId(UUID challengeId);
}
