package com.gymbross.chatservice.service;

import com.gymbross.chatservice.dto.MessageRequest;
import com.gymbross.chatservice.dto.MessageResponse;
import java.util.List;

public interface ChatService {
    MessageResponse sendMessage(MessageRequest request);

    List<MessageResponse> getConversation(String user1, String user2);

    List<MessageResponse> getUserHistory(String username);
}
