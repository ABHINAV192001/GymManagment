package com.gymbross.duo.repository;

import com.gymbross.duo.entity.ChallengeStatus;
import com.gymbross.duo.entity.DuoChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DuoChallengeRepository extends JpaRepository<DuoChallenge, UUID> {

    @Query("""
        SELECT dc FROM DuoChallenge dc
        WHERE dc.organization.id = :orgId
          AND dc.partnership.id = :partnershipId
          AND dc.status = :status
    """)
    List<DuoChallenge> findByPartnershipAndStatus(
        @Param("orgId") UUID orgId,
        @Param("partnershipId") UUID partnershipId,
        @Param("status") ChallengeStatus status
    );

    @Query("""
        SELECT DISTINCT dc FROM DuoChallenge dc
        WHERE dc.organization.id = :orgId
          AND dc.status = 'ACTIVE'
          AND (
              dc.creator.id = :userId
           OR EXISTS (SELECT 1 FROM DuoChallengeScore dcs WHERE dcs.challenge = dc AND dcs.user.id = :userId)
          )
        ORDER BY dc.createdAt DESC
    """)
    List<DuoChallenge> findActiveChallengesForUser(
        @Param("orgId") UUID orgId,
        @Param("userId") UUID userId
    );

    @Query("""
        SELECT dc FROM DuoChallenge dc
        WHERE dc.id = :id AND dc.organization.id = :orgId
    """)
    Optional<DuoChallenge> findByIdAndOrgId(
        @Param("id") UUID id,
        @Param("orgId") UUID orgId
    );
}
