package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.dto.OrganizationDtos.OrganizationRequest;
import com.gymbross.usermanagement.dto.OrganizationDtos.OrganizationResponse;
import com.Gym.GymCommonServices.common.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface OrganizationService {
    OrganizationResponse createOrganization(OrganizationRequest request);
    OrganizationResponse updateOrganization(UUID orgId, OrganizationRequest request);
    OrganizationResponse getOrganization(UUID orgId);
    PageResponse<OrganizationResponse> getAllOrganizations(Pageable pageable);
    void deleteOrganization(UUID orgId);
    void toggleOrganizationStatus(UUID orgId, boolean isActive);
}
