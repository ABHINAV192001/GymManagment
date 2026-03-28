package com.gymbross.chatservice.controller;

import com.Gym.GymCommonServices.entity.Notification;
import com.gymbross.chatservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{username}")
    public List<Notification> getNotifications(@PathVariable String username) {
        return notificationService.getNotifications(username);
    }

    @GetMapping("/{username}/unread-count")
    public long getUnreadCount(@PathVariable String username) {
        return notificationService.getUnreadCount(username);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }
}
