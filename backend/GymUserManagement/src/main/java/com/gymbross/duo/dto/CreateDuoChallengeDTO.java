package com.gymbross.duo.dto;

import com.gymbross.duo.entity.ChallengeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDuoChallengeDTO {
    private UUID partnershipId;
    private String title;
    private ChallengeType challengeType;
    private Integer targetValue;
    private String wagerPrize;
    private Integer maxMembers;
    private Integer durationDays;
    private List<ChallengeTaskDTO> tasks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChallengeTaskDTO {
        private Integer dayIndex;
        private String dayOfWeek;
        private String taskName;
        private Integer points;
    }
}
