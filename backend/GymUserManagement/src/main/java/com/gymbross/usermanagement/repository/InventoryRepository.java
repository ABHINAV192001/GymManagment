package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, java.util.UUID>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<Inventory> {
    List<Inventory> findByBranchId(java.util.UUID branchId);
    
    @org.springframework.data.jpa.repository.Query("SELECT i FROM Inventory i WHERE i.branch.organization.id = :orgId")
    List<Inventory> findByOrganizationId(@org.springframework.data.repository.query.Param("orgId") java.util.UUID orgId);
}
