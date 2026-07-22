package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.common.PageResponse;
import com.Gym.GymCommonServices.entity.Organization;
import com.gymbross.usermanagement.dto.OrganizationDtos.OrganizationRequest;
import com.gymbross.usermanagement.dto.OrganizationDtos.OrganizationResponse;
import com.gymbross.usermanagement.repository.OrganizationRepository;
import com.gymbross.usermanagement.service.OrganizationService;
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
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public OrganizationResponse createOrganization(OrganizationRequest request) {
        if (organizationRepository.existsByOwnerEmailIgnoreCase(request.getOwnerEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        Organization organization = Organization.builder()
                .orgCode(request.getOrgCode())
                .username(request.getUsername())
                .name(request.getName())
                .ownerEmail(request.getOwnerEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .isActive(true)
                .isEmailVerified(false)
                .isPhoneVerified(false)
                .isDeleted(false)
                .build();

        organization = organizationRepository.save(organization);
        return mapToResponse(organization);
    }

    @Override
    @Transactional
    public OrganizationResponse updateOrganization(UUID orgId, OrganizationRequest request) {
        Organization organization = getOrgOrThrow(orgId);

        if (!organization.getOwnerEmail().equalsIgnoreCase(request.getOwnerEmail()) && 
                organizationRepository.existsByOwnerEmailIgnoreCase(request.getOwnerEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        organization.setOrgCode(request.getOrgCode());
        organization.setUsername(request.getUsername());
        organization.setName(request.getName());
        organization.setOwnerEmail(request.getOwnerEmail());
        organization.setPhone(request.getPhone());
        
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            organization.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        return mapToResponse(organizationRepository.save(organization));
    }

    @Override
    public OrganizationResponse getOrganization(UUID orgId) {
        return mapToResponse(getOrgOrThrow(orgId));
    }

    @Override
    public PageResponse<OrganizationResponse> getAllOrganizations(Pageable pageable) {
        Page<Organization> orgPage = organizationRepository.findByIsDeletedFalse(pageable);
        return PageResponse.<OrganizationResponse>builder()
                .success(true)
                .data(orgPage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()))
                .pagination(PageResponse.Pagination.builder()
                        .page(orgPage.getNumber())
                        .size(orgPage.getSize())
                        .totalElements(orgPage.getTotalElements())
                        .totalPages(orgPage.getTotalPages())
                        .hasNext(orgPage.hasNext())
                        .hasPrev(orgPage.hasPrevious())
                        .build())
                .build();
    }

    @Override
    @Transactional
    public void deleteOrganization(UUID orgId) {
        Organization organization = getOrgOrThrow(orgId);
        organization.softDelete();
        organization.setIsDeleted(true);
        organization.setIsActive(false);
        organizationRepository.save(organization);
    }

    @Override
    @Transactional
    public void toggleOrganizationStatus(UUID orgId, boolean isActive) {
        Organization organization = getOrgOrThrow(orgId);
        organization.setIsActive(isActive);
        organizationRepository.save(organization);
    }

    private Organization getOrgOrThrow(UUID orgId) {
        return organizationRepository.findByIdAndIsDeletedFalse(orgId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
    }

    private OrganizationResponse mapToResponse(Organization org) {
        return OrganizationResponse.builder()
                .id(org.getId())
                .orgCode(org.getOrgCode())
                .username(org.getUsername())
                .name(org.getName())
                .ownerEmail(org.getOwnerEmail())
                .phone(org.getPhone())
                .isActive(org.getIsActive())
                .isEmailVerified(org.getIsEmailVerified())
                .isPhoneVerified(org.getIsPhoneVerified())
                .build();
    }
}
