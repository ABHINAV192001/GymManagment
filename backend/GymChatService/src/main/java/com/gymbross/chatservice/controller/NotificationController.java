package com.gymbross.chatservice.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.Gym.GymCommonServices.entity.Notification;
import com.gymbross.chatservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/notifications") // Standardized path
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(@PathVariable String username) {
        if ("undefined".equals(username) || username == null) {
            return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList()));
        }
        return ResponseEntity.ok(ApiResponse.success(notificationService.getNotifications(username)));
    }

    @GetMapping("/{username}/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable String username) {
        if ("undefined".equals(username) || username == null) {
            return ResponseEntity.ok(ApiResponse.success(0L));
        }
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount(username)));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }
}
