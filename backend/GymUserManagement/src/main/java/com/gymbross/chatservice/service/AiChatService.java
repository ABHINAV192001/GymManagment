package com.gymbross.chatservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.gymbross.chatservice.model.AiChatMessage;
import com.gymbross.chatservice.model.AiChatSession;
import com.gymbross.chatservice.repository.AiChatMessageRepository;
import com.gymbross.chatservice.repository.AiChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatService {

    private final AiChatSessionRepository sessionRepository;
    private final AiChatMessageRepository messageRepository;

    @Value("${nvidia.api.key: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}")
    private String apiKey;

    @Value("${nvidia.api.url:https://integrate.api.nvidia.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${nvidia.api.model:nvidia/nemotron-3-ultra-550b-a55b}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    @Transactional
    public void streamNvidiaNemotronChat(
            String rawMessage,
            String systemPrompt,
            String requestedSessionId,
            String userId,
            OutputStream outputStream
    ) {
        // 1. Validation & Input Sanitization
        if (rawMessage == null || rawMessage.trim().isEmpty()) {
            sendSseError(outputStream, "Message cannot be empty.");
            return;
        }

        String userMessage = rawMessage.trim();
        if (userMessage.length() > 4096) {
            userMessage = userMessage.substring(0, 4096);
        }

        String targetUserId = (userId != null && !userId.isBlank()) ? userId : "guest-user";

        // 2. Session creation / lookup & Database persistence for User Message
        AiChatSession session = null;
        if (requestedSessionId != null && !requestedSessionId.isBlank()) {
            session = sessionRepository.findById(requestedSessionId).orElse(null);
        }

        if (session == null) {
            String title = userMessage.length() > 30 ? userMessage.substring(0, 30) + "..." : userMessage;
            session = AiChatSession.builder()
                    .userId(targetUserId)
                    .title(title)
                    .build();
            session = sessionRepository.save(session);
        } else {
            session.setUpdatedAt(java.time.LocalDateTime.now());
            sessionRepository.save(session);
        }

        final String finalSessionId = session.getId();

        // Save User Message to DB
        AiChatMessage userDbMsg = AiChatMessage.builder()
                .sessionId(finalSessionId)
                .sender("user")
                .content(userMessage)
                .build();
        messageRepository.save(userDbMsg);

        // Notify client of the active Session ID
        sendSseEvent(outputStream, "session", objectMapper.createObjectNode().put("sessionId", finalSessionId));

        // 3. Build NVIDIA API Request Payload
        StringBuilder accumulatedContent = new StringBuilder();
        StringBuilder accumulatedReasoning = new StringBuilder();

        try {
            ObjectNode payloadNode = objectMapper.createObjectNode();
            payloadNode.put("model", model);

            ArrayNode messagesNode = payloadNode.putArray("messages");

            ObjectNode systemMsg = objectMapper.createObjectNode();
            systemMsg.put("role", "system");
            systemMsg.put("content", (systemPrompt != null && !systemPrompt.isBlank())
                    ? systemPrompt
                    : "You are GymBross AI Assistant, an expert software architecture, fitness, workout, nutrition, and gym management AI assistant.");
            messagesNode.add(systemMsg);

            // Fetch past conversation history from DB for context
            List<AiChatMessage> history = messageRepository.findBySessionIdOrderByCreatedAtAsc(finalSessionId);
            for (AiChatMessage msg : history) {
                ObjectNode histNode = objectMapper.createObjectNode();
                histNode.put("role", "user".equalsIgnoreCase(msg.getSender()) ? "user" : "assistant");
                histNode.put("content", msg.getContent());
                messagesNode.add(histNode);
            }

            payloadNode.put("temperature", 1.0);
            payloadNode.put("top_p", 0.95);
            payloadNode.put("max_tokens", 16384);
            payloadNode.put("stream", true);

            ObjectNode chatTemplateKwargs = objectMapper.createObjectNode();
            chatTemplateKwargs.put("enable_thinking", true);
            payloadNode.set("chat_template_kwargs", chatTemplateKwargs);

            String requestBodyJson = objectMapper.writeValueAsString(payloadNode);
            log.info("Sending streaming request to NVIDIA API endpoint: {} for sessionId: {}", apiUrl, finalSessionId);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Authorization", "Bearer " + apiKey.trim())
                    .header("Content-Type", "application/json")
                    .header("Accept", "text/event-stream")
                    .timeout(Duration.ofSeconds(120))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());

            if (response.statusCode() != 200) {
                String errResponseBody = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
                log.error("NVIDIA API returned error status code: {} response body: {}", response.statusCode(), errResponseBody);
                sendSseError(outputStream, "AI Service unavailable (HTTP " + response.statusCode() + ").");
                return;
            }

            // 4. Stream response and separate Reasoning vs Content
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith("data: ")) {
                        String data = line.substring(6).trim();
                        if ("[DONE]".equalsIgnoreCase(data)) {
                            break;
                        }

                        try {
                            JsonNode jsonNode = objectMapper.readTree(data);
                            JsonNode choices = jsonNode.path("choices");
                            if (choices.isArray() && choices.size() > 0) {
                                JsonNode delta = choices.get(0).path("delta");

                                // Reasoning / Thinking Trace
                                if (delta.has("reasoning_content") && !delta.path("reasoning_content").isNull()) {
                                    String reasoningChunk = delta.path("reasoning_content").asText();
                                    if (!reasoningChunk.isEmpty()) {
                                        accumulatedReasoning.append(reasoningChunk);
                                        ObjectNode node = objectMapper.createObjectNode();
                                        node.put("text", reasoningChunk);
                                        sendSseEvent(outputStream, "thinking", node);
                                    }
                                }

                                // Output Response Content
                                if (delta.has("content") && !delta.path("content").isNull()) {
                                    String contentChunk = delta.path("content").asText();
                                    if (!contentChunk.isEmpty()) {
                                        accumulatedContent.append(contentChunk);
                                        ObjectNode node = objectMapper.createObjectNode();
                                        node.put("text", contentChunk);
                                        sendSseEvent(outputStream, "content", node);
                                    }
                                }
                            }
                        } catch (Exception e) {
                            log.debug("Skipping unparseable line: {}", line);
                        }
                    }
                }
            }

            // 5. Save AI Response to Database
            String finalResponseText = accumulatedContent.toString().trim();
            if (!finalResponseText.isEmpty()) {
                AiChatMessage agentDbMsg = AiChatMessage.builder()
                        .sessionId(finalSessionId)
                        .sender("agent")
                        .content(finalResponseText)
                        .reasoning(accumulatedReasoning.toString())
                        .build();
                messageRepository.save(agentDbMsg);
            }

        } catch (Exception e) {
            log.error("Error streaming response from NVIDIA Nemotron API", e);
            sendSseError(outputStream, "Backend stream error: " + e.getMessage());
        }
    }

    public List<AiChatSession> getUserSessions(String userId) {
        String targetUserId = (userId != null && !userId.isBlank()) ? userId : "guest-user";
        return sessionRepository.findByUserIdOrderByUpdatedAtDesc(targetUserId);
    }

    public List<AiChatMessage> getSessionMessages(String sessionId) {
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @Transactional
    public void deleteSession(String sessionId) {
        messageRepository.deleteBySessionId(sessionId);
        sessionRepository.deleteById(sessionId);
    }

    private void sendSseEvent(OutputStream os, String type, JsonNode data) {
        try {
            ObjectNode evt = objectMapper.createObjectNode();
            evt.put("type", type);
            evt.set("data", data);
            String payload = "data: " + objectMapper.writeValueAsString(evt) + "\n\n";
            os.write(payload.getBytes(StandardCharsets.UTF_8));
            os.flush();
        } catch (Exception ignored) {
        }
    }

    private void sendSseError(OutputStream os, String message) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("message", message);
        sendSseEvent(os, "error", node);
    }
}
