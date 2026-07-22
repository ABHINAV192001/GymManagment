package com.Gym.GymCommonServices.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Closes the IDOR gap where a controller takes a bare resource ID from the URL with no check
 * that the resource actually belongs to the caller's own organization. Call this immediately
 * after fetching an org-scoped entity, before returning/mutating it.
 */
@Component
public class TenantAccessGuard {

    /**
     * Org boundary is never relaxed, regardless of role - only branch-level scoping may be
     * relaxed for ORG_ADMIN/OWNER (handled by the caller, not here).
     */
    public void assertOwnedByOrg(UUID resourceOrgId, UUID callerOrgId) {
        if (resourceOrgId == null || callerOrgId == null || !resourceOrgId.equals(callerOrgId)) {
            throw new AccessDeniedException("Resource does not belong to your organization");
        }
    }

    public void assertOwnedByBranch(UUID resourceBranchId, UUID callerBranchId) {
        if (resourceBranchId == null || callerBranchId == null || !resourceBranchId.equals(callerBranchId)) {
            throw new AccessDeniedException("Resource does not belong to your branch");
        }
    }
}
