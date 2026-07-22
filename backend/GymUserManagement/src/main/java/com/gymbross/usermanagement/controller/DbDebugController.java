package com.gymbross.usermanagement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/internal/debug")
@RequiredArgsConstructor
public class DbDebugController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/counts")
    @PreAuthorize("hasAuthority('SETTINGS:VIEW')")
    public Map<String, Object> getTableCounts() {
        Map<String, Object> counts = new HashMap<>();
        String[] tables = { "admins", "users", "trainers", "staff", "premium_users", "organizations", "branches" };

        for (String table : tables) {
            try {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class);
                counts.put(table, count);
            } catch (Exception e) {
                counts.put(table, "Error: " + e.getMessage());
            }
        }
        return counts;
    }
}
