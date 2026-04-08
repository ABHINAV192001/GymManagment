package com.gymbross.chatservice.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.Gym.GymCommonServices.entity.FitnessSession;
import com.gymbross.chatservice.service.FitnessSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/sessions") // Standardized path
@RequiredArgsConstructor
@Slf4j
public class FitnessSessionController {

    private final FitnessSessionService fitnessSessionService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<FitnessSession>>> getAllSessions() {
        return ResponseEntity.ok(ApiResponse.success(fitnessSessionService.getAllSessions()));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<FitnessSession>> createSession(@RequestBody FitnessSession session) {
        log.debug("FitnessSessionController - createSession hit with: {}", session);
        return ResponseEntity.ok(ApiResponse.success(fitnessSessionService.createSession(session), "Fitness session created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FitnessSession>> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(fitnessSessionService.getSession(id)));
    }

    @PostMapping("/{id}/vote")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> vote(@PathVariable Long id, @RequestParam String vote, @RequestParam String username) {
        fitnessSessionService.vote(id, vote, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Vote cast successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<FitnessSession>> updateSession(@PathVariable Long id, @RequestBody FitnessSession session) {
        return ResponseEntity.ok(ApiResponse.success(fitnessSessionService.updateSession(id, session), "Fitness session updated successfully"));
    }

    @GetMapping("/{id}/vote-status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> checkVote(@PathVariable Long id, @RequestParam String username) {
        return ResponseEntity.ok(ApiResponse.success(fitnessSessionService.checkVoteStatus(id, username)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable Long id) {
        fitnessSessionService.deleteSession(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Fitness session deleted successfully"));
    }
}
