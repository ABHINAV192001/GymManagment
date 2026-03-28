package com.gymbross.chatservice.service;

import com.gymbross.chatservice.dto.MessageRequest;
import com.gymbross.chatservice.dto.MessageResponse;
import com.gymbross.chatservice.model.ChatMessage;
import com.gymbross.chatservice.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private MessageRepository messageRepository;

    @Override
    public MessageResponse sendMessage(MessageRequest request) {
        ChatMessage message = new ChatMessage();
        message.setSenderUsername(request.getSenderUsername());
        message.setReceiverUsername(request.getReceiverUsername());
        message.setContent(request.getContent());
        message.setTimestamp(LocalDateTime.now());

        ChatMessage savedMessage = messageRepository.save(message);
        return mapToResponse(savedMessage);
    }

    @Override
    public List<MessageResponse> getConversation(String user1, String user2) {
        List<ChatMessage> messages = messageRepository.findConversation(user1, user2);
        return messages.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<MessageResponse> getUserHistory(String username) {
        List<ChatMessage> messages = messageRepository.findBySenderUsernameOrReceiverUsernameOrderByTimestampDesc(
                username,
                username);
        return messages.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private MessageResponse mapToResponse(ChatMessage message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setSenderUsername(message.getSenderUsername());
        response.setReceiverUsername(message.getReceiverUsername());
        response.setContent(message.getContent());
        response.setTimestamp(message.getTimestamp());
        return response;
    }
}
