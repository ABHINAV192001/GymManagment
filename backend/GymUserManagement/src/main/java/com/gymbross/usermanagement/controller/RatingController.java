package com.gymbross.usermanagement.controller;

import com.gymbross.usermanagement.dto.RatingRequest;
import com.gymbross.usermanagement.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/trainer/{trainerId}")
    public ResponseEntity<Void> rateTrainer(
            Principal principal,
            @PathVariable Long trainerId,
            @RequestBody RatingRequest request) {
        ratingService.rateTrainer(principal.getName(), trainerId, request.getRating(), request.getComment());
        return ResponseEntity.ok().build();
    }
}
