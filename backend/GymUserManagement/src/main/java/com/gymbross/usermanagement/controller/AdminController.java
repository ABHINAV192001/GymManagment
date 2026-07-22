package com.gymbross.usermanagement.controller;

import com.gymbross.usermanagement.dto.AdminDashboardDtos.*;
import com.Gym.GymCommonServices.dto.ApiResponse;
import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor

public class AdminController {

    private final AdminService adminService;

    // --- USERS ---
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDetailDto>>> getAllUsers(
            @RequestAttribute(value = "organizationId", required = false) java.util.UUID organizationId,
            @RequestAttribute(value = "branchId", required = false) java.util.UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers(organizationId, branchId)));
    }

    @PostMapping("/users")
    @PreAuthorize("hasAuthority('USERS:CREATE')")
    public ResponseEntity<ApiResponse<Void>> createUser(@RequestBody UserDetailDto userDto,
            @RequestAttribute(value = "organizationId", required = false) java.util.UUID organizationId,
            @RequestAttribute(value = "branchId", required = false) java.util.UUID branchId) {
        adminService.createUser(userDto, organizationId, branchId);
        return ResponseEntity.ok(ApiResponse.success(null, "User created successfully"));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDetailDto>> getUserById(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUserById(id)));
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasAuthority('USERS:EDIT')")
    public ResponseEntity<ApiResponse<Void>> updateUser(@PathVariable java.util.UUID id, @RequestBody UserDetailDto userDto) {
        adminService.updateUser(id, userDto);
        return ResponseEntity.ok(ApiResponse.success(null, "User updated successfully"));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAuthority('USERS:DELETE')")
    public ResponseEntity<ApiResponse<Void>> removeUser(@PathVariable java.util.UUID id) {
        adminService.removeUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User removed successfully"));
    }

    // --- TRAINERS ---
    @PostMapping("/trainers")
    public ResponseEntity<ApiResponse<Void>> createTrainer(@RequestBody TrainerDetailDto trainerDto,
            @RequestAttribute(value = "organizationId", required = false) java.util.UUID organizationId,
            @RequestAttribute(value = "branchId", required = false) java.util.UUID branchId) {
        adminService.createTrainer(trainerDto, organizationId, branchId);
        return ResponseEntity.ok(ApiResponse.success(null, "User created successfully"));
    }

    @GetMapping("/trainers/{id}")
    public ResponseEntity<ApiResponse<TrainerDetailDto>> getTrainerById(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getTrainerById(id)));
    }

    @DeleteMapping("/trainers/{id}")
    public ResponseEntity<ApiResponse<Void>> removeTrainer(@PathVariable java.util.UUID id) {
        adminService.removeTrainer(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User removed successfully"));
    }

    // --- DASHBOARD STATS ---
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats(
            @RequestAttribute(value = "organizationId", required = false) java.util.UUID organizationId,
            @RequestAttribute(value = "branchId", required = false) java.util.UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats(organizationId, branchId)));
    }

    // --- STAFF ---
    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<StaffTrackingDto>>> getAllStaff(
            @RequestAttribute(value = "organizationId", required = false) java.util.UUID organizationId,
            @RequestAttribute(value = "branchId", required = false) java.util.UUID branchId,
            @AuthenticationPrincipal User currentUser) {
        java.util.UUID currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllStaff(organizationId, branchId, currentUserId)));
    }

    // --- BRANCHES ---
    @GetMapping("/branches")
    @PreAuthorize("hasAuthority('BRANCHES:VIEW')")
    public ResponseEntity<ApiResponse<List<BranchDto>>> getBranches(
            @RequestAttribute(value = "organizationId", required = false) java.util.UUID organizationId,
            @RequestAttribute(value = "branchId", required = false) java.util.UUID branchId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getBranches(organizationId, branchId, currentUser)));
    }
}
