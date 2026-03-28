package com.gymbross.chatservice.dto;

import lombok.Data;

@Data
public class MessageRequest {
    private String senderUsername;
    private String receiverUsername;
    private String content;
}
