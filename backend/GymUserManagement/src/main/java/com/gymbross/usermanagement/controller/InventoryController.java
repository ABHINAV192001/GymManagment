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
public class InventoryController {

    private final InventoryService inventoryService;

    @PreAuthorize("hasAuthority('INVENTORY:VIEW')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryDto>>> getAllInventory(
            @RequestAttribute("organizationId") java.util.UUID orgId,
            @RequestAttribute(required = false) java.util.UUID branchId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.paginated(inventoryService.getAllInventory(orgId, branchId), page, size));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('INVENTORY:VIEW')")
    public ResponseEntity<ApiResponse<Page<InventoryDto>>> getInventoryDashboard(
            @RequestAttribute("organizationId") java.util.UUID orgId,
            @RequestAttribute(required = false) java.util.UUID branchId,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) List<String> condition,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getFilteredInventory(orgId, branchId, period, condition, pageable)));
    }

    @PreAuthorize("hasAuthority('INVENTORY:CREATE')")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addInventory(@RequestBody InventoryDto inventoryDto, @RequestAttribute("organizationId") java.util.UUID orgId, @RequestAttribute(required = false) java.util.UUID branchId) {
        inventoryService.addInventory(inventoryDto, orgId, branchId);
        return ResponseEntity.ok(ApiResponse.success(null, "Inventory added successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INVENTORY:EDIT')")
    public ResponseEntity<ApiResponse<Void>> updateInventory(@PathVariable java.util.UUID id, @RequestBody InventoryDto inventoryDto,
            @RequestAttribute("organizationId") java.util.UUID orgId, @RequestAttribute(required = false) java.util.UUID branchId) {
        inventoryService.updateInventory(id, inventoryDto, orgId, branchId);
        return ResponseEntity.ok(ApiResponse.success(null, "Inventory updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INVENTORY:DELETE')")
    public ResponseEntity<ApiResponse<Void>> removeInventory(@PathVariable java.util.UUID id, @RequestAttribute("organizationId") java.util.UUID orgId, @RequestAttribute(required = false) java.util.UUID branchId) {
        inventoryService.removeInventory(id, orgId, branchId);
        return ResponseEntity.ok(ApiResponse.success(null, "Inventory removed successfully"));
    }

    @PostMapping("/{id}/sell")
    @PreAuthorize("hasAuthority('INVENTORY:EDIT')")
    public ResponseEntity<ApiResponse<InventoryDto>> sellInventory(
            @PathVariable java.util.UUID id,
            @RequestParam int quantity,
            @RequestAttribute("organizationId") java.util.UUID orgId,
            @RequestAttribute(required = false) java.util.UUID branchId) {
        InventoryDto updated = inventoryService.sellInventory(id, quantity, orgId, branchId);
        return ResponseEntity.ok(ApiResponse.success(updated, "Sale processed. Stock updated."));
    }
}
