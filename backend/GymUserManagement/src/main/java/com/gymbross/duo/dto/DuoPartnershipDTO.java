package com.gymbross.duo.dto;

import com.gymbross.duo.entity.PartnershipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DuoPartnershipDTO {
    private UUID id;
    private UUID orgId;
    private UserSummaryDTO requester;
    private UserSummaryDTO addressee;
    private String inviteCode;
    private PartnershipStatus status;
    private Integer duoStreakCount;
    private LocalDate lastJointWorkoutDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummaryDTO {
        private UUID id;
        private String name;
        private String username;
        private String email;
    }
}
