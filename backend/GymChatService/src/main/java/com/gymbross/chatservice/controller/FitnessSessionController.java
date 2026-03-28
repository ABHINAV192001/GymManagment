package com.gymbross.chatservice.controller;

import com.Gym.GymCommonServices.entity.FitnessSession;
import com.gymbross.chatservice.service.FitnessSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class FitnessSessionController {

    @Autowired
    private FitnessSessionService fitnessSessionService;

    @GetMapping
    public List<FitnessSession> getAllSessions() {
        return fitnessSessionService.getAllSessions();
    }

    @PostMapping
    public FitnessSession createSession(@RequestBody FitnessSession session) {
        System.out.println("DEBUG: FitnessSessionController - createSession hit with: " + session);
        return fitnessSessionService.createSession(session);
    }

    @GetMapping("/{id}")
    public FitnessSession getSession(@PathVariable Long id) {
        return fitnessSessionService.getSession(id);
    }

    @PostMapping("/{id}/vote")
    public void vote(@PathVariable Long id, @RequestParam String vote, @RequestParam String username) {
        fitnessSessionService.vote(id, vote, username);
    }

    @PutMapping("/{id}")
    public FitnessSession updateSession(@PathVariable Long id, @RequestBody FitnessSession session) {
        return fitnessSessionService.updateSession(id, session);
    }

    @GetMapping("/{id}/vote-status")
    public String checkVote(@PathVariable Long id, @RequestParam String username) {
        return fitnessSessionService.checkVoteStatus(id, username);
    }

    @DeleteMapping("/{id}")
    public void deleteSession(@PathVariable Long id) {
        fitnessSessionService.deleteSession(id);
    }
}
