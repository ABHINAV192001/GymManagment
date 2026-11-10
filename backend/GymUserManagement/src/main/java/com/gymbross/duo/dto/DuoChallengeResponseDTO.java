package com.gymbross.duo.dto;

import com.gymbross.duo.entity.ChallengeStatus;
import com.gymbross.duo.entity.ChallengeType;
import com.gymbross.duo.entity.PrizeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DuoChallengeResponseDTO {
    private UUID id;
    private UUID partnershipId;
    private String title;
    private ChallengeType challengeType;
    private Integer targetValue;
    private String wagerPrize;
    private UUID creatorId;
    private String creatorName;
    private UUID winnerId;
    private String winnerName;
    private PrizeStatus prizeStatus;
    private ChallengeStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer duoStreakCount;
    private Integer maxMembers;
    private Integer durationDays;
    private String inviteCode;
    private List<CreateDuoChallengeDTO.ChallengeTaskDTO> tasks;
    private List<DuoScoreboardDTO> scores;
    private OffsetDateTime createdAt;
}
