package com.gymbross.duo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DuoWhatsAppInviteDTO {
    private String inviteCode;
    private String inviteUrl;
    private String whatsappUrl;
    private String requesterName;
    private String organizationName;
}
