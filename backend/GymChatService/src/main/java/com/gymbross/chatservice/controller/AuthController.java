package com.gymbross.chatservice.controller;

import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.Role;
import com.gymbross.chatservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already taken");
        }
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds) {
        Optional<User> userOpt = userRepository.findByUsername(creds.get("username"));
        if (userOpt.isPresent() && userOpt.get().getPasswordHash().equals(creds.get("password"))) {
            return ResponseEntity.ok(userOpt.get());
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }
}
