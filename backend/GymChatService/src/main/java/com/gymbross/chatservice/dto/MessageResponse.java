package com.gymbross.chatservice.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageResponse {
    private Long id;
    private String senderUsername;
    private String receiverUsername;
    private String content;
    private LocalDateTime timestamp;
}
