package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.entity.NotificationLog;
import com.gymbross.usermanagement.entity.NotificationTemplate;
import com.gymbross.usermanagement.repository.NotificationLogRepository;
import com.gymbross.usermanagement.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationTemplateRepository templateRepository;
    private final NotificationLogRepository logRepository;

    @GetMapping("/templates")
    @PreAuthorize("hasAuthority('NOTIFICATIONS:VIEW')")
    public ResponseEntity<ApiResponse<List<NotificationTemplate>>> getTemplates(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.paginated(templateRepository.findAll(), page, size));
    }

    @PostMapping("/templates")
    @PreAuthorize("hasAuthority('NOTIFICATIONS:CREATE')")
    public ResponseEntity<ApiResponse<NotificationTemplate>> createTemplate(@RequestBody NotificationTemplate template) {
        template.setActive(true);
        return ResponseEntity.ok(ApiResponse.success(templateRepository.save(template), "Template created successfully"));
    }

    @GetMapping("/templates/{id}")
    @PreAuthorize("hasAuthority('NOTIFICATIONS:VIEW')")
    public ResponseEntity<ApiResponse<NotificationTemplate>> getTemplateById(@PathVariable UUID id) {
        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        return ResponseEntity.ok(ApiResponse.success(template));
    }

    @PutMapping("/templates/{id}")
    @PreAuthorize("hasAuthority('NOTIFICATIONS:CREATE')")
    public ResponseEntity<ApiResponse<NotificationTemplate>> updateTemplate(
            @PathVariable UUID id, @RequestBody NotificationTemplate details) {
        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));

        template.setName(details.getName());
        template.setContent(details.getContent());
        template.setChannel(details.getChannel());
        template.setActive(details.isActive());

        return ResponseEntity.ok(ApiResponse.success(templateRepository.save(template), "Template updated successfully"));
    }

    @DeleteMapping("/templates/{id}")
    @PreAuthorize("hasAuthority('NOTIFICATIONS:CREATE')")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(@PathVariable UUID id) {
        NotificationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        templateRepository.delete(template);
        return ResponseEntity.ok(ApiResponse.success(null, "Template deleted successfully"));
    }

    @PostMapping("/send")
    @PreAuthorize("hasAuthority('NOTIFICATIONS:SEND')")
    public ResponseEntity<ApiResponse<Object>> sendNotification(@RequestBody Map<String, Object> request) {
        String channel = (String) request.getOrDefault("channel", "WHATSAPP");
        String content = (String) request.get("content");
        String targetRole = (String) request.get("targetRole");
        
        UUID templateId = null;
        if (request.containsKey("templateId") && request.get("templateId") != null) {
            try {
                templateId = UUID.fromString((String) request.get("templateId"));
            } catch (Exception e) {}
        }

        List<String> recipients = new ArrayList<>();
        if (request.containsKey("recipients") && request.get("recipients") != null) {
            recipients = (List<String>) request.get("recipients");
        }
        if (request.containsKey("individualNumber") && request.get("individualNumber") != null) {
            String num = (String) request.get("individualNumber");
            if (!num.isEmpty() && !recipients.contains(num)) {
                recipients.add(num);
            }
        }

        if (recipients.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No recipients provided", 400));
        }

        List<NotificationLog> logs = new ArrayList<>();
        for (String recipient : recipients) {
            NotificationLog logEntry = NotificationLog.builder()
                    .templateId(templateId)
                    .recipient(recipient)
                    .channel(channel)
                    .content(content)
                    .targetRole(targetRole)
                    .status("SENT")
                    .createdAt(Instant.now())
                    .build();
            logs.add(logEntry);
        }

        logs = logRepository.saveAll(logs);
        return ResponseEntity.ok(ApiResponse.success(logs, "Notifications sent successfully"));
    }

    @PostMapping("/schedule")
    @PreAuthorize("hasAuthority('NOTIFICATIONS:SEND')")
    public ResponseEntity<ApiResponse<Object>> scheduleNotification(@RequestBody Map<String, Object> request) {
        String channel = (String) request.getOrDefault("channel", "WHATSAPP");
        String content = (String) request.get("content");
        String targetRole = (String) request.get("targetRole");
        
        UUID templateId = null;
        if (request.containsKey("templateId") && request.get("templateId") != null) {
            try {
                templateId = UUID.fromString((String) request.get("templateId"));
            } catch (Exception e) {}
        }

        List<String> recipients = new ArrayList<>();
        if (request.containsKey("recipients") && request.get("recipients") != null) {
            recipients = (List<String>) request.get("recipients");
        }
        if (request.containsKey("individualNumber") && request.get("individualNumber") != null) {
            String num = (String) request.get("individualNumber");
            if (!num.isEmpty() && !recipients.contains(num)) {
                recipients.add(num);
            }
        }

        if (recipients.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No recipients provided", 400));
        }

        List<NotificationLog> logs = new ArrayList<>();
        for (String recipient : recipients) {
            NotificationLog logEntry = NotificationLog.builder()
                    .templateId(templateId)
                    .recipient(recipient)
                    .channel(channel)
                    .content(content)
                    .targetRole(targetRole)
                    .status("PENDING")
                    .createdAt(Instant.now())
                    .build();
            logs.add(logEntry);
        }

        logs = logRepository.saveAll(logs);
        return ResponseEntity.ok(ApiResponse.success(logs, "Notifications scheduled successfully"));
    }

    @GetMapping("/logs")
    @PreAuthorize("hasAuthority('NOTIFICATIONS:VIEW')")
    public ResponseEntity<ApiResponse<List<NotificationLog>>> getLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.paginated(logRepository.findAll(), page, size));
    }

    @GetMapping("/logs/{id}")
    @PreAuthorize("hasAuthority('NOTIFICATIONS:VIEW')")
    public ResponseEntity<ApiResponse<NotificationLog>> getLogById(@PathVariable UUID id) {
        NotificationLog log = logRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Log not found"));
        return ResponseEntity.ok(ApiResponse.success(log));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('NOTIFICATIONS:VIEW')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        List<NotificationLog> logs = logRepository.findAll();
        long total = logs.size();
        long sent = logs.stream().filter(l -> "SENT".equalsIgnoreCase(l.getStatus())).count();
        long failed = logs.stream().filter(l -> "FAILED".equalsIgnoreCase(l.getStatus())).count();
        long pending = logs.stream().filter(l -> "PENDING".equalsIgnoreCase(l.getStatus())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalNotifications", total);
        stats.put("sentCount", sent);
        stats.put("failedCount", failed);
        stats.put("pendingCount", pending);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping("/test")
    @PreAuthorize("hasAuthority('NOTIFICATIONS:SEND')")
    public ResponseEntity<ApiResponse<String>> testSend() {
        return ResponseEntity.ok(ApiResponse.success("Test notification triggered successfully over log channels"));
    }
}
