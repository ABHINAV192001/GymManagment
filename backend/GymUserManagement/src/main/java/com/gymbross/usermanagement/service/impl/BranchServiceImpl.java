package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.common.PageResponse;
import com.Gym.GymCommonServices.entity.Branch;
import com.Gym.GymCommonServices.entity.Organization;
import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.User;

import com.gymbross.usermanagement.dto.BranchDtos.BranchRequest;
import com.gymbross.usermanagement.dto.BranchDtos.BranchResponse;
import com.gymbross.usermanagement.dto.AdminDashboardDtos.UserDetailDto;
import com.gymbross.usermanagement.repository.BranchRepository;
import com.gymbross.usermanagement.repository.OrganizationRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.Gym.GymCommonServices.security.CurrentTenantResolver;
import com.Gym.GymCommonServices.security.TenantAccessGuard;
import com.gymbross.usermanagement.service.BranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
        private final TenantAccessGuard tenantAccessGuard;
    private final CurrentTenantResolver currentTenantResolver;

    @Override
    @Transactional
    public BranchResponse createBranch(UUID orgId, BranchRequest request) {
        assertCallerBelongsToOrg(orgId);
        Organization organization = organizationRepository.findByIdAndIsDeletedFalse(orgId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        String branchCode = request.getBranchCode();
        if (branchCode == null || branchCode.trim().isEmpty()) {
            long totalBranchesEver = branchRepository.countAllByOrgIdNative(orgId);
            int seq = (int) totalBranchesEver + 1;
            String candidateCode = organization.getOrgCode() + "-BR" + String.format("%02d", seq);
            while (branchRepository.existsByBranchCodeNative(candidateCode)) {
                seq++;
                candidateCode = organization.getOrgCode() + "-BR" + String.format("%02d", seq);
            }
            branchCode = candidateCode;
        } else {
            branchCode = branchCode.trim();
            if (branchRepository.existsByBranchCodeNative(branchCode)) {
                throw new IllegalArgumentException("Branch code '" + branchCode + "' already exists");
            }
        }

        User selectedUser = null;
        if (request.getAdminUserId() != null) {
            selectedUser = userRepository.findById(request.getAdminUserId())
                    .orElse(null);
        }

        String targetUsername = (selectedUser != null && selectedUser.getUsername() != null)
                ? selectedUser.getUsername()
                : (branchCode.toLowerCase().replaceAll("[^a-z0-9]", "") + "_admin");

        String ownerDomain = (organization.getOwnerEmail() != null && organization.getOwnerEmail().contains("@"))
                ? organization.getOwnerEmail().split("@")[1]
                : "gym.com";

        String targetEmail = (selectedUser != null && selectedUser.getEmail() != null)
                ? selectedUser.getEmail()
                : ("admin." + branchCode.toLowerCase().replaceAll("[^a-z0-9]", "") + "@" + ownerDomain);

        String targetPasswordHash = (selectedUser != null) ? selectedUser.getPasswordHash() : "$2a$10$wN35gE42tD1yH86P8V8K3OlFmYj0.d1rFqR2k06L2Xv6H7F0E5D5m";

        Branch branch = Branch.builder()
                .organization(organization)
                .branchCode(branchCode)
                .username(targetUsername)
                .name(request.getName())
                .adminEmail(targetEmail)
                .passwordHash(targetPasswordHash)
                .isActive(true)
                .isDeleted(false)
                .build();

        branch = branchRepository.save(branch);

        if (selectedUser != null) {
            selectedUser.setBranch(branch);
            userRepository.save(selectedUser);
        }

        return mapToResponse(branch);
    }

    @Override
    @Transactional
    public BranchResponse updateBranch(UUID branchId, BranchRequest request, UUID orgId) {
        Branch branch = getBranchOrThrow(branchId, orgId);

        // Allow updating branch code
        if (request.getBranchCode() != null && !request.getBranchCode().isBlank() && 
                !branch.getBranchCode().equals(request.getBranchCode().trim()) &&
                branchRepository.existsByBranchCodeNative(request.getBranchCode().trim())) {
            throw new IllegalArgumentException("Branch code '" + request.getBranchCode().trim() + "' already exists");
        }

        if (request.getBranchCode() != null && !request.getBranchCode().isBlank()) {
            branch.setBranchCode(request.getBranchCode());
        }
        branch.setName(request.getName());

        // Update branch admin if request.getAdminUserId() is provided
        if (request.getAdminUserId() != null) {
            User newAdminUser = userRepository.findById(request.getAdminUserId())
                    .orElseThrow(() -> new IllegalArgumentException("New Branch User user not found"));

            // Get current admin users of this branch to demote them
            java.util.List<User> currentAdmins = userRepository.findByBranchId(branch.getId());
            for (User oldAdmin : currentAdmins) {
                if (!oldAdmin.getId().equals(newAdminUser.getId())) {
                    oldAdmin.setBranch(null);
                    userRepository.save(oldAdmin);
                }
            }

            // Promote new admin
            newAdminUser.setBranch(branch);
            userRepository.save(newAdminUser);

            // Copy credentials to branch
            branch.setUsername(newAdminUser.getUsername());
            branch.setAdminEmail(newAdminUser.getEmail());
            branch.setPasswordHash(newAdminUser.getPasswordHash());
        }

        return mapToResponse(branchRepository.save(branch));
    }

    @Override
    public BranchResponse getBranch(UUID branchId, UUID orgId) {
        return mapToResponse(getBranchOrThrow(branchId, orgId));
    }

    @Override
    public PageResponse<BranchResponse> getAllBranchesByOrganization(UUID orgId, Pageable pageable) {
        assertCallerBelongsToOrg(orgId);
        Page<Branch> branchPage = branchRepository.findByOrganizationIdAndIsDeletedFalse(orgId, pageable);
        return PageResponse.<BranchResponse>builder()
                .success(true)
                .data(branchPage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()))
                .pagination(PageResponse.Pagination.builder()
                        .page(branchPage.getNumber())
                        .size(branchPage.getSize())
                        .totalElements(branchPage.getTotalElements())
                        .totalPages(branchPage.getTotalPages())
                        .hasNext(branchPage.hasNext())
                        .hasPrev(branchPage.hasPrevious())
                        .build())
                .build();
    }

    @Override
    @Transactional
    public void deleteBranch(UUID branchId, UUID orgId) {
        Branch branch = getBranchOrThrow(branchId, orgId);
        branch.softDelete();
        branch.setIsDeleted(true);
        branch.setIsActive(false);
        branchRepository.save(branch);

        // Soft delete all users and staff assigned to this branch
        java.util.List<User> branchUsers = userRepository.findByBranchId(branch.getId());
        for (User user : branchUsers) {
            user.softDelete();
            user.setIsDeleted(true);
            user.setIsActive(false);
            userRepository.save(user);
        }
    }

    @Override
    @Transactional
    public void toggleBranchStatus(UUID branchId, boolean isActive, UUID orgId) {
        Branch branch = getBranchOrThrow(branchId, orgId);
        branch.setIsActive(isActive);
        branchRepository.save(branch);
    }

    private Branch getBranchOrThrow(UUID branchId, UUID orgId) {
        Branch branch = branchRepository.findByIdAndIsDeletedFalse(branchId)
                .orElseThrow(() -> new IllegalArgumentException("Branch not found"));
        UUID branchOrgId = branch.getOrganization() != null ? branch.getOrganization().getId() : null;
        tenantAccessGuard.assertOwnedByOrg(branchOrgId, orgId != null ? orgId : currentTenantResolver.getOrganizationId());
        return branch;
    }

    private void assertCallerBelongsToOrg(UUID orgId) {
        tenantAccessGuard.assertOwnedByOrg(orgId, currentTenantResolver.getOrganizationId());
    }

    private BranchResponse mapToResponse(Branch branch) {
        UUID adminUserId = userRepository.findByBranchId(branch.getId()).stream()
                .filter(u -> u.getRole() == "USER")
                .map(User::getId)
                .findFirst()
                .orElse(null);

        return BranchResponse.builder()
                .id(branch.getId())
                .orgId(branch.getOrganization() != null ? branch.getOrganization().getId() : null)
                .branchCode(branch.getBranchCode())
                .username(branch.getUsername())
                .name(branch.getName())
                .adminEmail(branch.getAdminEmail())
                .isActive(branch.getIsActive())
                .adminUserId(adminUserId)
                .build();
    }
}
