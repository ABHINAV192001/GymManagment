package com.gymbross.duo.repository;

import com.gymbross.duo.entity.DuoPartnership;
import com.gymbross.duo.entity.PartnershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DuoPartnershipRepository extends JpaRepository<DuoPartnership, UUID> {

    @Query("""
        SELECT dp FROM DuoPartnership dp
        LEFT JOIN FETCH dp.requester
        LEFT JOIN FETCH dp.addressee
        LEFT JOIN FETCH dp.organization
        WHERE dp.organization.id = :orgId
          AND ((dp.requester.id = :userId) OR (dp.addressee.id = :userId))
          AND dp.status = :status
    """)
    List<DuoPartnership> findActivePartnerships(
        @Param("orgId") UUID orgId,
        @Param("userId") UUID userId,
        @Param("status") PartnershipStatus status
    );

    @Query("""
        SELECT dp FROM DuoPartnership dp
        LEFT JOIN FETCH dp.requester
        LEFT JOIN FETCH dp.addressee
        LEFT JOIN FETCH dp.organization
        WHERE dp.organization.id = :orgId
          AND ((dp.requester.id = :u1 AND dp.addressee.id = :u2) OR (dp.requester.id = :u2 AND dp.addressee.id = :u1))
    """)
    Optional<DuoPartnership> findPartnershipBetween(
        @Param("orgId") UUID orgId,
        @Param("u1") UUID u1,
        @Param("u2") UUID u2
    );

    @Query("""
        SELECT dp FROM DuoPartnership dp
        LEFT JOIN FETCH dp.requester
        LEFT JOIN FETCH dp.addressee
        LEFT JOIN FETCH dp.organization
        WHERE dp.addressee.id = :userId
          AND dp.organization.id = :orgId
          AND dp.status = 'PENDING'
    """)
    List<DuoPartnership> findPendingInvitesForUser(
        @Param("orgId") UUID orgId,
        @Param("userId") UUID userId
    );

    @Query("""
        SELECT dp FROM DuoPartnership dp
        LEFT JOIN FETCH dp.requester
        LEFT JOIN FETCH dp.addressee
        LEFT JOIN FETCH dp.organization
        WHERE dp.inviteCode = :inviteCode
    """)
    Optional<DuoPartnership> findByInviteCode(@Param("inviteCode") String inviteCode);
}

