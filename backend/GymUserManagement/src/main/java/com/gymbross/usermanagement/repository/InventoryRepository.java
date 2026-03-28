package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<Inventory> {
    List<Inventory> findByBranchId(Long branchId);
}
