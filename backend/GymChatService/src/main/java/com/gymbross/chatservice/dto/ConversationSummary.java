package com.gymbross.chatservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationSummary {
    private String contactUsername;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private long unreadCount;
}
