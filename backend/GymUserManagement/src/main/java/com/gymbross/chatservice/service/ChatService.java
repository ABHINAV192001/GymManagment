package com.gymbross.chatservice.service;

import com.gymbross.chatservice.dto.ChatContactDto;
import com.gymbross.chatservice.dto.ConversationSummary;
import com.gymbross.chatservice.dto.MessageRequest;
import com.gymbross.chatservice.dto.MessageResponse;
import java.security.Principal;
import java.util.List;

public interface ChatService {
    MessageResponse sendMessage(MessageRequest request);

    List<MessageResponse> getConversation(String user1, String user2);

    List<MessageResponse> getUserHistory(String username);

    List<ConversationSummary> getConversations(String username);

    void markConversationRead(String readerUsername, String senderUsername);

    List<ChatContactDto> getChatContacts(Principal principal);

    List<String> getAllUserIdentifiers(String identifier);

    MessageResponse editMessage(java.util.UUID messageId, String newContent, String requesterUsername);

    void deleteMessage(java.util.UUID messageId, String requesterUsername);
}

