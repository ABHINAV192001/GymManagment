package com.gymbross.chatservice.service;

import com.gymbross.chatservice.dto.ConversationSummary;
import com.gymbross.chatservice.dto.MessageRequest;
import com.gymbross.chatservice.dto.MessageResponse;
import com.gymbross.chatservice.model.ChatMessage;
import com.gymbross.chatservice.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatMessageRepository messageRepository;

    @Override
    public MessageResponse sendMessage(MessageRequest request) {
        ChatMessage message = new ChatMessage();
        message.setSenderUsername(request.getSenderUsername());
        message.setReceiverUsername(request.getReceiverUsername());
        message.setContent(request.getContent());
        message.setRead(false);
        message.setTimestamp(LocalDateTime.now());

        ChatMessage savedMessage = messageRepository.save(message);
        return mapToResponse(savedMessage);
    }

    @Override
    public List<MessageResponse> getConversation(String user1, String user2) {
        return messageRepository.findConversation(user1, user2)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<MessageResponse> getUserHistory(String username) {
        return messageRepository.findBySenderUsernameOrReceiverUsernameOrderByTimestampDesc(username, username)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<ConversationSummary> getConversations(String username) {
        List<ChatMessage> all = messageRepository.findBySenderUsernameOrReceiverUsernameOrderByTimestampDesc(username, username);

        // Group by conversation partner
        Map<String, List<ChatMessage>> grouped = new LinkedHashMap<>();
        for (ChatMessage msg : all) {
            String partner = msg.getSenderUsername().equals(username)
                    ? msg.getReceiverUsername()
                    : msg.getSenderUsername();
            grouped.computeIfAbsent(partner, k -> new ArrayList<>()).add(msg);
        }

        return grouped.entrySet().stream().map(entry -> {
            String partner = entry.getKey();
            List<ChatMessage> msgs = entry.getValue();
            ChatMessage last = msgs.get(0); // already ordered by timestamp DESC
            long unread = msgs.stream().filter(m -> m.getReceiverUsername().equals(username) && !m.isRead()).count();
            return new ConversationSummary(partner, last.getContent(), last.getTimestamp(), unread);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markConversationRead(String readerUsername, String senderUsername) {
        List<ChatMessage> unread = messageRepository.findConversation(senderUsername, readerUsername)
                .stream()
                .filter(m -> m.getReceiverUsername().equals(readerUsername) && !m.isRead())
                .collect(Collectors.toList());

        LocalDateTime now = LocalDateTime.now();
        unread.forEach(m -> {
            m.setRead(true);
            m.setReadAt(now);
        });
        messageRepository.saveAll(unread);
    }

    private MessageResponse mapToResponse(ChatMessage message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setSenderUsername(message.getSenderUsername());
        response.setReceiverUsername(message.getReceiverUsername());
        response.setContent(message.getContent());
        response.setTimestamp(message.getTimestamp());
        response.setRead(message.isRead());
        response.setReadAt(message.getReadAt());
        return response;
    }
}
