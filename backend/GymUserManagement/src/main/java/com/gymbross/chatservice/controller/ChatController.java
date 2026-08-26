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

@RestController("chatserviceChatController")
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    private void broadcastWsMessage(MessageResponse saved) {
        if (saved == null) return;

        // Push to all identifiers for receiver
        if (saved.getReceiverUsername() != null) {
            List<String> receiverIds = chatService.getAllUserIdentifiers(saved.getReceiverUsername());
            for (String rId : receiverIds) {
                messagingTemplate.convertAndSend("/topic/messages/" + rId, saved);
            }
        }

        // Push to all identifiers for sender
        if (saved.getSenderUsername() != null) {
            List<String> senderIds = chatService.getAllUserIdentifiers(saved.getSenderUsername());
            for (String sId : senderIds) {
                messagingTemplate.convertAndSend("/topic/messages/" + sId, saved);
            }
        }
    }

    // ─── WebSocket ────────────────────────────────────────────────────────────

    /** Client sends to /app/chat.send */
    @MessageMapping("/chat.send")
    public void sendMessageWs(@Payload MessageRequest request, Principal principal) {
        if (principal != null && (request.getSenderUsername() == null || request.getSenderUsername().startsWith("current-user"))) {
            request.setSenderUsername(principal.getName());
        }
        MessageResponse saved = chatService.sendMessage(request);
        broadcastWsMessage(saved);
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
        if (principal != null && (request.getSenderUsername() == null || request.getSenderUsername().startsWith("current-user"))) {
            request.setSenderUsername(principal.getName());
        }
        MessageResponse saved = chatService.sendMessage(request);
        broadcastWsMessage(saved);
        return ResponseEntity.ok(ApiResponse.success(saved, "Message sent"));
    }

    @PutMapping("/api/chat/messages/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MessageResponse>> editMessage(
            @PathVariable java.util.UUID id,
            @RequestBody MessageRequest request,
            Principal principal) {
        String name = principal != null ? principal.getName() : null;
        MessageResponse updated = chatService.editMessage(id, request.getContent(), name);
        broadcastWsMessage(updated);
        return ResponseEntity.ok(ApiResponse.success(updated, "Message updated"));
    }

    @DeleteMapping("/api/chat/messages/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable java.util.UUID id,
            Principal principal) {
        String name = principal != null ? principal.getName() : null;
        chatService.deleteMessage(id, name);
        return ResponseEntity.ok(ApiResponse.success(null, "Message deleted"));
    }

    @GetMapping("/api/chat/history/{user1}/{user2}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getHistory(
            @PathVariable String user1, @PathVariable String user2, Principal principal) {
        String u1 = user1;
        if (principal != null && ("current-user".equalsIgnoreCase(user1) || "current-user-1".equalsIgnoreCase(user1))) {
            u1 = principal.getName();
        }
        return ResponseEntity.ok(ApiResponse.success(chatService.getConversation(u1, user2)));
    }

    @GetMapping("/api/chat/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getUserHistory(
            @RequestParam String userId, Principal principal) {
        String targetId = userId;
        if (principal != null && ("current-user".equalsIgnoreCase(userId) || "current-user-1".equalsIgnoreCase(userId))) {
            targetId = principal.getName();
        }
        return ResponseEntity.ok(ApiResponse.success(chatService.getUserHistory(targetId)));
    }

    /** Returns list of all conversation partners with last message + unread count */
    @GetMapping("/api/chat/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ConversationSummary>>> getConversations(Principal principal) {
        String username = principal != null ? principal.getName() : "unknown";
        return ResponseEntity.ok(ApiResponse.success(chatService.getConversations(username)));
    }

    /** Returns active contacts for chat directory accessible to all authenticated users */
    @GetMapping("/api/chat/contacts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<com.gymbross.chatservice.dto.ChatContactDto>>> getContacts(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(chatService.getChatContacts(principal)));
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
