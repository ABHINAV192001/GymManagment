package com.gymbross.chatservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatContactDto {
    private String id;
    private String name;
    private String username;
    private String email;
    private String userCode;
    private String role;
    private boolean isStaff;
    private long unreadCount;
}
