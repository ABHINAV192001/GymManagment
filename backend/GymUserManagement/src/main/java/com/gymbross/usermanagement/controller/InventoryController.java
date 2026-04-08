package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.dto.InventoryDto;
import com.gymbross.usermanagement.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN')")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryDto>>> getAllInventory(@RequestAttribute(required = false) Long branchId) {
        if (branchId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Branch ID required", 400));
        }
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAllInventory(branchId)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Page<InventoryDto>>> getInventoryDashboard(
            @RequestAttribute Long branchId,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) List<String> condition,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getFilteredInventory(branchId, period, condition, pageable)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addInventory(@RequestBody InventoryDto inventoryDto, @RequestAttribute Long branchId) {
        inventoryService.addInventory(inventoryDto, branchId);
        return ResponseEntity.ok(ApiResponse.success(null, "Inventory added successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateInventory(@PathVariable Long id, @RequestBody InventoryDto inventoryDto,
            @RequestAttribute Long branchId) {
        inventoryService.updateInventory(id, inventoryDto, branchId);
        return ResponseEntity.ok(ApiResponse.success(null, "Inventory updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeInventory(@PathVariable Long id, @RequestAttribute Long branchId) {
        inventoryService.removeInventory(id, branchId);
        return ResponseEntity.ok(ApiResponse.success(null, "Inventory removed successfully"));
    }
}
