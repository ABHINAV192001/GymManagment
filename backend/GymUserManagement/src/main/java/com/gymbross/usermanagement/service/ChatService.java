package com.gymbross.usermanagement.service;

import com.Gym.GymCommonServices.entity.Message;
import com.gymbross.usermanagement.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;

    public Message sendMessage(String senderId, String receiverId, String senderRole, String content) {
        Message message = Message.builder()
                .senderId(senderId)
                .receiverId(receiverId)
                .senderRole(senderRole)
                .content(content)
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();
        return messageRepository.save(message);
    }

    public java.util.List<Message> getConversation(String user1, String user2) {
        return messageRepository.findConversation(user1, user2);
    }

    public java.util.List<Message> getUserHistory(String userId) {
        return messageRepository.findAllMessagesForUser(userId);
    }

    public void markAsRead(String receiverId, String senderId) {
        messageRepository.markMessagesAsRead(receiverId, senderId);
    }
}
