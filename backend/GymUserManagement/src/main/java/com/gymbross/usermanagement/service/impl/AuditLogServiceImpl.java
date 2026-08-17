package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.AuditLog;
import com.gymbross.usermanagement.repository.AuditLogRepository;
import com.gymbross.usermanagement.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Async
    @Transactional
    public void logAction(UUID userId, UUID organizationId, String actionType, String description) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .organizationId(organizationId)
                    .actionType(actionType)
                    .description(description)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            System.err.println("Failed to save audit log: " + e.getMessage());
        }
    }
}
