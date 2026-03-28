package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.dto.InventoryDto;
import java.util.List;

public interface InventoryService {
    List<InventoryDto> getAllInventory(Long branchId);

    void addInventory(InventoryDto inventoryDto, Long branchId);

    void removeInventory(Long inventoryId, Long branchId); // branchId for ownership check

    void updateInventory(Long inventoryId, InventoryDto inventoryDto, Long branchId);

    org.springframework.data.domain.Page<InventoryDto> getFilteredInventory(Long branchId, String period,
            java.util.List<String> condition, org.springframework.data.domain.Pageable pageable);
}
