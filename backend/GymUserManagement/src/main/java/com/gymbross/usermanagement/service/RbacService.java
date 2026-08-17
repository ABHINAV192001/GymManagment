package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.entity.RbacRole;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface RbacService {
    List<RbacRole> getRoles(UUID orgId);
    RbacRole createRole(RbacRole role, UUID orgId);
    RbacRole getRoleById(UUID id, UUID orgId);
    RbacRole updateRole(UUID id, RbacRole role, UUID orgId);
    void deleteRole(UUID id, UUID orgId);
    RbacRole setRolePermissions(UUID id, Set<String> permissions, UUID orgId);
    Set<String> getAllAvailablePermissions();
    void assignRoleToStaff(UUID staffId, UUID roleId, UUID orgId);
    void removeRoleFromStaff(UUID staffId, UUID roleId, UUID orgId);
    Set<String> getEffectivePermissionsForStaff(UUID staffId);
    Set<String> getPermissionsForRole(UUID roleId);
}
