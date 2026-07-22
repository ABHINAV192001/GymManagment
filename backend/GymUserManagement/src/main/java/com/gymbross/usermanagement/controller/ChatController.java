package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.entity.Message;
import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor

public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send")
    @PreAuthorize("hasAuthority('CHAT:SEND')")
    public ResponseEntity<ApiResponse<Message>> sendMessage(@RequestBody Map<String, String> payload) {
        String senderId = payload.get("senderId");
        String receiverId = payload.get("receiverId");
        String senderRole = payload.get("senderRole");
        String content = payload.get("content");

        Message savedMsg = chatService.sendMessage(senderId, receiverId, senderRole, content);
        return ResponseEntity.ok(ApiResponse.success(savedMsg, "Message sent"));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAuthority('CHAT:VIEW')")
    public ResponseEntity<ApiResponse<List<Message>>> getHistory(
            @RequestParam(required = false) String userId,
            org.springframework.security.core.Authentication authentication) {
        
        String targetUserId = userId;
        if (targetUserId == null || targetUserId.isBlank()) {
            if (authentication != null && authentication.getPrincipal() instanceof com.Gym.GymCommonServices.entity.User user) {
                targetUserId = user.getId().toString();
            } else if (authentication != null) {
                targetUserId = authentication.getName();
            }
        }

        if (targetUserId == null || targetUserId.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList()));
        }

        return ResponseEntity.ok(ApiResponse.success(chatService.getUserHistory(targetUserId)));
    }

    @PostMapping("/mark-read")
    @PreAuthorize("hasAuthority('CHAT:VIEW')")
    public ResponseEntity<ApiResponse<Void>> markRead(@RequestBody Map<String, String> payload) {
        String receiverId = payload.get("receiverId");
        String senderId = payload.get("senderId");
        chatService.markAsRead(receiverId, senderId);
        return ResponseEntity.ok(ApiResponse.success(null, "Messages marked as read"));
    }
}
