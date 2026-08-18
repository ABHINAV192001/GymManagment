package com.gymbross.workout.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.workout.dto.GroupSessionDto;
import com.gymbross.workout.entity.GroupSession;
import com.gymbross.workout.repository.GroupSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * CRUD endpoints for Group Sessions.
 * POST  /api/group-sessions        — create a session (admin/trainer)
 * GET   /api/group-sessions        — list sessions for caller's org, optionally filtered by branchId
 * GET   /api/group-sessions/{id}   — get single session
 * DELETE /api/group-sessions/{id}  — cancel a session
 */
@RestController
@RequestMapping("/api/group-sessions")
@RequiredArgsConstructor
@Slf4j
public class GroupSessionController {

    private final GroupSessionRepository groupSessionRepository;
    private final com.gymbross.usermanagement.repository.UserRepository userRepository;

    private UUID resolveCurrentUserId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof com.Gym.GymCommonServices.entity.User user) {
            return user.getId();
        }
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            String identifier = userDetails.getUsername();
            if (identifier != null && !identifier.isBlank()) {
                var dbUser = userRepository.findByUsername(identifier);
                if (dbUser.isEmpty()) {
                    dbUser = userRepository.findByEmail(identifier);
                }
                if (dbUser.isPresent()) {
                    return dbUser.get().getId();
                }
                try {
                    return UUID.fromString(identifier);
                } catch (IllegalArgumentException ignored) {}
            }
        }
        throw new RuntimeException("Unable to determine user identity for activity voting.");
    }

    // ── Create ──────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<GroupSessionDto.Response>> createSession(
            @RequestBody GroupSessionDto.CreateRequest req,
            HttpServletRequest httpRequest) {

        UUID orgId = (UUID) httpRequest.getAttribute("organizationId");

        GroupSession session = GroupSession.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .sessionDate(req.getSessionDate())
                .sessionTime(req.getSessionTime())
                .durationMins(req.getDurationMins())
                .availableSlots(req.getAvailableSlots() > 0 ? req.getAvailableSlots() : 20)
                .bookedCount(0)
                .branchIds(req.getBranchIds())
                .notifyRoles(req.getNotifyRoles())
                .orgId(orgId)
                .status("SCHEDULED")
                .build();

        GroupSession saved = groupSessionRepository.save(session);
        log.info("GroupSession created: {} by orgId={}", saved.getId(), orgId);

        return ResponseEntity.ok(ApiResponse.success(toResponse(saved), "Group session scheduled successfully"));
    }

    // ── List ─────────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<GroupSessionDto.Response>>> getSessions(
            @RequestParam(required = false) String branchId,
            HttpServletRequest httpRequest) {

        UUID orgId = (UUID) httpRequest.getAttribute("organizationId");

        List<GroupSession> sessions;
        if (branchId != null && !branchId.isBlank() && !"ALL".equalsIgnoreCase(branchId)) {
            sessions = groupSessionRepository
                    .findByOrgIdAndBranchIdsContainingOrderByCreatedAtDesc(orgId, branchId);
        } else {
            sessions = groupSessionRepository
                    .findByOrgIdOrderByCreatedAtDesc(orgId);
        }

        List<GroupSessionDto.Response> result = sessions.stream()
                .filter(s -> s.getStatus() == null || !"DELETED".equalsIgnoreCase(s.getStatus()))
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // ── Get Single ───────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<GroupSessionDto.Response>> getSession(@PathVariable UUID id) {
        GroupSession session = groupSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group session not found: " + id));
        return ResponseEntity.ok(ApiResponse.success(toResponse(session)));
    }

    // ── Cancel (soft-cancel with reason) ───────────────────────────────────

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<GroupSessionDto.Response>> cancelSession(
            @PathVariable UUID id,
            @RequestBody GroupSessionDto.CancelRequest req) {

        if (req.getReason() == null || req.getReason().isBlank()) {
            throw new RuntimeException("Cancellation reason is required");
        }

        GroupSession session = groupSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group session not found: " + id));

        if ("CANCELLED".equals(session.getStatus())) {
            throw new RuntimeException("Session is already cancelled");
        }

        session.setStatus("CANCELLED");
        session.setCancellationReason(req.getReason().trim());
        session.setCancelledAt(java.time.LocalDateTime.now());
        groupSessionRepository.save(session);

        log.info("GroupSession {} cancelled. Reason: {}", id, req.getReason());
        return ResponseEntity.ok(ApiResponse.success(toResponse(session), "Session cancelled"));
    }

    // ── Update ───────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<GroupSessionDto.Response>> updateSession(
            @PathVariable UUID id,
            @RequestBody GroupSessionDto.UpdateRequest req) {

        GroupSession session = groupSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group session not found: " + id));

        if ("DELETED".equals(session.getStatus())) {
            throw new RuntimeException("Cannot update a deleted session");
        }

        if (req.getTitle() != null && !req.getTitle().isBlank()) session.setTitle(req.getTitle());
        if (req.getDescription() != null) session.setDescription(req.getDescription());
        if (req.getSessionDate() != null) session.setSessionDate(req.getSessionDate());
        if (req.getSessionTime() != null) session.setSessionTime(req.getSessionTime());
        if (req.getDurationMins() > 0) session.setDurationMins(req.getDurationMins());
        if (req.getAvailableSlots() > 0) session.setAvailableSlots(req.getAvailableSlots());
        if (req.getBranchIds() != null) session.setBranchIds(req.getBranchIds());
        if (req.getNotifyRoles() != null) session.setNotifyRoles(req.getNotifyRoles());

        GroupSession updated = groupSessionRepository.save(session);
        log.info("GroupSession {} updated successfully", id);

        return ResponseEntity.ok(ApiResponse.success(toResponse(updated), "Group session updated successfully"));
    }

    // ── Soft Delete ──────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable UUID id) {
        GroupSession session = groupSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group session not found: " + id));

        if ("DELETED".equals(session.getStatus())) {
            throw new RuntimeException("Session is already deleted");
        }

        session.setStatus("DELETED");
        session.setCancelledAt(java.time.LocalDateTime.now());
        groupSessionRepository.save(session);

        log.info("GroupSession {} soft deleted", id);
        return ResponseEntity.ok(ApiResponse.success(null, "Group session deleted successfully"));
    }

    // ── IN / OUT Attendance Voting ───────────────────────────────────────────

    @PostMapping("/{id}/vote")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<GroupSessionDto.Response>> voteSession(
            @PathVariable UUID id,
            @RequestBody GroupSessionDto.VoteRequest req) {

        String vote = req.getVoteType() != null ? req.getVoteType().toUpperCase().trim() : "IN";
        if (!"IN".equals(vote) && !"OUT".equals(vote)) {
            throw new RuntimeException("Invalid vote type: " + vote + ". Must be 'IN' or 'OUT'.");
        }

        GroupSession session = groupSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group session not found: " + id));

        if ("CANCELLED".equals(session.getStatus()) || "DELETED".equals(session.getStatus())) {
            throw new RuntimeException("Cannot vote on a cancelled or deleted session");
        }

        if (session.getAttendeeIds() == null) {
            session.setAttendeeIds(new java.util.HashSet<>());
        }
        if (session.getOutVoteIds() == null) {
            session.setOutVoteIds(new java.util.HashSet<>());
        }

        UUID userId = resolveCurrentUserId();

        if ("IN".equals(vote)) {
            if (session.getAttendeeIds().contains(userId)) {
                throw new RuntimeException("You have already voted IN for this activity!");
            }
            if (session.getAttendeeIds().size() >= session.getAvailableSlots()) {
                throw new RuntimeException("Session is fully booked");
            }
            session.getOutVoteIds().remove(userId);
            session.getAttendeeIds().add(userId);
        } else {
            // OUT vote
            session.getAttendeeIds().remove(userId);
            session.getOutVoteIds().add(userId);
        }

        session.setBookedCount(session.getAttendeeIds().size());
        GroupSession saved = groupSessionRepository.save(session);

        log.info("User {} voted {} for session {}. InCount: {}, OutCount: {}", userId, vote, id, saved.getAttendeeIds().size(), saved.getOutVoteIds().size());
        return ResponseEntity.ok(ApiResponse.success(toResponse(saved), "Vote '" + vote + "' recorded successfully!"));
    }

    // ── Book Spot ────────────────────────────────────────────────────────────

    @PostMapping("/{id}/book")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<GroupSessionDto.Response>> bookSpot(@PathVariable UUID id) {
        GroupSessionDto.VoteRequest req = new GroupSessionDto.VoteRequest();
        req.setVoteType("IN");
        return voteSession(id, req);
    }

    // ── Mapper ───────────────────────────────────────────────────────────────

    private GroupSessionDto.Response toResponse(GroupSession s) {
        GroupSessionDto.Response r = new GroupSessionDto.Response();
        r.setId(s.getId());
        r.setTitle(s.getTitle());
        r.setDescription(s.getDescription());
        r.setSessionDate(s.getSessionDate());
        r.setSessionTime(s.getSessionTime());
        r.setDurationMins(s.getDurationMins());
        r.setAvailableSlots(s.getAvailableSlots());
        r.setBookedCount(s.getAttendeeIds() != null ? s.getAttendeeIds().size() : s.getBookedCount());
        r.setOutCount(s.getOutVoteIds() != null ? s.getOutVoteIds().size() : 0);
        r.setRemainingSlots(s.getAvailableSlots() - r.getBookedCount());
        r.setBranchIds(s.getBranchIds());
        r.setNotifyRoles(s.getNotifyRoles());
        r.setAttendeeIds(s.getAttendeeIds());
        r.setOutVoteIds(s.getOutVoteIds());

        boolean isBookedByMe = false;
        String myVote = null;
        try {
            UUID userId = resolveCurrentUserId();
            if (userId != null) {
                if (s.getAttendeeIds() != null && s.getAttendeeIds().contains(userId)) {
                    isBookedByMe = true;
                    myVote = "IN";
                } else if (s.getOutVoteIds() != null && s.getOutVoteIds().contains(userId)) {
                    myVote = "OUT";
                }
            }
        } catch (Exception e) {
            // Ignore if security context is not available
        }
        r.setBookedByMe(isBookedByMe);
        r.setMyVote(myVote);

        r.setStatus(s.getStatus());
        r.setCancellationReason(s.getCancellationReason());
        r.setCancelledAt(s.getCancelledAt());
        r.setOrgId(s.getOrgId());
        r.setCreatedAt(s.getCreatedAt());
        return r;
    }
}
