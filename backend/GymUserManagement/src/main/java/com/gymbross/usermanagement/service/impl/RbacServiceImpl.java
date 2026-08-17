package com.gymbross.usermanagement.service.impl;

import com.gymbross.usermanagement.entity.Permission;
import com.gymbross.usermanagement.entity.RbacRole;
import com.gymbross.usermanagement.entity.RolePermission;
import com.gymbross.usermanagement.entity.StaffRoleAssignment;
import com.gymbross.usermanagement.repository.PermissionRepository;
import com.gymbross.usermanagement.repository.RbacRoleRepository;
import com.gymbross.usermanagement.repository.RolePermissionRepository;
import com.gymbross.usermanagement.repository.StaffRoleAssignmentRepository;
import com.gymbross.usermanagement.service.RbacService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RbacServiceImpl implements RbacService {

    private final RbacRoleRepository rbacRoleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final StaffRoleAssignmentRepository staffRoleAssignmentRepository;
    private final com.gymbross.usermanagement.repository.UserRepository userRepository;
    private final jakarta.persistence.EntityManager entityManager;
    
    @Override
    @Transactional
    public List<RbacRole> getRoles(UUID orgId) {
        if (orgId != null && rbacRoleRepository.findByNameAndOrgId("EMPLOYEE", orgId).isEmpty()) {
            RbacRole employeeRole = RbacRole.builder()
                    .name("EMPLOYEE")
                    .orgId(orgId)
                    .isActive(true)
                    .isDeleted(false)
                    .build();
            rbacRoleRepository.save(employeeRole);
        }
        List<RbacRole> rawRoles = rbacRoleRepository.findByOrgIdOrOrgIdIsNull(orgId).stream()
                .filter(role -> !role.isDeleted())
                .filter(role -> !"ORG_ADMIN".equalsIgnoreCase(role.getName()))
                .collect(Collectors.toList());

        java.util.Map<String, RbacRole> uniqueRoles = new java.util.LinkedHashMap<>();
        for (RbacRole r : rawRoles) {
            if (r.getName() == null || r.getName().trim().isEmpty()) continue;
            String key = r.getName().trim().toUpperCase();
            if (!uniqueRoles.containsKey(key) || (r.getOrgId() != null && uniqueRoles.get(key).getOrgId() == null)) {
                uniqueRoles.put(key, r);
            }
        }
        return new java.util.ArrayList<>(uniqueRoles.values());
    }

    @Override
    @Transactional
    public RbacRole createRole(RbacRole role, UUID orgId) {
        role.setOrgId(orgId);
        if (rbacRoleRepository.findByNameAndOrgId(role.getName(), orgId).isPresent()) {
            throw new IllegalArgumentException("Role with name " + role.getName() + " already exists in this organization");
        }
        return rbacRoleRepository.save(role);
    }

    @Override
    public RbacRole getRoleById(UUID id, UUID orgId) {
        RbacRole role = rbacRoleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with ID: " + id));
        if (role.getOrgId() != null && !role.getOrgId().equals(orgId)) {
            throw new IllegalArgumentException("Role not found with ID: " + id);
        }
        return role;
    }

    @Override
    @Transactional
    public RbacRole updateRole(UUID id, RbacRole roleDetails, UUID orgId) {
        RbacRole existingRole = getRoleById(id, orgId);
        
        if (existingRole.getOrgId() == null) {
            // System role
            roleDetails.setName(existingRole.getName());
        } else if (!existingRole.getName().equals(roleDetails.getName())) {
            if (rbacRoleRepository.findByNameAndOrgId(roleDetails.getName(), orgId).isPresent()) {
                throw new IllegalArgumentException("Role with name " + roleDetails.getName() + " already exists in this organization");
            }
            existingRole.setName(roleDetails.getName());
        }

        existingRole.setActive(roleDetails.isActive());
        return rbacRoleRepository.save(existingRole);
    }

    @Override
    @Transactional
    public void deleteRole(UUID id, UUID orgId) {
        RbacRole role = getRoleById(id, orgId);
        if (role.getOrgId() == null) {
            throw new IllegalArgumentException("Cannot delete system roles");
        }
        
        role.setDeleted(true);
        rbacRoleRepository.save(role);
        
        // Remove staff assignments for this role
        List<StaffRoleAssignment> assignments = staffRoleAssignmentRepository.findByRoleId(id);
        staffRoleAssignmentRepository.deleteAll(assignments);
        
        // Remove role permissions
        rolePermissionRepository.deleteByRoleId(id);
    }

    @Override
    @Transactional
    public RbacRole setRolePermissions(UUID id, Set<String> permissions, UUID orgId) {
        RbacRole role = getRoleById(id, orgId);
        
        if (role.getOrgId() == null) {
             throw new IllegalArgumentException("Cannot edit system roles");
        }
        
        rolePermissionRepository.deleteByRoleId(id);
        rolePermissionRepository.flush();
        
        if (permissions != null) {
            for (String permString : permissions) {
                if (permString == null || permString.trim().isEmpty()) continue;
                String normalized = permString.trim();
                
                Permission perm = permissionRepository.findBySubModuleIgnoreCase(normalized)
                        .orElseGet(() -> {
                            String[] parts = normalized.split(":");
                            String moduleName = parts.length > 0 ? parts[0].toUpperCase() : "GENERAL";
                            String subMod = normalized.toUpperCase();
                            String desc = parts.length > 1 
                                    ? parts[1].substring(0, 1).toUpperCase() + parts[1].substring(1).toLowerCase() 
                                    : normalized;
                                    
                            return permissionRepository.save(Permission.builder()
                                    .module(moduleName)
                                    .subModule(subMod)
                                    .description(desc)
                                    .isActive(true)
                                    .createDate(java.time.LocalDateTime.now())
                                    .build());
                        });
                
                rolePermissionRepository.save(RolePermission.builder()
                        .roleId(role.getId())
                        .permissionId(perm.getId())
                        .build());
            }
        }
        
        return role;
    }

    @Override
    public Set<String> getAllAvailablePermissions() {
        Set<String> perms = permissionRepository.findAll().stream()
                .filter(Permission::isActive)
                .map(Permission::getSubModule)
                .collect(Collectors.toSet());
        
        List<String> defaultAllModulePerms = List.of(
            "DASHBOARD:VIEW", "DASHBOARD:EXPORT",
            "MEMBER_PORTAL:VIEW", "MEMBER_PORTAL:CREATE", "MEMBER_PORTAL:EDIT", "MEMBER_PORTAL:DELETE", "MEMBER_PORTAL:EXPORT",
            "BRANCHES:VIEW", "BRANCHES:CREATE", "BRANCHES:EDIT", "BRANCHES:DELETE", "BRANCHES:EXPORT",
            "USERS:VIEW", "USERS:CREATE", "USERS:EDIT", "USERS:DELETE", "USERS:EXPORT",
            "STAFF:VIEW", "STAFF:CREATE", "STAFF:EDIT", "STAFF:DELETE", "STAFF:EXPORT", "STAFF:ASSIGN",
            "PLANS:VIEW", "PLANS:CREATE", "PLANS:EDIT", "PLANS:DELETE", "PLANS:EXPORT",
            "ACCOUNTS:VIEW", "ACCOUNTS:CREATE", "ACCOUNTS:EDIT", "ACCOUNTS:DELETE", "ACCOUNTS:EXPORT",
            "INVENTORY:VIEW", "INVENTORY:CREATE", "INVENTORY:EDIT", "INVENTORY:DELETE", "INVENTORY:EXPORT",
            "ACTIVITY:VIEW", "ACTIVITY:CREATE", "ACTIVITY:EDIT", "ACTIVITY:DELETE", "ACTIVITY:EXPORT", "ACTIVITY:ASSIGN", "ACTIVITY:BOOKSPOT",
            "WORKOUT:VIEW", "WORKOUT:CREATE", "WORKOUT:EDIT", "WORKOUT:DELETE", "WORKOUT:EXPORT", "WORKOUT:ASSIGN",
            "DIET:VIEW", "DIET:CREATE", "DIET:EDIT", "DIET:DELETE", "DIET:EXPORT", "DIET:ASSIGN",
            "ATTENDANCE:VIEW", "ATTENDANCE:CREATE", "ATTENDANCE:EDIT", "ATTENDANCE:DELETE", "ATTENDANCE:EXPORT",
            "NOTIFICATIONS:VIEW", "NOTIFICATIONS:CREATE", "NOTIFICATIONS:EDIT", "NOTIFICATIONS:DELETE", "NOTIFICATIONS:EXPORT", "NOTIFICATIONS:SEND",
            "CHAT:VIEW", "CHAT:CREATE", "CHAT:EDIT", "CHAT:DELETE", "CHAT:EXPORT", "CHAT:SEND",
            "RBAC:VIEW", "RBAC:CREATE", "RBAC:EDIT", "RBAC:DELETE", "RBAC:EXPORT",
            "SETTINGS:VIEW", "SETTINGS:CREATE", "SETTINGS:EDIT", "SETTINGS:DELETE", "SETTINGS:EXPORT",
            "CRM:VIEW", "CRM:CREATE", "CRM:EDIT", "CRM:DELETE", "CRM:EXPORT", "CRM:ASSIGN",
            "ROSTER:VIEW", "ROSTER:CREATE", "ROSTER:EDIT", "ROSTER:DELETE", "ROSTER:EXPORT", "ROSTER:ASSIGN",
            "POS:VIEW", "POS:CREATE", "POS:EDIT", "POS:DELETE", "POS:EXPORT", "POS:CHECKOUT", "POS:REFUND"
        );

        for (String subMod : defaultAllModulePerms) {
            if (!perms.contains(subMod)) {
                perms.add(subMod);
                if (permissionRepository.findBySubModuleIgnoreCase(subMod).isEmpty()) {
                    String[] parts = subMod.split(":");
                    String desc = parts.length > 1 ? parts[1].substring(0, 1) + parts[1].substring(1).toLowerCase() : subMod;
                    permissionRepository.save(Permission.builder()
                            .module(parts[0])
                            .subModule(subMod)
                            .description(desc)
                            .isActive(true)
                            .createDate(java.time.LocalDateTime.now())
                            .build());
                }
            }
        }
        return perms;
    }

    @Override
    @Transactional
    public void assignRoleToStaff(UUID staffId, UUID roleId, UUID orgId) {
        getRoleById(roleId, orgId);
        com.Gym.GymCommonServices.entity.User user = userRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("User member not found with ID: " + staffId));

        if (user.getOrganization() == null || !user.getOrganization().getId().equals(orgId)) {
             throw new IllegalArgumentException("User member not found with ID: " + staffId);
        }

        Optional<StaffRoleAssignment> existing = staffRoleAssignmentRepository.findByStaffIdAndRoleId(staffId, roleId);
        if (existing.isEmpty()) {
            StaffRoleAssignment assignment = StaffRoleAssignment.builder()
                    .staffId(staffId)
                    .roleId(roleId)
                    .build();
            staffRoleAssignmentRepository.save(assignment);
        }

        // user_roles is what authentication reads (User.getAuthorities / JWT claims),
        // so the assignment must land there too or it never takes effect.
        user.getRoles().add(entityManager.getReference(
                com.Gym.GymCommonServices.entity.RbacRole.class, roleId));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void removeRoleFromStaff(UUID staffId, UUID roleId, UUID orgId) {
        com.Gym.GymCommonServices.entity.User user = userRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("User member not found with ID: " + staffId));

        if (user.getOrganization() == null || !user.getOrganization().getId().equals(orgId)) {
             throw new IllegalArgumentException("User member not found with ID: " + staffId);
        }
        
        Optional<StaffRoleAssignment> existing = staffRoleAssignmentRepository.findByStaffIdAndRoleId(staffId, roleId);
        existing.ifPresent(staffRoleAssignmentRepository::delete);

        user.getRoles().removeIf(r -> r.getId().equals(roleId));
        userRepository.save(user);
    }

    @Override
    public Set<String> getEffectivePermissionsForStaff(UUID staffId) {
        userRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("User member not found with ID: " + staffId));

        List<StaffRoleAssignment> assignments = staffRoleAssignmentRepository.findByStaffId(staffId);
        Set<String> effectivePermissions = new HashSet<>();
        for (StaffRoleAssignment assignment : assignments) {
            rbacRoleRepository.findById(assignment.getRoleId())
                    .filter(RbacRole::isActive)
                    .filter(r -> !r.isDeleted())
                    .ifPresent(role -> {
                        List<RolePermission> rps = rolePermissionRepository.findByRoleId(role.getId());
                        for (RolePermission rp : rps) {
                            permissionRepository.findById(rp.getPermissionId())
                                .ifPresent(p -> effectivePermissions.add(p.getSubModule()));
                        }
                    });
        }
        return effectivePermissions;
    }

    @Override
    public Set<String> getPermissionsForRole(UUID roleId) {
        Set<String> permissions = new HashSet<>();
        List<RolePermission> rps = rolePermissionRepository.findByRoleId(roleId);
        for (RolePermission rp : rps) {
            permissionRepository.findById(rp.getPermissionId())
                    .ifPresent(p -> permissions.add(p.getSubModule()));
        }
        return permissions;
    }
}
