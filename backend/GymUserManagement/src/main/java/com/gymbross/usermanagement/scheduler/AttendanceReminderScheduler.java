package com.gymbross.usermanagement.scheduler;

import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.entity.AttendanceLog;
import com.gymbross.usermanagement.repository.AttendanceLogRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class AttendanceReminderScheduler {

    private final UserRepository userRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final EmailService emailService;

    /**
     * Daily scheduled task to send email reminders to non-admin users
     * who have not marked their attendance today.
     * Default cron: 11:00 PM IST (17:30 UTC -> '0 30 17 * * *').
     */
    @Scheduled(cron = "${attendance.reminder.cron:0 30 17 * * *}")
    @Transactional(readOnly = true)
    public void sendDailyAttendanceReminders() {
        log.info("Running daily attendance reminder scheduler...");

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        String todayStr = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy"));

        List<User> allUsers = userRepository.findAll();
        int count = 0;

        for (User user : allUsers) {
            // Skip inactive or deleted users
            if (Boolean.FALSE.equals(user.getIsActive()) || Boolean.TRUE.equals(user.getIsDeleted())) {
                continue;
            }

            // Check if user is an admin
            String role = user.getRole();
            if (role != null) {
                String upperRole = role.toUpperCase();
                if (upperRole.contains("ADMIN")) {
                    continue; // Skip admins
                }
            }

            // Check if user has attendance log for today
            List<AttendanceLog> todayLogs = attendanceLogRepository.findTodayLogsByEntityId(
                    user.getId(), startOfDay, endOfDay);

            if (todayLogs.isEmpty()) {
                // User missed attendance! Send email
                emailService.sendMissedAttendanceReminder(user.getEmail(), user.getName(), todayStr);
                count++;
            }
        }

        log.info("Finished attendance reminder scheduler. Sent {} reminder emails.", count);
    }
}
