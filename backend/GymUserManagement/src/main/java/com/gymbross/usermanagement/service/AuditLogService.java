package com.gymbross.usermanagement.service;

import java.util.UUID;

public interface AuditLogService {
    void logAction(UUID userId, UUID organizationId, String actionType, String description);
}
