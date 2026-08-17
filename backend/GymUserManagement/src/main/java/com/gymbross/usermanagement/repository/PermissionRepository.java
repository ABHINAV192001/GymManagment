package com.gymbross.usermanagement.repository;

import com.gymbross.usermanagement.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {
    Optional<Permission> findBySubModule(String subModule);
    Optional<Permission> findBySubModuleIgnoreCase(String subModule);
}
