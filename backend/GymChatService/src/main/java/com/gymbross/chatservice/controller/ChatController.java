package com.gymbross.chatservice.controller;

import com.gymbross.chatservice.dto.MessageRequest;
import com.gymbross.chatservice.dto.MessageResponse;
import com.gymbross.chatservice.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    // WebSocket: Send message
    // Client sends to /app/send
    @MessageMapping("/send")
    public void sendMessage(@Payload MessageRequest request) {
        MessageResponse saved = chatService.sendMessage(request);

        // Send to receiver's private topic
        // Client subscribes to /topic/messages/{username}
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getReceiverUsername(), saved);

        // Also send back to sender for their UI (optional, or they optimistic update)
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getSenderUsername(), saved);
    }

    // REST: Send Message (Compatible with frontend apiPost)
    @PostMapping("/api/chat/send")
    public MessageResponse sendMessageRest(@RequestBody MessageRequest request) {
        MessageResponse saved = chatService.sendMessage(request);

        // Send to receiver's private topic (Real-time update)
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getReceiverUsername(), saved);

        // Also send back to sender for their UI
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getSenderUsername(), saved);

        return saved;
    }

    // REST: Get History
    @GetMapping("/api/messages/{user1}/{user2}")
    public List<MessageResponse> getHistory(@PathVariable String user1, @PathVariable String user2) {
        return chatService.getConversation(user1, user2);
    }

    @GetMapping("/api/chat/history")
    public List<MessageResponse> getUserHistory(@RequestParam String userId) {
        return chatService.getUserHistory(userId);
    }

    @GetMapping("/api/chat/test")
    public String test() {
        return "Chat Service is up and running!";
    }
}
