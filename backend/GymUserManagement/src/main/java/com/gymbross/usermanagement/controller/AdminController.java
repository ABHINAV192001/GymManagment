package com.gymbross.usermanagement.controller;

import com.gymbross.usermanagement.dto.AdminDashboardDtos;
import com.gymbross.usermanagement.service.AdminService;
import com.gymbross.usermanagement.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final JwtUtil jwtUtil;

    // Users
    @GetMapping("/users")
    public ResponseEntity<List<AdminDashboardDtos.UserDetailDto>> getAllUsers(
            @RequestAttribute(value = "organizationId", required = false) Long organizationId,
            @RequestAttribute(value = "branchId", required = false) Long branchId) {
        return ResponseEntity.ok(adminService.getAllUsers(organizationId, branchId));
    }

    @PostMapping("/users")
    public ResponseEntity<Void> createUser(@RequestBody AdminDashboardDtos.UserDetailDto userDto,
            @RequestAttribute(value = "organizationId", required = false) Long organizationId,
            @RequestAttribute(value = "branchId", required = false) Long branchId) {
        adminService.createUser(userDto, organizationId, branchId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminDashboardDtos.UserDetailDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<Void> updateUser(@PathVariable Long id,
            @RequestBody AdminDashboardDtos.UserDetailDto userDto) {
        adminService.updateUser(id, userDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> removeUser(@PathVariable Long id) {
        adminService.removeUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/assign-trainer")
    public ResponseEntity<Void> assignTrainer(@PathVariable Long id, @RequestParam String trainerName) {
        adminService.assignTrainer(id, trainerName);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/diet-plan")
    public ResponseEntity<Void> updateDietPlan(@PathVariable Long id, @RequestBody List<String> dietDetails) {
        adminService.updateDietPlan(id, dietDetails);
        return ResponseEntity.ok().build();
    }

    // Trainers
    @PostMapping("/trainers")
    public ResponseEntity<Void> createTrainer(@RequestBody AdminDashboardDtos.TrainerDetailDto trainerDto,
            @RequestAttribute(value = "organizationId", required = false) Long organizationId,
            @RequestAttribute(value = "branchId", required = false) Long branchId) {
        adminService.createTrainer(trainerDto, organizationId, branchId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/trainers/{id}")
    public ResponseEntity<AdminDashboardDtos.TrainerDetailDto> getTrainerById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getTrainerById(id));
    }

    @PutMapping("/trainers/{id}")
    public ResponseEntity<Void> updateTrainer(@PathVariable Long id,
            @RequestBody AdminDashboardDtos.TrainerDetailDto trainerDto) {
        adminService.updateTrainer(id, trainerDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/trainers/{id}")
    public ResponseEntity<Void> removeTrainer(@PathVariable Long id) {
        adminService.removeTrainer(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/trainers/{id}/payment-status")
    public ResponseEntity<Void> updateTrainerPaymentStatus(@PathVariable Long id, @RequestParam String status) {
        System.out.println("DEBUG: updateTrainerPaymentStatus called. ID: " + id + ", Status: " + status);
        adminService.updateTrainerPaymentStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardDtos.DashboardStatsDto> getDashboardStats(
            @RequestAttribute(value = "organizationId", required = false) Long organizationId,
            @RequestAttribute(value = "branchId", required = false) Long branchId) {
        return ResponseEntity.ok(adminService.getDashboardStats(organizationId, branchId));
    }

    // Staff
    @GetMapping("/staff")
    public ResponseEntity<List<AdminDashboardDtos.StaffTrackingDto>> getAllStaff(
            @RequestAttribute(value = "organizationId", required = false) Long organizationId,
            @RequestAttribute(value = "branchId", required = false) Long branchId) {
        return ResponseEntity.ok(adminService.getAllStaff(organizationId, branchId));
    }

    @PostMapping("/staff")
    public ResponseEntity<Void> createStaff(@RequestBody AdminDashboardDtos.StaffDetailDto staffDto,
            @RequestAttribute(value = "organizationId", required = false) Long organizationId,
            @RequestAttribute(value = "branchId", required = false) Long branchId) {
        adminService.createStaff(staffDto, organizationId, branchId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/staff/{id}")
    public ResponseEntity<AdminDashboardDtos.StaffDetailDto> getStaffById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getStaffById(id));
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<Void> updateStaff(@PathVariable Long id,
            @RequestBody AdminDashboardDtos.StaffDetailDto staffDto) {
        adminService.updateStaff(id, staffDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<Void> removeStaff(@PathVariable Long id) {
        adminService.removeStaff(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/staff/{id}/payment-status")
    public ResponseEntity<Void> updateStaffPaymentStatus(@PathVariable Long id, @RequestParam String status) {
        System.out.println("DEBUG: updateStaffPaymentStatus called. ID: " + id + ", Status: " + status);
        adminService.updateStaffPaymentStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/branches")
    public ResponseEntity<List<AdminDashboardDtos.BranchDto>> getBranches(
            @RequestAttribute(value = "organizationId", required = false) Long organizationId) {
        return ResponseEntity.ok(adminService.getBranches(organizationId));
    }

    @PostMapping("/branches/{id}/resend-verification")
    public ResponseEntity<Void> resendVerification(@PathVariable Long id) {
        adminService.resendAdminVerification(id);
        return ResponseEntity.ok().build();
    }
}
