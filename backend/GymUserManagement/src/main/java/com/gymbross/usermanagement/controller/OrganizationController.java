package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.security.CurrentTenantResolver;
import com.gymbross.usermanagement.dto.OrganizationDtos.OrganizationRequest;
import com.gymbross.usermanagement.dto.OrganizationDtos.OrganizationResponse;
import com.gymbross.usermanagement.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

// Every endpoint here acts on the caller's own organization, resolved from the JWT
// (never a client-supplied ID) - there's no cross-org role in this system, so there's
// never a legitimate reason for a client to name a *different* org.
@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final CurrentTenantResolver currentTenantResolver;

    @PutMapping("/me")
    public ResponseEntity<OrganizationResponse> updateMyOrganization(@Valid @RequestBody OrganizationRequest request) {
        return ResponseEntity.ok(organizationService.updateOrganization(currentTenantResolver.getOrganizationId(), request));
    }

    @GetMapping("/me")
    public ResponseEntity<OrganizationResponse> getMyOrganization() {
        return ResponseEntity.ok(organizationService.getOrganization(currentTenantResolver.getOrganizationId()));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyOrganization() {
        organizationService.deleteOrganization(currentTenantResolver.getOrganizationId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/me/status")
    public ResponseEntity<Void> toggleMyOrganizationStatus(@RequestParam boolean isActive) {
        organizationService.toggleOrganizationStatus(currentTenantResolver.getOrganizationId(), isActive);
        return ResponseEntity.noContent().build();
    }
}
