package com.gymbross.duo.service;

import com.Gym.GymCommonServices.entity.User;
import com.gymbross.duo.dto.*;
import com.gymbross.duo.entity.*;
import com.gymbross.duo.repository.*;
import com.gymbross.usermanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DuoStreakChallengeService {

    private final DuoPartnershipRepository partnershipRepository;
    private final DuoChallengeRepository challengeRepository;
    private final DuoChallengeScoreRepository scoreRepository;
    private final DuoChallengeEventRepository eventRepository;
    private final DuoChallengeTaskRepository taskRepository;
    private final UserRepository userRepository;

    public DuoPartnershipDTO mapToPartnershipDTO(DuoPartnership partnership) {
        if (partnership == null) return null;

        DuoPartnershipDTO.UserSummaryDTO requesterDTO = null;
        if (partnership.getRequester() != null) {
            requesterDTO = DuoPartnershipDTO.UserSummaryDTO.builder()
                    .id(partnership.getRequester().getId())
                    .name(partnership.getRequester().getName())
                    .username(partnership.getRequester().getUsername())
                    .email(partnership.getRequester().getEmail())
                    .build();
        }

        DuoPartnershipDTO.UserSummaryDTO addresseeDTO = null;
        if (partnership.getAddressee() != null) {
            addresseeDTO = DuoPartnershipDTO.UserSummaryDTO.builder()
                    .id(partnership.getAddressee().getId())
                    .name(partnership.getAddressee().getName())
                    .username(partnership.getAddressee().getUsername())
                    .email(partnership.getAddressee().getEmail())
                    .build();
        }

        return DuoPartnershipDTO.builder()
                .id(partnership.getId())
                .orgId(partnership.getOrganization() != null ? partnership.getOrganization().getId() : null)
                .requester(requesterDTO)
                .addressee(addresseeDTO)
                .inviteCode(partnership.getInviteCode())
                .status(partnership.getStatus())
                .duoStreakCount(partnership.getDuoStreakCount() != null ? partnership.getDuoStreakCount() : 0)
                .lastJointWorkoutDate(partnership.getLastJointWorkoutDate())
                .createdAt(partnership.getCreatedAt())
                .updatedAt(partnership.getUpdatedAt())
                .build();
    }

    @Transactional

    public DuoPartnership sendPartnerInvite(UUID requesterId, DuoInviteDTO dto) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Requester user not found: " + requesterId));

        User addressee;
        if (dto.getAddresseeId() != null) {
            addressee = userRepository.findById(dto.getAddresseeId())
                    .orElseThrow(() -> new IllegalArgumentException("Target partner not found: " + dto.getAddresseeId()));
        } else if (dto.getAddresseeUsernameOrEmail() != null) {
            addressee = userRepository.findByUsername(dto.getAddresseeUsernameOrEmail())
                    .or(() -> userRepository.findByEmail(dto.getAddresseeUsernameOrEmail()))
                    .orElseThrow(() -> new IllegalArgumentException("Target partner not found: " + dto.getAddresseeUsernameOrEmail()));
        } else {
            throw new IllegalArgumentException("Addressee identifier must be provided.");
        }

        if (requester.getId().equals(addressee.getId())) {
            throw new IllegalArgumentException("You cannot invite yourself as a gym partner.");
        }

        // STRICT SAME-ORGANIZATION BOUNDARY CHECK
        if (requester.getOrganization() == null || addressee.getOrganization() == null ||
                !requester.getOrganization().getId().equals(addressee.getOrganization().getId())) {
            throw new IllegalArgumentException("Users must belong to the exact same gym organization to pair up.");
        }

        UUID orgId = requester.getOrganization().getId();

        Optional<DuoPartnership> existing = partnershipRepository.findPartnershipBetween(orgId, requester.getId(), addressee.getId());
        if (existing.isPresent()) {
            DuoPartnership p = existing.get();
            if (p.getStatus() == PartnershipStatus.ACCEPTED) {
                throw new IllegalStateException("You are already linked with this partner.");
            }
            if (p.getStatus() == PartnershipStatus.PENDING) {
                throw new IllegalStateException("A partner invite is already pending between you.");
            }
            p.setStatus(PartnershipStatus.PENDING);
            p.setRequester(requester);
            p.setAddressee(addressee);
            return partnershipRepository.save(p);
        }

        DuoPartnership partnership = DuoPartnership.builder()
                .organization(requester.getOrganization())
                .requester(requester)
                .addressee(addressee)
                .status(PartnershipStatus.PENDING)
                .duoStreakCount(0)
                .build();

        log.info("Partner invite sent from user {} to user {} in org {}", requester.getId(), addressee.getId(), orgId);
        return partnershipRepository.save(partnership);
    }

    @Transactional
    public DuoPartnership acceptPartnerInvite(UUID currentUserId, UUID partnershipId) {
        DuoPartnership partnership = partnershipRepository.findById(partnershipId)
                .orElseThrow(() -> new IllegalArgumentException("Partnership invite not found: " + partnershipId));

        if (!partnership.getAddressee().getId().equals(currentUserId)) {
            throw new IllegalArgumentException("Only the invited partner can accept this request.");
        }

        partnership.setStatus(PartnershipStatus.ACCEPTED);
        log.info("Partnership {} accepted by user {}", partnershipId, currentUserId);
        return partnershipRepository.save(partnership);
    }

    @Transactional
    public DuoWhatsAppInviteDTO generateWhatsAppInviteLink(UUID requesterId, String originUrl) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new IllegalArgumentException("Requester user not found: " + requesterId));

        if (requester.getOrganization() == null) {
            throw new IllegalArgumentException("User does not belong to any organization.");
        }

        String inviteCode = "DUO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        DuoPartnership partnership = DuoPartnership.builder()
                .organization(requester.getOrganization())
                .requester(requester)
                .inviteCode(inviteCode)
                .status(PartnershipStatus.PENDING)
                .duoStreakCount(0)
                .build();

        partnershipRepository.save(partnership);

        String host = (originUrl != null && !originUrl.isBlank()) ? originUrl : "http://localhost:3000";
        String inviteUrl = host + "/duo/join?code=" + inviteCode;

        String rawMsg = String.format(
                "Hey! %s invited you to pair up as Gym Duo partners at %s on GymOS! 🔥\n\nClick the link to accept your invite & start workout streaks:\n%s",
                requester.getName(),
                requester.getOrganization().getName(),
                inviteUrl
        );

        String whatsappUrl = "https://api.whatsapp.com/send?text=" + java.net.URLEncoder.encode(rawMsg, java.nio.charset.StandardCharsets.UTF_8);

        return DuoWhatsAppInviteDTO.builder()
                .inviteCode(inviteCode)
                .inviteUrl(inviteUrl)
                .whatsappUrl(whatsappUrl)
                .requesterName(requester.getName())
                .organizationName(requester.getOrganization().getName())
                .build();
    }

    @Transactional
    public DuoPartnership claimInviteCode(UUID claimerId, String inviteCode) {
        User claimer = userRepository.findById(claimerId)
                .orElseThrow(() -> new IllegalArgumentException("Claimer user not found: " + claimerId));

        DuoPartnership partnership = partnershipRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired Duo invite code: " + inviteCode));

        if (partnership.getRequester().getId().equals(claimerId)) {
            throw new IllegalArgumentException("You cannot accept your own invite code.");
        }

        // STRICT SAME-ORGANIZATION BOUNDARY CHECK
        if (claimer.getOrganization() == null || partnership.getOrganization() == null ||
                !claimer.getOrganization().getId().equals(partnership.getOrganization().getId())) {
            throw new IllegalArgumentException("Users must belong to the exact same gym organization to pair up.");
        }

        if (partnership.getStatus() == PartnershipStatus.ACCEPTED) {
            return partnership;
        }

        partnership.setAddressee(claimer);
        partnership.setStatus(PartnershipStatus.ACCEPTED);
        log.info("Invite code {} claimed by user {}", inviteCode, claimerId);
        return partnershipRepository.save(partnership);
    }

    @Transactional(readOnly = true)
    public Optional<DuoPartnership> getActivePartnership(UUID orgId, UUID userId) {

        List<DuoPartnership> activeList = partnershipRepository.findActivePartnerships(orgId, userId, PartnershipStatus.ACCEPTED);
        return activeList.stream().findFirst();
    }

    @Transactional(readOnly = true)
    public List<DuoPartnership> getPendingInvites(UUID orgId, UUID userId) {
        return partnershipRepository.findPendingInvitesForUser(orgId, userId);
    }

    @Transactional
    public DuoChallengeResponseDTO createChallenge(UUID creatorId, CreateDuoChallengeDTO dto) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("Creator user not found: " + creatorId));

        DuoPartnership partnership = null;
        if (dto.getPartnershipId() != null) {
            partnership = partnershipRepository.findById(dto.getPartnershipId()).orElse(null);
            if (partnership != null) {
                if (partnership.getStatus() != PartnershipStatus.ACCEPTED) {
                    throw new IllegalStateException("Partnership must be accepted before creating a challenge.");
                }
                boolean isMember = partnership.getRequester().getId().equals(creatorId) || partnership.getAddressee().getId().equals(creatorId);
                if (!isMember) {
                    throw new IllegalArgumentException("You are not part of this partnership.");
                }
            }
        } else if (creator.getOrganization() != null) {
            partnership = getActivePartnership(creator.getOrganization().getId(), creatorId).orElse(null);
        }

        UUID orgId = creator.getOrganization().getId();
        int maxMembers = (dto.getMaxMembers() != null && dto.getMaxMembers() >= 2 && dto.getMaxMembers() <= 5) ? dto.getMaxMembers() : 2;
        int durationDays = (dto.getDurationDays() != null && dto.getDurationDays() > 0) ? dto.getDurationDays() : 7;
        String inviteCode = "CHALLENGE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(durationDays);

        DuoChallenge challenge = DuoChallenge.builder()
                .organization(creator.getOrganization())
                .partnership(partnership)
                .creator(creator)
                .title(dto.getTitle() != null && !dto.getTitle().isBlank() ? dto.getTitle() : "Custom Duo Challenge")
                .challengeType(dto.getChallengeType() != null ? dto.getChallengeType() : ChallengeType.POINT_RACE)
                .targetValue(dto.getTargetValue() != null && dto.getTargetValue() > 0 ? dto.getTargetValue() : 10)
                .wagerPrize(dto.getWagerPrize())
                .maxMembers(maxMembers)
                .durationDays(durationDays)
                .inviteCode(inviteCode)
                .prizeStatus(dto.getWagerPrize() != null && !dto.getWagerPrize().isBlank() ? PrizeStatus.UNCLAIMED : PrizeStatus.NONE)
                .status(ChallengeStatus.ACTIVE)
                .startDate(startDate)
                .endDate(endDate)
                .build();

        DuoChallenge savedChallenge = challengeRepository.save(challenge);

        // Save daily tasks if provided
        if (dto.getTasks() != null && !dto.getTasks().isEmpty()) {
            List<DuoChallengeTask> taskEntities = dto.getTasks().stream().map(t -> DuoChallengeTask.builder()
                    .challenge(savedChallenge)
                    .dayIndex(t.getDayIndex() != null ? t.getDayIndex() : 1)
                    .dayOfWeek(t.getDayOfWeek())
                    .taskName(t.getTaskName())
                    .points(t.getPoints() != null && t.getPoints() > 0 ? t.getPoints() : 1)
                    .build()).toList();
            taskRepository.saveAll(taskEntities);
            savedChallenge.setTasks(taskEntities);
        }

        // Initialize Scoreboard for Creator (Host)
        DuoChallengeScore creatorScore = DuoChallengeScore.builder()
                .challenge(savedChallenge)
                .user(creator)
                .build();
        scoreRepository.save(creatorScore);

        // If created from an active 1-on-1 partnership, add the partner as well
        if (partnership != null) {
            User partnerUser = partnership.getRequester().getId().equals(creatorId)
                    ? partnership.getAddressee()
                    : partnership.getRequester();
            if (partnerUser != null && !partnerUser.getId().equals(creatorId)) {
                DuoChallengeScore partnerScore = DuoChallengeScore.builder()
                        .challenge(savedChallenge)
                        .user(partnerUser)
                        .build();
                scoreRepository.save(partnerScore);
            }
        }

        log.info("Duo Challenge {} created by user {} with maxMembers={}", savedChallenge.getId(), creatorId, maxMembers);
        return mapToChallengeResponse(savedChallenge);
    }

    @Transactional
    public DuoChallengeResponseDTO joinChallengeByInviteCode(UUID userId, String inviteCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        DuoChallenge challenge = challengeRepository.findAll().stream()
                .filter(c -> inviteCode.equalsIgnoreCase(c.getInviteCode()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid challenge invite code: " + inviteCode));

        if (user.getOrganization() == null || challenge.getOrganization() == null ||
                !user.getOrganization().getId().equals(challenge.getOrganization().getId())) {
            throw new IllegalArgumentException("Users must belong to the exact same gym organization to join this challenge.");
        }

        List<DuoChallengeScore> currentScores = scoreRepository.findLeaderboardForChallenge(challenge.getId());
        boolean alreadyJoined = currentScores.stream().anyMatch(s -> s.getUser().getId().equals(userId));
        if (alreadyJoined) {
            return mapToChallengeResponse(challenge);
        }

        if (currentScores.size() >= challenge.getMaxMembers()) {
            throw new IllegalStateException("Challenge has reached maximum participant limit of " + challenge.getMaxMembers() + " members.");
        }

        DuoChallengeScore score = DuoChallengeScore.builder()
                .challenge(challenge)
                .user(user)
                .build();
        scoreRepository.save(score);

        log.info("User {} joined challenge {} via invite code {}", userId, challenge.getId(), inviteCode);
        return mapToChallengeResponse(challenge);
    }

    @Transactional
    public void processWorkoutEvent(UUID loggedInUserId, UUID targetUserIdInput, String eventType, String description) {
        User loggedInUser = userRepository.findById(loggedInUserId).orElse(null);
        if (loggedInUser == null || loggedInUser.getOrganization() == null) return;

        UUID orgId = loggedInUser.getOrganization().getId();
        List<DuoChallenge> activeChallenges = challengeRepository.findActiveChallengesForUser(orgId, loggedInUserId);
        if (activeChallenges.isEmpty()) return;

        int pointsToAdd = switch (eventType.toUpperCase()) {
            case "ATTENDANCE" -> 1;
            case "WORKOUT" -> 10;
            case "STRENGTH_PR" -> 3;
            default -> 10;
        };

        java.time.OffsetDateTime startOfToday = LocalDate.now().atStartOfDay().atOffset(java.time.ZoneOffset.UTC);

        for (DuoChallenge challenge : activeChallenges) {
            List<DuoChallengeScore> challengeScores = scoreRepository.findLeaderboardForChallenge(challenge.getId());
            if (challengeScores.isEmpty()) continue;

            // Determine Target User (Who receives the workout points)
            UUID targetUserId = targetUserIdInput;
            if (targetUserId == null) {
                // If not specified, find the partner / other member in the challenge
                Optional<DuoChallengeScore> otherMemberScore = challengeScores.stream()
                        .filter(s -> !s.getUser().getId().equals(loggedInUserId))
                        .findFirst();
                if (otherMemberScore.isPresent()) {
                    targetUserId = otherMemberScore.get().getUser().getId();
                } else {
                    targetUserId = loggedInUserId;
                }
            }

            // Cross-logging Rule: If challenge has > 1 participant, user cannot log for themselves
            if (challengeScores.size() > 1 && loggedInUserId.equals(targetUserId)) {
                throw new IllegalArgumentException("Partner verification required: Partner 1 logs for Partner 2 and Partner 2 logs for Partner 1!");
            }

            User targetUser = userRepository.findById(targetUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Target user not found: " + targetUserIdInput));

            // Enforce 1 Log Per Calendar Day Limit for WORKOUT events
            if ("WORKOUT".equalsIgnoreCase(eventType)) {
                boolean alreadyLoggedToday = eventRepository.hasLoggedEventToday(challenge.getId(), targetUserId, "WORKOUT", startOfToday);
                if (alreadyLoggedToday) {
                    throw new IllegalArgumentException("Workout session for " + targetUser.getName() + " has already been logged today! (Limit: 1 workout log per day)");
                }
            }

            Optional<DuoChallengeScore> targetScoreOpt = scoreRepository.findByChallengeIdAndUserId(challenge.getId(), targetUserId);
            if (targetScoreOpt.isEmpty()) continue;

            DuoChallengeScore targetScore = targetScoreOpt.get();
            targetScore.setTotalPoints(targetScore.getTotalPoints() + pointsToAdd);

            switch (eventType.toUpperCase()) {
                case "ATTENDANCE" -> targetScore.setAttendancePoints(targetScore.getAttendancePoints() + pointsToAdd);
                case "WORKOUT" -> targetScore.setWorkoutPoints(targetScore.getWorkoutPoints() + pointsToAdd);
                case "STRENGTH_PR" -> targetScore.setPrPoints(targetScore.getPrPoints() + pointsToAdd);
            }
            targetScore.setCurrentStreak(targetScore.getCurrentStreak() + 1);
            scoreRepository.save(targetScore);

            // Log Event for Target User with verification attribution
            String fullDescription = (description != null && !description.isBlank())
                    ? description + " (Logged by " + loggedInUser.getName() + ")"
                    : "Workout session verified & logged by " + loggedInUser.getName();

            DuoChallengeEvent event = DuoChallengeEvent.builder()
                    .challenge(challenge)
                    .user(targetUser)
                    .eventType(eventType)
                    .pointsAwarded(pointsToAdd)
                    .description(fullDescription)
                    .build();
            eventRepository.save(event);

            // Check Duo Sync Bonus (If ALL members in challenge have a WORKOUT event today)
            boolean allMembersWorkedOutToday = challengeScores.stream().allMatch(score -> {
                return eventRepository.hasLoggedEventToday(challenge.getId(), score.getUser().getId(), "WORKOUT", startOfToday);
            });

            if (allMembersWorkedOutToday && challengeScores.size() >= 2) {
                // Award +2 Duo Sync Bonus to all members if not already awarded today
                boolean syncAlreadyAwarded = eventRepository.hasLoggedEventToday(challenge.getId(), targetUserId, "DUO_SYNC", startOfToday);
                if (!syncAlreadyAwarded) {
                    int syncBonus = 2;
                    for (DuoChallengeScore memberScore : challengeScores) {
                        memberScore.setDuoSyncPoints(memberScore.getDuoSyncPoints() + syncBonus);
                        memberScore.setTotalPoints(memberScore.getTotalPoints() + syncBonus);
                        scoreRepository.save(memberScore);

                        eventRepository.save(DuoChallengeEvent.builder()
                                .challenge(challenge)
                                .user(memberScore.getUser())
                                .eventType("DUO_SYNC")
                                .pointsAwarded(syncBonus)
                                .description("🔥 Duo Sync Bonus! All challenge members worked out today!")
                                .build());
                    }

                    // Update 1-on-1 partnership joint streak if applicable
                    DuoPartnership partnership = challenge.getPartnership();
                    if (partnership != null) {
                        partnership.setLastJointWorkoutDate(LocalDate.now());
                        partnership.setDuoStreakCount((partnership.getDuoStreakCount() != null ? partnership.getDuoStreakCount() : 0) + 1);
                        partnershipRepository.save(partnership);
                    }
                }
            }

            // Check Winner Condition for Target User
            checkAndDeclareWinner(challenge, targetScore, targetUser);
        }
    }

    private void checkAndDeclareWinner(DuoChallenge challenge, DuoChallengeScore score, User candidateWinner) {
        if (challenge.getStatus() != ChallengeStatus.ACTIVE) return;

        boolean won = false;
        if (challenge.getChallengeType() == ChallengeType.POINT_RACE && score.getTotalPoints() >= challenge.getTargetValue()) {
            won = true;
        } else if (challenge.getChallengeType() == ChallengeType.STREAK_DAYS && score.getCurrentStreak() >= challenge.getTargetValue()) {
            won = true;
        }

        if (won) {
            challenge.setStatus(ChallengeStatus.COMPLETED);
            challenge.setWinner(candidateWinner);
            if (challenge.getWagerPrize() != null && !challenge.getWagerPrize().isBlank()) {
                challenge.setPrizeStatus(PrizeStatus.UNCLAIMED);
            }
            challengeRepository.save(challenge);
            log.info("Duo Challenge {} won by user {}!", challenge.getId(), candidateWinner.getId());
        }
    }

    @Transactional
    public DuoChallengeResponseDTO settlePrize(UUID currentUserId, SettlePrizeDTO dto) {
        DuoChallenge challenge = challengeRepository.findById(dto.getChallengeId())
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found: " + dto.getChallengeId()));

        if (challenge.getWinner() == null || !challenge.getWinner().getId().equals(currentUserId)) {
            throw new IllegalArgumentException("Only the winning partner can acknowledge/settle the prize.");
        }

        challenge.setPrizeStatus(PrizeStatus.SETTLED);
        DuoChallenge updated = challengeRepository.save(challenge);
        log.info("Prize settled for challenge {} by winner {}", challenge.getId(), currentUserId);
        return mapToChallengeResponse(updated);
    }

    @Transactional
    public void deleteChallenge(UUID currentUserId, UUID challengeId) {
        DuoChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found with ID: " + challengeId));

        boolean isCreator = challenge.getCreator().getId().equals(currentUserId);
        boolean isParticipant = scoreRepository.findLeaderboardForChallenge(challengeId)
                .stream().anyMatch(s -> s.getUser().getId().equals(currentUserId));

        if (!isCreator && !isParticipant) {
            throw new IllegalArgumentException("You are not authorized to delete this challenge.");
        }

        taskRepository.deleteByChallengeId(challengeId);
        scoreRepository.deleteByChallengeId(challengeId);
        eventRepository.deleteByChallengeId(challengeId);
        challengeRepository.delete(challenge);

        log.info("Duo Challenge {} successfully deleted by user {}", challengeId, currentUserId);
    }

    @Transactional
    public DuoChallengeResponseDTO updateChallenge(UUID currentUserId, UUID challengeId, CreateDuoChallengeDTO dto) {
        DuoChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found with ID: " + challengeId));

        if (!challenge.getCreator().getId().equals(currentUserId)) {
            throw new IllegalArgumentException("Only the challenge creator can edit this challenge.");
        }

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            challenge.setTitle(dto.getTitle().trim());
        }
        if (dto.getTargetValue() != null) {
            challenge.setTargetValue(dto.getTargetValue());
        }
        if (dto.getWagerPrize() != null) {
            challenge.setWagerPrize(dto.getWagerPrize().trim());
        }
        if (dto.getMaxMembers() != null && dto.getMaxMembers() >= 2) {
            challenge.setMaxMembers(dto.getMaxMembers());
        }
        if (dto.getDurationDays() != null && dto.getDurationDays() >= 1) {
            challenge.setDurationDays(dto.getDurationDays());
        }

        if (dto.getTasks() != null) {
            taskRepository.deleteByChallengeId(challengeId);
            List<DuoChallengeTask> taskEntities = dto.getTasks().stream().map(t -> DuoChallengeTask.builder()
                    .challenge(challenge)
                    .dayIndex(t.getDayIndex() != null ? t.getDayIndex() : 1)
                    .dayOfWeek(t.getDayOfWeek() != null ? t.getDayOfWeek() : "Monday")
                    .taskName(t.getTaskName())
                    .points(t.getPoints() != null ? t.getPoints() : 1)
                    .build()).collect(Collectors.toList());

            taskRepository.saveAll(taskEntities);
            challenge.setTasks(taskEntities);
        }

        DuoChallenge updated = challengeRepository.save(challenge);
        log.info("Duo Challenge {} updated by creator {}", challengeId, currentUserId);
        return mapToChallengeResponse(updated);
    }

    @Transactional
    public DuoChallengeResponseDTO removeParticipant(UUID currentUserId, UUID challengeId, UUID targetUserId) {
        DuoChallenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("Challenge not found with ID: " + challengeId));

        if (!challenge.getCreator().getId().equals(currentUserId)) {
            throw new IllegalArgumentException("Only the challenge creator can remove participants.");
        }

        if (challenge.getCreator().getId().equals(targetUserId)) {
            throw new IllegalArgumentException("Challenge host cannot be removed from their own challenge. Delete the challenge instead.");
        }

        Optional<DuoChallengeScore> scoreOpt = scoreRepository.findByChallengeIdAndUserId(challengeId, targetUserId);
        if (scoreOpt.isPresent()) {
            scoreRepository.delete(scoreOpt.get());
            log.info("Participant {} removed from challenge {} by host {}", targetUserId, challengeId, currentUserId);
        }

        return mapToChallengeResponse(challenge);
    }

    @Transactional
    public void removePartnership(UUID currentUserId, UUID partnershipId) {
        DuoPartnership partnership = partnershipRepository.findById(partnershipId)
                .orElseThrow(() -> new IllegalArgumentException("Partnership not found: " + partnershipId));

        boolean isRequester = partnership.getRequester().getId().equals(currentUserId);
        boolean isAddressee = partnership.getAddressee().getId().equals(currentUserId);

        if (!isRequester && !isAddressee) {
            throw new IllegalArgumentException("You are not part of this partnership.");
        }

        partnership.setStatus(PartnershipStatus.REMOVED);
        partnershipRepository.save(partnership);
        log.info("Duo Partnership {} unlinked/removed by user {}", partnershipId, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<DuoChallengeResponseDTO> getActiveChallengesForUser(UUID orgId, UUID userId) {
        List<DuoChallenge> challenges = challengeRepository.findActiveChallengesForUser(orgId, userId);
        return challenges.stream().map(this::mapToChallengeResponse).collect(Collectors.toList());
    }

    private DuoChallengeResponseDTO mapToChallengeResponse(DuoChallenge c) {
        List<DuoChallengeScore> scores = scoreRepository.findLeaderboardForChallenge(c.getId());
        List<DuoScoreboardDTO> scoreDTOs = scores.stream().map(s -> DuoScoreboardDTO.builder()
                .userId(s.getUser().getId())
                .userName(s.getUser().getName())
                .totalPoints(s.getTotalPoints())
                .attendancePoints(s.getAttendancePoints())
                .workoutPoints(s.getWorkoutPoints())
                .prPoints(s.getPrPoints())
                .duoSyncPoints(s.getDuoSyncPoints())
                .currentStreak(s.getCurrentStreak())
                .build()).collect(Collectors.toList());

        List<DuoChallengeTask> taskEntities = (c.getTasks() != null && !c.getTasks().isEmpty())
                ? c.getTasks()
                : taskRepository.findByChallengeId(c.getId());

        List<CreateDuoChallengeDTO.ChallengeTaskDTO> taskDTOs = taskEntities.stream().map(t -> CreateDuoChallengeDTO.ChallengeTaskDTO.builder()
                .dayIndex(t.getDayIndex())
                .dayOfWeek(t.getDayOfWeek())
                .taskName(t.getTaskName())
                .points(t.getPoints())
                .build()).collect(Collectors.toList());

        return DuoChallengeResponseDTO.builder()
                .id(c.getId())
                .partnershipId(c.getPartnership() != null ? c.getPartnership().getId() : null)
                .title(c.getTitle())
                .challengeType(c.getChallengeType())
                .targetValue(c.getTargetValue())
                .wagerPrize(c.getWagerPrize())
                .maxMembers(c.getMaxMembers())
                .durationDays(c.getDurationDays())
                .inviteCode(c.getInviteCode())
                .tasks(taskDTOs)
                .creatorId(c.getCreator().getId())
                .creatorName(c.getCreator().getName())
                .winnerId(c.getWinner() != null ? c.getWinner().getId() : null)
                .winnerName(c.getWinner() != null ? c.getWinner().getName() : null)
                .prizeStatus(c.getPrizeStatus())
                .status(c.getStatus())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .duoStreakCount(c.getPartnership() != null ? c.getPartnership().getDuoStreakCount() : 0)
                .scores(scoreDTOs)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
