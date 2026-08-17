package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.common.PageResponse;
import com.Gym.GymCommonServices.security.CurrentTenantResolver;
import com.gymbross.usermanagement.dto.BranchDtos.BranchRequest;
import com.gymbross.usermanagement.dto.BranchDtos.BranchResponse;
import com.gymbross.usermanagement.service.BranchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

// Permission checks below use the same MODULE:ACTION authority strings issued in the JWT
// "permissions" claim (see RbacServiceImpl.AVAILABLE_PERMISSIONS) - the same pattern should
// be applied to the remaining controllers (Workout, Diet, Activities, Notifications, Chat,
// Inventory, Accounts) in a follow-up pass.
// Note: orgId is never accepted from the client - it's always resolved from the caller's
// JWT (CurrentTenantResolver), never trusted from a path/query parameter.
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;
    private final CurrentTenantResolver currentTenantResolver;

    @PostMapping("/branches")
    @PreAuthorize("hasAuthority('BRANCHES:CREATE')")
    public ResponseEntity<BranchResponse> createBranch(@Valid @RequestBody BranchRequest request) {
        return new ResponseEntity<>(branchService.createBranch(currentTenantResolver.getOrganizationId(), request), HttpStatus.CREATED);
    }

    @PutMapping("/branches/{branchId}")
    @PreAuthorize("hasAuthority('BRANCHES:EDIT')")
    public ResponseEntity<BranchResponse> updateBranch(
            @PathVariable UUID branchId,
            @Valid @RequestBody BranchRequest request) {
        return ResponseEntity.ok(branchService.updateBranch(branchId, request, currentTenantResolver.getOrganizationId()));
    }

    @GetMapping("/branches/{branchId}")
    @PreAuthorize("hasAuthority('BRANCHES:VIEW')")
    public ResponseEntity<BranchResponse> getBranch(@PathVariable UUID branchId) {
        return ResponseEntity.ok(branchService.getBranch(branchId, currentTenantResolver.getOrganizationId()));
    }

    @GetMapping("/branches")
    @PreAuthorize("hasAuthority('BRANCHES:VIEW')")
    public ResponseEntity<PageResponse<BranchResponse>> getAllBranchesByOrganization(Pageable pageable) {
        return ResponseEntity.ok(branchService.getAllBranchesByOrganization(currentTenantResolver.getOrganizationId(), pageable));
    }

    @DeleteMapping("/branches/{branchId}")
    @PreAuthorize("hasAuthority('BRANCHES:DELETE')")
    public ResponseEntity<Void> deleteBranch(@PathVariable UUID branchId) {
        branchService.deleteBranch(branchId, currentTenantResolver.getOrganizationId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/branches/{branchId}/status")
    @PreAuthorize("hasAuthority('BRANCHES:EDIT')")
    public ResponseEntity<Void> toggleBranchStatus(
            @PathVariable UUID branchId,
            @RequestParam boolean isActive) {
        branchService.toggleBranchStatus(branchId, isActive, currentTenantResolver.getOrganizationId());
        return ResponseEntity.noContent().build();
    }
}
