package com.gymbross.duo.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.exception.UnauthorizedException;
import com.gymbross.duo.dto.*;
import com.gymbross.duo.entity.DuoPartnership;
import com.gymbross.duo.service.DuoStreakChallengeService;
import com.gymbross.usermanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/duo")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class DuoStreakChallengeController {

    private final DuoStreakChallengeService duoService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("User is not authenticated");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        if (principal instanceof UserDetails userDetails) {
            String identifier = userDetails.getUsername();
            return userRepository.findByUsername(identifier)
                    .or(() -> userRepository.findByEmail(identifier))
                    .orElseThrow(() -> new UnauthorizedException("Authenticated user not found in database: " + identifier));
        }
        throw new UnauthorizedException("Unable to resolve authenticated user principal");
    }

    @PostMapping("/partners/invite")
    public ResponseEntity<ApiResponse<DuoPartnershipDTO>> sendInvite(@RequestBody DuoInviteDTO dto) {
        User user = getAuthenticatedUser();
        DuoPartnership partnership = duoService.sendPartnerInvite(user.getId(), dto);
        return ResponseEntity.ok(ApiResponse.<DuoPartnershipDTO>builder()
                .success(true)
                .message("Partner invite sent successfully.")
                .data(duoService.mapToPartnershipDTO(partnership))
                .build());
    }

    @PostMapping("/partners/generate-whatsapp-link")
    public ResponseEntity<ApiResponse<DuoWhatsAppInviteDTO>> generateWhatsAppInvite(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "origin", required = false) String originHeader
    ) {
        User user = getAuthenticatedUser();
        String origin = body.getOrDefault("originUrl", originHeader);
        DuoWhatsAppInviteDTO dto = duoService.generateWhatsAppInviteLink(user.getId(), origin);
        return ResponseEntity.ok(ApiResponse.<DuoWhatsAppInviteDTO>builder()
                .success(true)
                .message("WhatsApp invite link generated.")
                .data(dto)
                .build());
    }

    @PostMapping("/partners/claim-invite")
    public ResponseEntity<ApiResponse<DuoPartnershipDTO>> claimInvite(@RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser();
        String code = body.get("inviteCode");
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Invite code must be provided.");
        }
        DuoPartnership partnership = duoService.claimInviteCode(user.getId(), code.trim());
        return ResponseEntity.ok(ApiResponse.<DuoPartnershipDTO>builder()
                .success(true)
                .message("Gym Duo partner invite successfully claimed!")
                .data(duoService.mapToPartnershipDTO(partnership))
                .build());
    }


    @PostMapping("/partners/{partnershipId}/accept")
    public ResponseEntity<ApiResponse<DuoPartnershipDTO>> acceptInvite(@PathVariable UUID partnershipId) {
        User user = getAuthenticatedUser();
        DuoPartnership partnership = duoService.acceptPartnerInvite(user.getId(), partnershipId);
        return ResponseEntity.ok(ApiResponse.<DuoPartnershipDTO>builder()
                .success(true)
                .message("Partner invite accepted!")
                .data(duoService.mapToPartnershipDTO(partnership))
                .build());
    }

    @GetMapping("/partners/my-partner")
    public ResponseEntity<ApiResponse<DuoPartnershipDTO>> getMyPartner() {
        User user = getAuthenticatedUser();
        if (user.getOrganization() == null) {
            return ResponseEntity.ok(ApiResponse.<DuoPartnershipDTO>builder().success(true).data(null).build());
        }
        Optional<DuoPartnership> partnerOpt = duoService.getActivePartnership(user.getOrganization().getId(), user.getId());
        return ResponseEntity.ok(ApiResponse.<DuoPartnershipDTO>builder()
                .success(true)
                .data(partnerOpt.map(duoService::mapToPartnershipDTO).orElse(null))
                .build());
    }

    @GetMapping("/partners/pending-invites")
    public ResponseEntity<ApiResponse<List<DuoPartnershipDTO>>> getPendingInvites() {
        User user = getAuthenticatedUser();
        if (user.getOrganization() == null) {
            return ResponseEntity.ok(ApiResponse.<List<DuoPartnershipDTO>>builder().success(true).data(List.of()).build());
        }
        List<DuoPartnership> pending = duoService.getPendingInvites(user.getOrganization().getId(), user.getId());
        List<DuoPartnershipDTO> dtos = pending.stream().map(duoService::mapToPartnershipDTO).toList();
        return ResponseEntity.ok(ApiResponse.<List<DuoPartnershipDTO>>builder()
                .success(true)
                .data(dtos)
                .build());
    }


    @PostMapping("/challenges")
    public ResponseEntity<ApiResponse<DuoChallengeResponseDTO>> createChallenge(@RequestBody CreateDuoChallengeDTO dto) {
        User user = getAuthenticatedUser();
        DuoChallengeResponseDTO response = duoService.createChallenge(user.getId(), dto);
        return ResponseEntity.ok(ApiResponse.<DuoChallengeResponseDTO>builder()
                .success(true)
                .message("Duo challenge launched!")
                .data(response)
                .build());
    }

    @PostMapping("/challenges/join-code")
    public ResponseEntity<ApiResponse<DuoChallengeResponseDTO>> joinChallengeByCode(@RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser();
        String code = body.get("inviteCode");
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Challenge invite code must be provided.");
        }
        DuoChallengeResponseDTO response = duoService.joinChallengeByInviteCode(user.getId(), code.trim());
        return ResponseEntity.ok(ApiResponse.<DuoChallengeResponseDTO>builder()
                .success(true)
                .message("Successfully joined Duo Challenge!")
                .data(response)
                .build());
    }

    @DeleteMapping("/challenges/{challengeId}")
    public ResponseEntity<ApiResponse<String>> deleteChallenge(@PathVariable UUID challengeId) {
        User user = getAuthenticatedUser();
        duoService.deleteChallenge(user.getId(), challengeId);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Duo Challenge successfully deleted.")
                .data("DELETED")
                .build());
    }

    @PutMapping("/challenges/{challengeId}")
    public ResponseEntity<ApiResponse<DuoChallengeResponseDTO>> updateChallenge(
            @PathVariable UUID challengeId,
            @RequestBody CreateDuoChallengeDTO dto
    ) {
        User user = getAuthenticatedUser();
        DuoChallengeResponseDTO response = duoService.updateChallenge(user.getId(), challengeId, dto);
        return ResponseEntity.ok(ApiResponse.<DuoChallengeResponseDTO>builder()
                .success(true)
                .message("Duo Challenge updated successfully.")
                .data(response)
                .build());
    }

    @DeleteMapping("/challenges/{challengeId}/participants/{participantUserId}")
    public ResponseEntity<ApiResponse<DuoChallengeResponseDTO>> removeParticipant(
            @PathVariable UUID challengeId,
            @PathVariable UUID participantUserId
    ) {
        User user = getAuthenticatedUser();
        DuoChallengeResponseDTO response = duoService.removeParticipant(user.getId(), challengeId, participantUserId);
        return ResponseEntity.ok(ApiResponse.<DuoChallengeResponseDTO>builder()
                .success(true)
                .message("Participant removed from challenge.")
                .data(response)
                .build());
    }

    @DeleteMapping("/partners/{partnershipId}")
    public ResponseEntity<ApiResponse<String>> removePartnership(@PathVariable UUID partnershipId) {
        User user = getAuthenticatedUser();
        duoService.removePartnership(user.getId(), partnershipId);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Partner connection unlinked successfully.")
                .data("UNLINKED")
                .build());
    }

    @GetMapping("/challenges/active")
    public ResponseEntity<ApiResponse<List<DuoChallengeResponseDTO>>> getActiveChallenges() {
        User user = getAuthenticatedUser();
        if (user.getOrganization() == null) {
            return ResponseEntity.ok(ApiResponse.<List<DuoChallengeResponseDTO>>builder().success(true).data(List.of()).build());
        }
        List<DuoChallengeResponseDTO> challenges = duoService.getActiveChallengesForUser(user.getOrganization().getId(), user.getId());
        return ResponseEntity.ok(ApiResponse.<List<DuoChallengeResponseDTO>>builder()
                .success(true)
                .data(challenges)
                .build());
    }

    @PostMapping("/challenges/settle-prize")
    public ResponseEntity<ApiResponse<DuoChallengeResponseDTO>> settlePrize(@RequestBody SettlePrizeDTO dto) {
        User user = getAuthenticatedUser();
        DuoChallengeResponseDTO response = duoService.settlePrize(user.getId(), dto);
        return ResponseEntity.ok(ApiResponse.<DuoChallengeResponseDTO>builder()
                .success(true)
                .message("Wager prize marked as settled!")
                .data(response)
                .build());
    }

    @PostMapping("/events/log")
    public ResponseEntity<ApiResponse<String>> logEvent(@RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser();
        String eventType = body.getOrDefault("eventType", "WORKOUT");
        String description = body.getOrDefault("description", "Logged workout activity");
        String targetUserIdStr = body.get("targetUserId");
        UUID targetUserId = (targetUserIdStr != null && !targetUserIdStr.isBlank()) ? UUID.fromString(targetUserIdStr) : null;
        
        duoService.processWorkoutEvent(user.getId(), targetUserId, eventType, description);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Workout session logged successfully.")
                .data("SUCCESS")
                .build());
    }
}
