package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.dto.InventoryDto;
import java.util.List;

public interface InventoryService {
    List<InventoryDto> getAllInventory(java.util.UUID orgId, java.util.UUID branchId);

    void addInventory(InventoryDto inventoryDto, java.util.UUID orgId, java.util.UUID branchId);

    void removeInventory(java.util.UUID inventoryId, java.util.UUID orgId, java.util.UUID branchId);

    void updateInventory(java.util.UUID inventoryId, InventoryDto inventoryDto, java.util.UUID orgId, java.util.UUID branchId);

    org.springframework.data.domain.Page<InventoryDto> getFilteredInventory(java.util.UUID orgId, java.util.UUID branchId, String period,
            java.util.List<String> condition, org.springframework.data.domain.Pageable pageable);

    InventoryDto sellInventory(java.util.UUID inventoryId, int quantity, java.util.UUID orgId, java.util.UUID branchId);
}
