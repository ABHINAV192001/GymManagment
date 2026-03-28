package com.gymbross.usermanagement.controller;

import com.gymbross.usermanagement.dto.InventoryDto;
import com.gymbross.usermanagement.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gymbross.usermanagement.security.JwtUtil;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<InventoryDto>> getAllInventory(@RequestAttribute(required = false) Long branchId) {
        if (branchId == null) {
            // For safety, though filter typically handles this or validation needed
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(inventoryService.getAllInventory(branchId));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Page<InventoryDto>> getInventoryDashboard(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) List<String> condition,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        String token = authHeader.substring(7); // Remove "Bearer "
        Long branchId = jwtUtil.extractBranchId(token);

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        return ResponseEntity.ok(inventoryService.getFilteredInventory(branchId, period, condition, pageable));
    }

    @PostMapping
    public ResponseEntity<Void> addInventory(@RequestBody InventoryDto inventoryDto, @RequestAttribute Long branchId) {
        inventoryService.addInventory(inventoryDto, branchId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateInventory(@PathVariable Long id, @RequestBody InventoryDto inventoryDto,
            @RequestAttribute Long branchId) {
        inventoryService.updateInventory(id, inventoryDto, branchId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeInventory(@PathVariable Long id, @RequestAttribute Long branchId) {
        inventoryService.removeInventory(id, branchId);
        return ResponseEntity.ok().build();
    }
}
