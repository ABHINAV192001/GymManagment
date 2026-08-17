package com.gymbross.usermanagement.repository;

import com.gymbross.usermanagement.entity.RbacRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RbacRoleRepository extends JpaRepository<RbacRole, UUID> {
    Optional<RbacRole> findByName(String name);
    Optional<RbacRole> findByNameAndOrgId(String name, UUID orgId);
    Optional<RbacRole> findByNameAndOrgIdIsNull(String name);
    java.util.List<RbacRole> findByOrgId(UUID orgId);
    java.util.List<RbacRole> findByOrgIdOrOrgIdIsNull(UUID orgId);
}
