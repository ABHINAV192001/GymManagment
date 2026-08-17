package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.dto.RbacRoleResponse;
import com.gymbross.usermanagement.entity.RbacRole;
import com.gymbross.usermanagement.service.RbacService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import com.Gym.GymCommonServices.security.CurrentTenantResolver;

@RestController
@RequestMapping("/api/v1/rbac")
@RequiredArgsConstructor
public class RbacController {

    private final RbacService rbacService;
    private final CurrentTenantResolver currentTenantResolver;

    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('RBAC:VIEW')")
    public ResponseEntity<ApiResponse<List<RbacRoleResponse>>> getRoles(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.paginated(mapToResponseList(rbacService.getRoles(orgId)), page, size));
    }

    @PostMapping("/roles")
    @PreAuthorize("hasAuthority('RBAC:CREATE')")
    public ResponseEntity<ApiResponse<RbacRoleResponse>> createRole(
            @RequestAttribute("organizationId") UUID orgId,
            @RequestBody RbacRole role) {
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(rbacService.createRole(role, orgId)), "String created successfully"));
    }

    @GetMapping("/roles/{id}")
    @PreAuthorize("hasAuthority('RBAC:VIEW')")
    public ResponseEntity<ApiResponse<RbacRoleResponse>> getRoleById(
            @RequestAttribute("organizationId") UUID orgId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(rbacService.getRoleById(id, orgId))));
    }

    @PutMapping("/roles/{id}")
    @PreAuthorize("hasAuthority('RBAC:EDIT')")
    public ResponseEntity<ApiResponse<RbacRoleResponse>> updateRole(
            @RequestAttribute("organizationId") UUID orgId,
            @PathVariable UUID id, 
            @RequestBody RbacRole role) {
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(rbacService.updateRole(id, role, orgId)), "String updated successfully"));
    }

    @DeleteMapping("/roles/{id}")
    @PreAuthorize("hasAuthority('RBAC:DELETE')")
    public ResponseEntity<ApiResponse<Void>> deleteRole(
            @RequestAttribute("organizationId") UUID orgId,
            @PathVariable UUID id) {
        rbacService.deleteRole(id, orgId);
        return ResponseEntity.ok(ApiResponse.success(null, "String deleted successfully"));
    }

    @PutMapping("/roles/{id}/permissions")
    @PreAuthorize("hasAuthority('RBAC:EDIT')")
    public ResponseEntity<ApiResponse<RbacRoleResponse>> setRolePermissions(
            @RequestAttribute("organizationId") UUID orgId,
            @PathVariable UUID id, 
            @RequestBody Set<String> permissions) {
        return ResponseEntity.ok(ApiResponse.success(mapToResponse(rbacService.setRolePermissions(id, permissions, orgId)), "Permissions updated successfully"));
    }

    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('RBAC:VIEW')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllAvailablePermissions(org.springframework.security.core.Authentication authentication) {
        String role = "UNKNOWN";
        if (authentication != null) {
            if (authentication.getPrincipal() instanceof User) {
                User u = (User) authentication.getPrincipal();
                if (u.getRole() != null) role = u.getRole();
            } else if (authentication.getAuthorities() != null && !authentication.getAuthorities().isEmpty()) {
                role = authentication.getAuthorities().iterator().next().getAuthority();
                if (role.startsWith("ROLE_")) role = role.substring(5);
            }
        }
        
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("role", role);
        responseData.put("permissions", groupPermissions(rbacService.getAllAvailablePermissions()));
        
        return ResponseEntity.ok(ApiResponse.success(responseData));
    }

    @GetMapping("/permissions/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyPermissions(org.springframework.security.core.Authentication authentication) {
        String role = "UNKNOWN";
        List<String> myPermissions = new ArrayList<>();

        if (authentication != null) {
            if (authentication.getPrincipal() instanceof User) {
                User u = (User) authentication.getPrincipal();
                if (u.getRole() != null) {
                    role = u.getRole();
                }
            }

            if (authentication.getAuthorities() != null) {
                for (org.springframework.security.core.GrantedAuthority auth : authentication.getAuthorities()) {
                    String authority = auth.getAuthority();
                    if (authority.contains(":")) {
                        myPermissions.add(authority);
                    } else if ("UNKNOWN".equals(role) || role == null) {
                        String cleanRole = authority.startsWith("ROLE_") ? authority.substring(5) : authority;
                        role = cleanRole;
                    }
                }
            }
        }

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("role", role);
        responseData.put("permissions", groupPermissions(myPermissions));
        
        return ResponseEntity.ok(ApiResponse.success(responseData));
    }

    @PostMapping("/staff/{staffId}/roles")
    @PreAuthorize("hasAuthority('RBAC:EDIT')")
    public ResponseEntity<ApiResponse<Void>> assignRoleToStaff(
            @RequestAttribute("organizationId") UUID orgId,
            @PathVariable UUID staffId, 
            @RequestParam UUID roleId) {
        rbacService.assignRoleToStaff(staffId, roleId, orgId);
        return ResponseEntity.ok(ApiResponse.success(null, "String assigned successfully"));
    }

    @DeleteMapping("/staff/{staffId}/roles/{roleId}")
    @PreAuthorize("hasAuthority('RBAC:EDIT')")
    public ResponseEntity<ApiResponse<Void>> removeRoleFromStaff(
            @RequestAttribute("organizationId") UUID orgId,
            @PathVariable UUID staffId, 
            @PathVariable UUID roleId) {
        rbacService.removeRoleFromStaff(staffId, roleId, orgId);
        return ResponseEntity.ok(ApiResponse.success(null, "String removed successfully"));
    }

    @GetMapping("/users/{userId}/permissions")
    @PreAuthorize("hasAuthority('RBAC:VIEW')")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> getEffectivePermissionsForUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(groupPermissions(rbacService.getEffectivePermissionsForStaff(userId))));
    }

    private Map<String, List<String>> groupPermissions(Collection<String> permissions) {
        Map<String, List<String>> grouped = new LinkedHashMap<>();
        if (permissions != null) {
            for (String perm : permissions) {
                if (perm != null && perm.contains(":")) {
                    String[] parts = perm.split(":", 2);
                    String module = parts[0].toLowerCase();
                    String action = parts[1].toLowerCase();
                    grouped.computeIfAbsent(module, k -> new ArrayList<>()).add(action);
                } else if (perm != null) {
                    grouped.computeIfAbsent("general", k -> new ArrayList<>()).add(perm.toLowerCase());
                }
            }
        }
        return grouped;
    }

    private RbacRoleResponse mapToResponse(RbacRole role) {
        if (role == null) return null;

        return RbacRoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .orgId(role.getOrgId())
                .active(role.isActive())
                .deleted(role.isDeleted())
                .system(role.getOrgId() == null)
                .permissions(groupPermissions(rbacService.getPermissionsForRole(role.getId())))
                .build();
    }

    private RbacRoleResponse mapToResponseWithoutPermissions(RbacRole role) {
        if (role == null) return null;

        return RbacRoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .active(role.isActive())
                .build();
    }

    private List<RbacRoleResponse> mapToResponseList(List<RbacRole> roles) {
        if (roles == null) return Collections.emptyList();
        return roles.stream()
                .map(this::mapToResponseWithoutPermissions)
                .collect(Collectors.toList());
    }
}
