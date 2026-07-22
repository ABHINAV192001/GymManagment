package com.Gym.GymCommonServices.security;

import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

/**
 * Reads the organizationId/branchId that JwtAuthenticationFilter already extracted from the
 * validated JWT and stashed as request attributes - i.e. the caller's own tenant context,
 * never a client-supplied header. Used by TenantAccessGuard to check resource ownership.
 */
@Component
public class CurrentTenantResolver {

    public UUID getOrganizationId() {
        return (UUID) getAttribute("organizationId");
    }

    public UUID getBranchId() {
        return (UUID) getAttribute("branchId");
    }

    private Object getAttribute(String name) {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (!(attrs instanceof ServletRequestAttributes servletAttrs)) {
            return null;
        }
        return servletAttrs.getRequest().getAttribute(name);
    }
}
