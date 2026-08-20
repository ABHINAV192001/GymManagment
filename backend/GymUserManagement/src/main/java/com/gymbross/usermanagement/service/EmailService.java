package com.gymbross.usermanagement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final com.Gym.GymCommonServices.service.EmailService commonEmailService;

    public void sendAttendanceNotification(String userEmail, String userName, LocalDateTime checkInTime, Long daysLeft, int streakGained) {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            log.warn("Cannot send email: User email is empty for user {}", userName);
            return;
        }

        String subject = "Gym Attendance Marked!";
        StringBuilder sb = new StringBuilder();
        sb.append("Hi ").append(userName).append(",\n\n");
        sb.append("Your attendance has been successfully marked for today at ").append(checkInTime).append(".\n");
        if (streakGained > 0) {
            sb.append("You gained a +").append(streakGained).append(" streak! Keep up the good work!\n");
        }
        if (daysLeft != null) {
            sb.append("You have ").append(daysLeft).append(" days left on your gym membership.\n");
        }
        sb.append("\nBest regards,\nGymBross Team");

        log.info("Dispatching attendance notification email to: {}", userEmail);
        commonEmailService.sendEmail(userEmail, subject, sb.toString());
    }
}

