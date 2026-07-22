package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.dto.BranchDtos.BranchRequest;
import com.gymbross.usermanagement.dto.BranchDtos.BranchResponse;
import com.Gym.GymCommonServices.common.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface BranchService {
    BranchResponse createBranch(UUID orgId, BranchRequest request);
    BranchResponse updateBranch(UUID branchId, BranchRequest request, UUID orgId);
    BranchResponse getBranch(UUID branchId, UUID orgId);
    PageResponse<BranchResponse> getAllBranchesByOrganization(UUID orgId, Pageable pageable);
    void deleteBranch(UUID branchId, UUID orgId);
    void toggleBranchStatus(UUID branchId, boolean isActive, UUID orgId);
}
