package com.gymbross.workout.repository;

import com.gymbross.workout.entity.GroupSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GroupSessionRepository extends JpaRepository<GroupSession, UUID> {

    List<GroupSession> findByOrgIdOrderByCreatedAtDesc(UUID orgId);

    List<GroupSession> findByOrgIdAndBranchIdsContainingOrderByCreatedAtDesc(UUID orgId, String branchId);
}
