package com.gymbross.usermanagement.controller;

import com.gymbross.usermanagement.dto.UserProfileDto;
import com.gymbross.usermanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow frontend access
public class PublicController {

    private final UserService userService;

    @GetMapping("/invite-details")
    public ResponseEntity<UserProfileDto> getInviteDetails(
            @RequestParam String userCode,
            @RequestParam String adminCode,
            @RequestParam(required = false, defaultValue = "USER") String role) {
        return ResponseEntity.ok(userService.getInviteDetails(userCode, adminCode, role));
    }
}
