package com.gymbross.chatservice.service;

import com.Gym.GymCommonServices.entity.Notification;
import com.gymbross.chatservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Notification createNotification(String recipient, String sender, String content, String type,
            String actionLink) {
        Notification notification = Notification.builder()
                .recipientUsername(recipient)
                .senderUsername(sender)
                .content(content)
                .type(type)
                .actionLink(actionLink)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        System.out.println("DEBUG: Notification saved to DB for: " + recipient);

        // Push notification via WebSocket
        String topic = "/topic/notifications/" + recipient;
        System.out.println("DEBUG: Pushing to WebSocket topic: " + topic);
        messagingTemplate.convertAndSend(topic, saved);

        return saved;
    }

    public List<Notification> getNotifications(String username) {
        return notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(username);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    public long getUnreadCount(String username) {
        return notificationRepository.countByRecipientUsernameAndIsReadFalse(username);
    }
}
