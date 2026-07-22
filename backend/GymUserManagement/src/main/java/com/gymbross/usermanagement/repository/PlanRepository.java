package com.gymbross.usermanagement.repository;

import com.gymbross.usermanagement.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlanRepository extends JpaRepository<Plan, UUID> {
    @Query("SELECT p FROM UserManagementPlan p WHERE p.isDeleted = false AND p.organizationId = :orgId AND (:branchId IS NULL OR p.branchId = :branchId)")
    List<Plan> findByOrganizationIdAndBranchIdAndIsDeletedFalse(@Param("orgId") UUID orgId, @Param("branchId") UUID branchId);

    @Query("SELECT p FROM UserManagementPlan p WHERE p.id = :id AND p.isDeleted = false AND p.organizationId = :orgId")
    Optional<Plan> findByIdAndOrganizationIdAndIsDeletedFalse(@Param("id") UUID id, @Param("orgId") UUID orgId);
}
