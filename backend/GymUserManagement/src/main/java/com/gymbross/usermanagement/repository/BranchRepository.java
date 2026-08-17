package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, java.util.UUID> {
    Optional<Branch> findByIdAndIsDeletedFalse(java.util.UUID id);
    org.springframework.data.domain.Page<Branch> findByOrganizationIdAndIsDeletedFalse(java.util.UUID orgId, org.springframework.data.domain.Pageable pageable);

    Optional<Branch> findByBranchCode(String branchCode);

    Optional<Branch> findByAdminEmail(String adminEmail);

    List<Branch> findByOrganizationId(java.util.UUID organizationId);

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) > 0 FROM branches WHERE branch_code = :branchCode", nativeQuery = true)
    boolean existsByBranchCodeNative(@org.springframework.data.repository.query.Param("branchCode") String branchCode);

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM branches WHERE org_id = :orgId", nativeQuery = true)
    long countAllByOrgIdNative(@org.springframework.data.repository.query.Param("orgId") java.util.UUID orgId);
}
