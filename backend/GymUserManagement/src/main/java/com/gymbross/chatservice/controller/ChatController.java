package com.gymbross.chatservice.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.chatservice.dto.ConversationSummary;
import com.gymbross.chatservice.dto.MessageRequest;
import com.gymbross.chatservice.dto.MessageResponse;
import com.gymbross.chatservice.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    // ─── WebSocket ────────────────────────────────────────────────────────────

    /** Client sends to /app/chat.send */
    @MessageMapping("/chat.send")
    public void sendMessageWs(@Payload MessageRequest request, Principal principal) {
        // Use authenticated username as sender
        if (principal != null && request.getSenderUsername() == null) {
            request.setSenderUsername(principal.getName());
        }
        MessageResponse saved = chatService.sendMessage(request);
        // Push to receiver
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getReceiverUsername(), saved);
        // Push back to sender
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getSenderUsername(), saved);
    }

    /** Client sends to /app/chat.read to mark a conversation as read */
    @MessageMapping("/chat.read")
    public void markReadWs(@Payload MessageRequest request, Principal principal) {
        if (principal == null) return;
        chatService.markConversationRead(principal.getName(), request.getSenderUsername());
    }

    // ─── REST ─────────────────────────────────────────────────────────────────

    @PostMapping("/api/chat/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessageRest(
            @RequestBody MessageRequest request, Principal principal) {
        if (principal != null && request.getSenderUsername() == null) {
            request.setSenderUsername(principal.getName());
        }
        MessageResponse saved = chatService.sendMessage(request);
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getReceiverUsername(), saved);
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getSenderUsername(), saved);
        return ResponseEntity.ok(ApiResponse.success(saved, "Message sent"));
    }

    @GetMapping("/api/chat/history/{user1}/{user2}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getHistory(
            @PathVariable String user1, @PathVariable String user2) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getConversation(user1, user2)));
    }

    @GetMapping("/api/chat/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getUserHistory(@RequestParam String userId) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getUserHistory(userId)));
    }

    /** Returns list of all conversation partners with last message + unread count */
    @GetMapping("/api/chat/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ConversationSummary>>> getConversations(Principal principal) {
        String username = principal != null ? principal.getName() : "unknown";
        return ResponseEntity.ok(ApiResponse.success(chatService.getConversations(username)));
    }

    /** Mark all messages in a conversation as read */
    @PostMapping("/api/chat/mark-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @RequestParam String senderUsername, Principal principal) {
        if (principal != null) {
            chatService.markConversationRead(principal.getName(), senderUsername);
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Marked as read"));
    }

    @GetMapping("/api/chat/test")
    public ResponseEntity<ApiResponse<String>> test() {
        return ResponseEntity.ok(ApiResponse.success("Chat Service is up and running!"));
    }
}
