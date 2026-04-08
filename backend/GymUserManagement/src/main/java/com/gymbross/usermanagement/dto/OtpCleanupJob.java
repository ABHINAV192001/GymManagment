package com.gymbross.usermanagement.dto;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.gymbross.usermanagement.repository.OtpRepository;

import lombok.RequiredArgsConstructor;

@EnableScheduling
@Component
@RequiredArgsConstructor
public class OtpCleanupJob {

    private final OtpRepository otpRepository;

    @Scheduled(cron = "0 */10 * * * *") // every 10 minutes
    @org.springframework.transaction.annotation.Transactional
    public void cleanExpiredOtps() {
        otpRepository.deleteExpiredOtps(LocalDateTime.now());
    }
}
