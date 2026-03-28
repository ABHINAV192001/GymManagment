package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.dto.AdminDashboardDtos;
import java.util.List;

public interface AdminService {
    List<AdminDashboardDtos.UserDetailDto> getAllUsers(Long organizationId, Long branchId);

    List<AdminDashboardDtos.StaffTrackingDto> getAllStaff(Long organizationId, Long branchId);

    // User CRUD
    void createUser(AdminDashboardDtos.UserDetailDto userDto, Long organizationId, Long branchId);

    AdminDashboardDtos.UserDetailDto getUserById(Long userId);

    void updateUser(Long userId, AdminDashboardDtos.UserDetailDto userDto);

    void removeUser(Long userId); // Soft delete

    // Trainer CRUD
    void createTrainer(AdminDashboardDtos.TrainerDetailDto trainerDto, Long organizationId, Long branchId);

    AdminDashboardDtos.TrainerDetailDto getTrainerById(Long trainerId);

    void updateTrainer(Long trainerId, AdminDashboardDtos.TrainerDetailDto trainerDto);

    void removeTrainer(Long trainerId);

    // Staff CRUD
    void createStaff(AdminDashboardDtos.StaffDetailDto staffDto, Long organizationId, Long branchId);

    AdminDashboardDtos.StaffDetailDto getStaffById(Long staffId);

    void updateStaff(Long staffId, AdminDashboardDtos.StaffDetailDto staffDto);

    void removeStaff(Long staffId);

    void assignTrainer(Long userId, String trainerName);

    void updateDietPlan(Long userId, List<String> dietDetails);

    void updateStaffPaymentStatus(Long staffId, String status);

    void updateTrainerPaymentStatus(Long trainerId, String status);

    AdminDashboardDtos.DashboardStatsDto getDashboardStats(Long organizationId, Long branchId);

    List<AdminDashboardDtos.BranchDto> getBranches(Long organizationId);

    void resendAdminVerification(Long branchId);
}
