package com.gymbross.usermanagement.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
public class EmailService {

    public void sendAttendanceNotification(String userEmail, String userName, LocalDateTime checkInTime, Long daysLeft, int streakGained) {
        if (userEmail == null || userEmail.isEmpty()) {
            log.warn("Cannot send email: User email is empty for user {}", userName);
            return;
        }

        log.info("==================================================");
        log.info("Sending Email to: {}", userEmail);
        log.info("Subject: Gym Attendance Marked!");
        log.info("Body:");
        log.info("Hi {},", userName);
        log.info("Your attendance has been successfully marked for today at {}.", checkInTime);
        if (streakGained > 0) {
            log.info("You gained a +{} streak! Keep up the good work!", streakGained);
        }
        if (daysLeft != null) {
            log.info("You have {} days left on your gym membership.", daysLeft);
        }
        log.info("==================================================");
        
        // TODO: In a real production environment, inject JavaMailSender here 
        // and send an actual email via SMTP.
    }
}
