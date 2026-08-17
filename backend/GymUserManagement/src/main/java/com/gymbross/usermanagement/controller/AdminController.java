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
            @RequestAttribute(value = "branchId", required = false) java.util.UUID branchId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "isStaff", required = false) Boolean isStaff,
            @RequestParam(value = "filterBranchId", required = false) java.util.UUID filterBranchId,
            @RequestParam(value = "startDateFrom", required = false) String startDateFrom,
            @RequestParam(value = "startDateTo", required = false) String startDateTo,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        List<UserDetailDto> filtered = adminService.getAllUsers(
                organizationId, branchId, search, role, status, isStaff, filterBranchId, startDateFrom, startDateTo
        );
        return ResponseEntity.ok(ApiResponse.paginated(filtered, page, size));
    }

    @PostMapping("/users")
    @PreAuthorize("hasAuthority('USERS:CREATE')")
    public ResponseEntity<ApiResponse<Void>> createUser(@jakarta.validation.Valid @RequestBody UserDetailDto userDto,
            @RequestAttribute(value = "organizationId", required = false) java.util.UUID organizationId,
            @RequestAttribute(value = "branchId", required = false) java.util.UUID branchId) {
        adminService.createUser(userDto, organizationId, branchId);
        return ResponseEntity.ok(ApiResponse.success(null, "User created successfully"));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDetailDto>> getUserById(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUserById(id)));
    }

    @GetMapping("/users/code/{code}")
    public ResponseEntity<ApiResponse<UserDetailDto>> getUserByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getUserByCode(code)));
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasAuthority('USERS:EDIT')")
    public ResponseEntity<ApiResponse<Void>> updateUser(@PathVariable java.util.UUID id, @jakarta.validation.Valid @RequestBody UserDetailDto userDto) {
        adminService.updateUser(id, userDto);
        return ResponseEntity.ok(ApiResponse.success(null, "User updated successfully"));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAuthority('USERS:DELETE')")
    public ResponseEntity<ApiResponse<Void>> removeUser(@PathVariable java.util.UUID id) {
        adminService.removeUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User removed successfully"));
    }

    @PostMapping("/users/{id}/resend-invite")
    @PreAuthorize("hasAuthority('USERS:EDIT')")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> resendUserInvite(@PathVariable java.util.UUID id) {
        String inviteLink = adminService.resendUserInvite(id);
        java.util.Map<String, String> res = new java.util.HashMap<>();
        res.put("inviteLink", inviteLink);
        res.put("message", "Password setup notification resent successfully");
        return ResponseEntity.ok(ApiResponse.success(res, "Password setup notification resent successfully"));
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
            @AuthenticationPrincipal User currentUser,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        java.util.UUID currentUserId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.paginated(adminService.getAllStaff(organizationId, branchId, currentUserId), page, size));
    }

    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<StaffDetailDto>> createStaff(
            @RequestAttribute(value = "organizationId", required = false) java.util.UUID organizationId,
            @RequestAttribute(value = "branchId", required = false) java.util.UUID reqBranchId,
            @RequestBody StaffDetailDto staffDto) {
        java.util.UUID effectiveBranchId = staffDto.getBranchId() != null ? staffDto.getBranchId() : reqBranchId;
        StaffDetailDto createdStaff = adminService.createStaff(staffDto, organizationId, effectiveBranchId);
        return ResponseEntity.ok(ApiResponse.success(createdStaff, "Staff created successfully"));
    }

    // --- BRANCHES ---
    @GetMapping("/branches")
    @PreAuthorize("hasAuthority('BRANCHES:VIEW')")
    public ResponseEntity<ApiResponse<List<BranchDto>>> getBranches(
            @RequestAttribute(value = "organizationId", required = false) java.util.UUID organizationId,
            @RequestAttribute(value = "branchId", required = false) java.util.UUID branchId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal User currentUser,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.paginated(adminService.getBranches(organizationId, branchId, currentUser), page, size));
    }
}
