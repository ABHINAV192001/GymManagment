package com.gymbross.usermanagement.repository;

import com.gymbross.usermanagement.entity.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {
    List<Lead> findByOrgId(UUID orgId);
    List<Lead> findByBranchId(UUID branchId);
}
