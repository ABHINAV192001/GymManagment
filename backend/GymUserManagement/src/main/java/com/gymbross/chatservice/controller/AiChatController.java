package com.gymbross.chatservice.controller;

import com.gymbross.chatservice.dto.AiChatRequest;
import com.gymbross.chatservice.model.AiChatMessage;
import com.gymbross.chatservice.model.AiChatSession;
import com.gymbross.chatservice.service.AiChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.util.List;

@RestController
@RequestMapping("/api/ai-chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<StreamingResponseBody> streamAiChat(
            @RequestBody AiChatRequest request,
            Authentication authentication
    ) {
        String userId = (authentication != null && authentication.getName() != null)
                ? authentication.getName()
                : (request.getUserId() != null ? request.getUserId() : "guest-user");

        log.info("Received AI stream request for user: {} agentId: {} sessionId: {}",
                userId, request.getAgentId(), request.getSessionId());

        StreamingResponseBody stream = outputStream -> {
            aiChatService.streamNvidiaNemotronChat(
                    request.getMessage(),
                    request.getSystemPrompt(),
                    request.getSessionId(),
                    userId,
                    outputStream
            );
        };

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(stream);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<AiChatSession>> getUserSessions(
            @RequestParam(required = false) String userId,
            Authentication authentication
    ) {
        String targetUserId = (authentication != null && authentication.getName() != null)
                ? authentication.getName()
                : (userId != null ? userId : "guest-user");
        return ResponseEntity.ok(aiChatService.getUserSessions(targetUserId));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<AiChatMessage>> getSessionMessages(@PathVariable String sessionId) {
        return ResponseEntity.ok(aiChatService.getSessionMessages(sessionId));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable String sessionId) {
        aiChatService.deleteSession(sessionId);
        return ResponseEntity.noContent().build();
    }
}
