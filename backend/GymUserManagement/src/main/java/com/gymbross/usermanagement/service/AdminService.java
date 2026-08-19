package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.dto.AdminDashboardDtos;
import java.util.List;

public interface AdminService {
    List<AdminDashboardDtos.UserDetailDto> getAllUsers(java.util.UUID organizationId, java.util.UUID branchId);

    List<AdminDashboardDtos.UserDetailDto> getAllUsers(
            java.util.UUID organizationId,
            java.util.UUID branchId,
            String search,
            String role,
            String status,
            Boolean isStaff,
            java.util.UUID filterBranchId,
            String startDateFrom,
            String startDateTo
    );

    List<AdminDashboardDtos.StaffTrackingDto> getAllStaff(java.util.UUID organizationId, java.util.UUID branchId, java.util.UUID currentUserId);

    // User CRUD
    void createUser(AdminDashboardDtos.UserDetailDto userDto, java.util.UUID organizationId, java.util.UUID branchId);

    AdminDashboardDtos.UserDetailDto getUserById(java.util.UUID userId);

    AdminDashboardDtos.UserDetailDto getUserByCode(String userCode);

    void updateUser(java.util.UUID userId, AdminDashboardDtos.UserDetailDto userDto);

    void removeUser(java.util.UUID userId); // Soft delete

    // User CRUD
    void createTrainer(AdminDashboardDtos.TrainerDetailDto trainerDto, java.util.UUID organizationId, java.util.UUID branchId);

    AdminDashboardDtos.TrainerDetailDto getTrainerById(java.util.UUID trainerId);

    void updateTrainer(java.util.UUID trainerId, AdminDashboardDtos.TrainerDetailDto trainerDto);

    void removeTrainer(java.util.UUID trainerId);

    // User CRUD
    AdminDashboardDtos.StaffDetailDto createStaff(AdminDashboardDtos.StaffDetailDto staffDto, java.util.UUID organizationId, java.util.UUID branchId);

    AdminDashboardDtos.StaffDetailDto getStaffById(java.util.UUID staffId);

    void updateStaff(java.util.UUID staffId, AdminDashboardDtos.StaffDetailDto staffDto);

    void removeStaff(java.util.UUID staffId);

    void assignTrainer(java.util.UUID userId, String trainerName);

    void updateDietPlan(java.util.UUID userId, List<String> dietDetails);

    void updateStaffPaymentStatus(java.util.UUID staffId, String status);

    void updateTrainerPaymentStatus(java.util.UUID trainerId, String status);

    AdminDashboardDtos.DashboardStatsDto getDashboardStats(java.util.UUID organizationId, java.util.UUID branchId);

    List<AdminDashboardDtos.BranchDto> getBranches(java.util.UUID organizationId, java.util.UUID branchId, com.Gym.GymCommonServices.entity.User currentUser);

    void resendAdminVerification(java.util.UUID branchId);

    String resendUserInvite(java.util.UUID userId);

    String resendUserInvite(java.util.UUID userId, String clientOrigin);
}
