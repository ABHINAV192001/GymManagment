package com.gymbross.usermanagement.controller;

import com.gymbross.usermanagement.dto.AdminDashboardDtos.*;
import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'OWNER', 'ADMIN', 'TRAINER')")
public class AdminController {

    private final AdminService adminService;

    // --- USERS ---
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDetailDto>>> getAllUsers(
            @RequestAttribute(value = "organizationId", required = false) Long organizationId,
            @RequestAttribute(value = "branchId", required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers(organizationId, branchId)));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<Void>> createUser(@RequestBody UserDetailDto userDto,
            @RequestAttribute(value = "organizationId", required = false) Long organizationId,
            @RequestAttribute(value = "branchId", required = false) Long branchId) {
        adminService.createUser(userDto, organizationId, branchId);
        return ResponseEntity.ok(ApiResponse.success(null, "User created successfully"));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDetailDto>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUserById(id)));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> updateUser(@PathVariable Long id, @RequestBody UserDetailDto userDto) {
        adminService.updateUser(id, userDto);
        return ResponseEntity.ok(ApiResponse.success(null, "User updated successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> removeUser(@PathVariable Long id) {
        adminService.removeUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User removed successfully"));
    }

    // --- TRAINERS ---
    @PostMapping("/trainers")
    public ResponseEntity<ApiResponse<Void>> createTrainer(@RequestBody TrainerDetailDto trainerDto,
            @RequestAttribute(value = "organizationId", required = false) Long organizationId,
            @RequestAttribute(value = "branchId", required = false) Long branchId) {
        adminService.createTrainer(trainerDto, organizationId, branchId);
        return ResponseEntity.ok(ApiResponse.success(null, "Trainer created successfully"));
    }

    @GetMapping("/trainers/{id}")
    public ResponseEntity<ApiResponse<TrainerDetailDto>> getTrainerById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getTrainerById(id)));
    }

    @DeleteMapping("/trainers/{id}")
    public ResponseEntity<ApiResponse<Void>> removeTrainer(@PathVariable Long id) {
        adminService.removeTrainer(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Trainer removed successfully"));
    }

    // --- DASHBOARD STATS ---
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats(
            @RequestAttribute(value = "organizationId", required = false) Long organizationId,
            @RequestAttribute(value = "branchId", required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats(organizationId, branchId)));
    }

    // --- STAFF ---
    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<StaffTrackingDto>>> getAllStaff(
            @RequestAttribute(value = "organizationId", required = false) Long organizationId,
            @RequestAttribute(value = "branchId", required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllStaff(organizationId, branchId)));
    }

    // --- BRANCHES ---
    @GetMapping("/branches")
    @PreAuthorize("hasAuthority('ORG_ADMIN')") // Only Org Admins can see all branches
    public ResponseEntity<ApiResponse<List<BranchDto>>> getBranches(
            @RequestAttribute(value = "organizationId", required = false) Long organizationId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getBranches(organizationId)));
    }
}
