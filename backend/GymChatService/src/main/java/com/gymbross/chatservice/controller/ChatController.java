package com.gymbross.chatservice.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.chatservice.dto.MessageRequest;
import com.gymbross.chatservice.dto.MessageResponse;
import com.gymbross.chatservice.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    // WebSocket: Send message (Client sends to /app/send)
    @MessageMapping("/send")
    public void sendMessage(@Payload MessageRequest request) {
        MessageResponse saved = chatService.sendMessage(request);

        // Send to receiver's private topic
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getReceiverUsername(), saved);

        // Also send back to sender for their UI
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getSenderUsername(), saved);
    }

    // REST: Send Message (Compatible with frontend apiPost)
    @PostMapping("/api/chat/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessageRest(@RequestBody MessageRequest request) {
        MessageResponse saved = chatService.sendMessage(request);

        // Send to receiver's private topic (Real-time update)
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getReceiverUsername(), saved);

        // Also send back to sender for their UI
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getSenderUsername(), saved);

        return ResponseEntity.ok(ApiResponse.success(saved, "Message sent"));
    }

    // REST: Get History
    @GetMapping("/api/chat/history/{user1}/{user2}") // Standardized path
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getHistory(@PathVariable String user1, @PathVariable String user2) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getConversation(user1, user2)));
    }

    @GetMapping("/api/chat/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getUserHistory(@RequestParam String userId) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getUserHistory(userId)));
    }

    @GetMapping("/api/chat/test")
    public ResponseEntity<ApiResponse<String>> test() {
        return ResponseEntity.ok(ApiResponse.success("Chat Service is up and running!"));
    }
}
