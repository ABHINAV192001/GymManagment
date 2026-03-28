package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.entity.Message;
import com.gymbross.usermanagement.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Map<String, String> payload) {
        String senderId = payload.get("senderId");
        String receiverId = payload.get("receiverId");
        String senderRole = payload.get("senderRole");
        String content = payload.get("content");

        Message savedMsg = chatService.sendMessage(senderId, receiverId, senderRole, content);
        return ResponseEntity.ok(savedMsg);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Message>> getHistory(@RequestParam String userId) {
        // We will assume a service method exists or add it.
        // For simplicity, let's just use the repository directly if service is missing
        // it,
        // but better to add to service.
        return ResponseEntity.ok(chatService.getUserHistory(userId));
    }

    @PostMapping("/mark-read")
    public ResponseEntity<Void> markRead(@RequestBody Map<String, String> payload) {
        String receiverId = payload.get("receiverId");
        String senderId = payload.get("senderId");
        chatService.markAsRead(receiverId, senderId);
        return ResponseEntity.ok().build();
    }
}
