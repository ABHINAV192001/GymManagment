package com.gymbross.usermanagement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final com.Gym.GymCommonServices.service.EmailService commonEmailService;
    private final com.Gym.GymCommonServices.service.AppUrlService appUrlService;

    /**
     * Resolves the frontend base URL dynamically via AppUrlService.
     */
    public String getCleanFrontendUrl() {
        return appUrlService.resolveFrontendUrl();
    }

    /**
     * Sanitizes any URL ensuring clean whitespace.
     */
    public String sanitizeUrl(String url) {
        if (url == null || url.isBlank()) {
            return appUrlService.resolveFrontendUrl();
        }
        return url.trim();
    }

    /**
     * Sends an attendance confirmation HTML email upon successful check-in.
     */
    public void sendAttendanceNotification(String userEmail, String userName, LocalDateTime checkInTime, Long daysLeft, int streakGained) {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            log.warn("Cannot send email: User email is empty for user {}", userName);
            return;
        }

        String formattedTime = checkInTime != null
                ? checkInTime.format(DateTimeFormatter.ofPattern("hh:mm a, dd MMM yyyy"))
                : LocalDateTime.now().format(DateTimeFormatter.ofPattern("hh:mm a, dd MMM yyyy"));

        String subject = "✅ Gym Attendance Confirmed - " + formattedTime;
        String attendanceUrl = appUrlService.buildFrontendUrl("/attendance");

        String htmlContent = buildAttendanceConfirmationHtml(userName, formattedTime, daysLeft, streakGained, attendanceUrl);

        log.info("Dispatching rich HTML attendance confirmation email to: {}", userEmail);
        commonEmailService.sendHtmlEmail(userEmail.trim(), subject, htmlContent);
    }

    /**
     * Overloaded method with default gym name.
     */
    public void sendMissedAttendanceReminder(String userEmail, String userName, String dateStr) {
        sendMissedAttendanceReminder(userEmail, userName, dateStr, "GymBross Fitness");
    }

    /**
     * Sends a modern, high-impact HTML attendance reminder email with direct redirect to the Attendance desk.
     */
    public void sendMissedAttendanceReminder(String userEmail, String userName, String dateStr, String gymName) {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            log.warn("Cannot send missed attendance email: User email is empty for user {}", userName);
            return;
        }

        String subject = "⏰ Reminder: Mark your attendance for " + dateStr;
        String attendanceUrl = appUrlService.buildFrontendUrl("/attendance");
        String loginUrl = appUrlService.buildFrontendUrl("/auth/login?redirect=%2Fattendance");

        String htmlContent = buildMissedAttendanceReminderHtml(userName, userEmail.trim(), dateStr, gymName, attendanceUrl, loginUrl);

        log.info("Dispatching rich HTML missed attendance reminder email to: {}", userEmail);
        commonEmailService.sendHtmlEmail(userEmail.trim(), subject, htmlContent);
    }

    /**
     * Builds an enterprise-grade dark HTML email for missed attendance reminders.
     */
    public String buildMissedAttendanceReminderHtml(
            String name,
            String email,
            String dateStr,
            String gymName,
            String attendanceUrl,
            String loginUrl) {

        String displayName = (name != null && !name.isBlank()) ? name.trim() : "Valued Member";
        String displayGym = (gymName != null && !gymName.isBlank()) ? gymName.trim() : "GymBross Fitness";
        String displayDate = (dateStr != null && !dateStr.isBlank()) ? dateStr.trim() : "Today";
        String cleanAttendanceLink = sanitizeUrl(attendanceUrl);
        String cleanLoginLink = sanitizeUrl(loginUrl);

        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>Attendance Reminder - " + displayGym + "</title>\n" +
                "</head>\n" +
                "<body style=\"margin:0; padding:0; background-color:#09090b; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#f4f4f5;\">\n" +
                "  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#09090b; padding:36px 12px;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\">\n" +
                "        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px; background-color:#18181b; border:1px solid #27272a; border-radius:16px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.6);\">\n" +
                "          <!-- Vibrant Alert Header -->\n" +
                "          <tr>\n" +
                "            <td style=\"background: linear-gradient(135deg, #d97706 0%, #ea580c 55%, #c2410c 100%); padding: 32px 24px; text-align: center;\">\n" +
                "              <div style=\"display:inline-block; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.3); padding:5px 16px; border-radius:9999px; font-size:11px; font-weight:800; color:#ffffff; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px;\">\n" +
                "                ⏰ ATTENDANCE REMINDER\n" +
                "              </div>\n" +
                "              <h1 style=\"margin:0; color:#ffffff; font-size:25px; font-weight:900; letter-spacing:0.5px;\">🏋️‍♂️ GYMBROSS FITNESS</h1>\n" +
                "              <p style=\"margin:6px 0 0 0; color:#fef3c7; font-size:14px; font-weight:600;\">" + displayGym + " • Daily Check-In & Streak Tracker</p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "\n" +
                "          <!-- Card Content -->\n" +
                "          <tr>\n" +
                "            <td style=\"padding:32px 28px;\">\n" +
                "              <h2 style=\"margin:0 0 12px 0; color:#ffffff; font-size:21px; font-weight:700;\">Don't Break Your Streak! 🔥</h2>\n" +
                "              <p style=\"margin:0 0 22px 0; color:#a1a1aa; font-size:14px; line-height:1.6;\">\n" +
                "                Hi <strong style=\"color:#ffffff;\">" + displayName + "</strong>,<br/>\n" +
                "                We noticed you haven't checked in or marked your attendance for today (<strong style=\"color:#fbbf24;\">" + displayDate + "</strong>). Daily check-ins help keep your activity tracked, maintain your gym streak, and ensure your progress is logged!\n" +
                "              </p>\n" +
                "\n" +
                "              <!-- Attendance Status Summary Card -->\n" +
                "              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#121215; border:1px solid #27272a; border-radius:12px; margin-bottom:26px;\">\n" +
                "                <tr>\n" +
                "                  <td style=\"padding:10px 14px; font-size:13px; color:#71717a; width:38%; border-bottom:1px solid #1f1f23;\">Target Date:</td>\n" +
                "                  <td style=\"padding:10px 14px; font-size:13px; color:#f4f4f5; font-weight:700; border-bottom:1px solid #1f1f23;\">" + displayDate + "</td>\n" +
                "                </tr>\n" +
                "                <tr>\n" +
                "                  <td style=\"padding:10px 14px; font-size:13px; color:#71717a; border-bottom:1px solid #1f1f23;\">Attendance Status:</td>\n" +
                "                  <td style=\"padding:10px 14px; font-size:13px; border-bottom:1px solid #1f1f23;\">\n" +
                "                    <span style=\"display:inline-block; background-color:rgba(234, 88, 12, 0.18); border:1px solid #ea580c; color:#fb923c; padding:3px 10px; border-radius:6px; font-weight:700; font-size:11px; letter-spacing:0.5px;\">⚠️ PENDING / UNMARKED</span>\n" +
                "                  </td>\n" +
                "                </tr>\n" +
                "                <tr>\n" +
                "                  <td style=\"padding:10px 14px; font-size:13px; color:#71717a; border-bottom:1px solid #1f1f23;\">Facility / Branch:</td>\n" +
                "                  <td style=\"padding:10px 14px; font-size:13px; color:#f4f4f5; font-weight:600; border-bottom:1px solid #1f1f23;\">" + displayGym + "</td>\n" +
                "                </tr>\n" +
                "                <tr>\n" +
                "                  <td style=\"padding:10px 14px; font-size:13px; color:#71717a;\">Recommended Action:</td>\n" +
                "                  <td style=\"padding:10px 14px; font-size:13px; color:#38bdf8; font-weight:600;\">Open Attendance Desk / Scan QR</td>\n" +
                "                </tr>\n" +
                "              </table>\n" +
                "\n" +
                "              <!-- Fast Action Section -->\n" +
                "              <div style=\"background-color:#141417; border:1px solid #27272a; border-radius:14px; padding:22px; margin-bottom:24px;\">\n" +
                "                <div style=\"font-size:14px; font-weight:800; color:#ffffff; margin-bottom:14px; letter-spacing:0.3px;\">\n" +
                "                  ⚡ Quick Actions:\n" +
                "                </div>\n" +
                "\n" +
                "                <p style=\"margin:0 0 16px 0; font-size:13px; color:#a1a1aa; line-height:1.5;\">\n" +
                "                  Click the button below to go directly to the Attendance Desk where you can mark your daily attendance or validate your member pass:\n" +
                "                </p>\n" +
                "\n" +
                "                <!-- Primary CTA Button -->\n" +
                "                <div style=\"text-align:center; margin:16px 0 14px 0;\">\n" +
                "                  <a href=\"" + cleanAttendanceLink + "\" style=\"display:inline-block; background:linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color:#ffffff; text-decoration:none; font-weight:800; font-size:15px; padding:14px 34px; border-radius:10px; box-shadow:0 4px 16px rgba(234, 88, 12, 0.4); letter-spacing:0.3px;\">\n" +
                "                    📍 Mark Attendance Now\n" +
                "                  </a>\n" +
                "                </div>\n" +
                "\n" +
                "                <p style=\"margin:16px 0 12px 0; font-size:12px; color:#71717a; text-align:center;\">\n" +
                "                  If you are not logged in, sign in below to proceed directly to the attendance desk:\n" +
                "                </p>\n" +
                "\n" +
                "                <!-- Secondary Login CTA Button -->\n" +
                "                <div style=\"text-align:center; margin:8px 0 4px 0;\">\n" +
                "                  <a href=\"" + cleanLoginLink + "\" style=\"display:inline-block; background-color:#27272a; border:1px solid #3f3f46; color:#e4e4e7; text-decoration:none; font-weight:700; font-size:13px; padding:10px 24px; border-radius:8px; box-shadow:0 2px 8px rgba(0, 0, 0, 0.3);\">\n" +
                "                    🔑 Log In to Account\n" +
                "                  </a>\n" +
                "                </div>\n" +
                "              </div>\n" +
                "\n" +
                "              <!-- Pro-Tip Box -->\n" +
                "              <div style=\"background-color:#1c1917; border:1px solid #44403c; border-radius:10px; padding:14px 16px; margin-bottom:24px;\">\n" +
                "                <div style=\"font-size:13px; font-weight:700; color:#fdba74; margin-bottom:4px;\">💡 Pro-Tip: Entrance QR Scanning</div>\n" +
                "                <div style=\"font-size:12px; color:#a8a29e; line-height:1.5;\">\n" +
                "                  You can also scan your member pass QR at the gym front desk tablet or turnstile for instant check-in without manual typing!\n" +
                "                </div>\n" +
                "              </div>\n" +
                "\n" +
                "              <!-- Security & Notice -->\n" +
                "              <div style=\"padding-top:16px; border-top:1px solid #27272a; font-size:12px; color:#71717a; line-height:1.5;\">\n" +
                "                🔒 <strong style=\"color:#a1a1aa;\">Automated Notification:</strong> Sent by GymBross Operations to " + email + ". If you have already marked your attendance today, you may disregard this notice.\n" +
                "              </div>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "\n" +
                "          <!-- Footer -->\n" +
                "          <tr>\n" +
                "            <td style=\"background-color:#09090b; padding:20px 24px; text-align:center; border-top:1px solid #27272a; font-size:12px; color:#71717a;\">\n" +
                "              © 2026 GymBross Inc. All rights reserved. • High Performance Fitness Operations\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
                "</html>";
    }

    /**
     * Builds an enterprise-grade dark HTML email for attendance check-in confirmation.
     */
    public String buildAttendanceConfirmationHtml(
            String name,
            String checkInTime,
            Long daysLeft,
            int streakGained,
            String attendanceUrl) {

        String displayName = (name != null && !name.isBlank()) ? name.trim() : "Valued Member";
        String cleanAttendanceLink = sanitizeUrl(attendanceUrl);

        StringBuilder streakBadge = new StringBuilder();
        if (streakGained > 0) {
            streakBadge.append("<tr>\n")
                    .append("  <td style=\"padding:10px 14px; font-size:13px; color:#71717a; border-bottom:1px solid #1f1f23;\">Streak Bonus:</td>\n")
                    .append("  <td style=\"padding:10px 14px; font-size:13px; border-bottom:1px solid #1f1f23;\">\n")
                    .append("    <span style=\"display:inline-block; background-color:rgba(16, 185, 129, 0.2); border:1px solid #10b981; color:#34d399; padding:3px 10px; border-radius:6px; font-weight:800; font-size:12px;\">🔥 +")
                    .append(streakGained).append(" Streak Point!</span>\n")
                    .append("  </td>\n")
                    .append("</tr>\n");
        }

        StringBuilder daysLeftRow = new StringBuilder();
        if (daysLeft != null) {
            daysLeftRow.append("<tr>\n")
                    .append("  <td style=\"padding:10px 14px; font-size:13px; color:#71717a; border-bottom:1px solid #1f1f23;\">Membership Status:</td>\n")
                    .append("  <td style=\"padding:10px 14px; font-size:13px; color:#f4f4f5; font-weight:700; border-bottom:1px solid #1f1f23;\">⏳ ")
                    .append(daysLeft).append(" days remaining</td>\n")
                    .append("</tr>\n");
        }

        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>Attendance Confirmed</title>\n" +
                "</head>\n" +
                "<body style=\"margin:0; padding:0; background-color:#09090b; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#f4f4f5;\">\n" +
                "  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#09090b; padding:36px 12px;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\">\n" +
                "        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px; background-color:#18181b; border:1px solid #27272a; border-radius:16px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.6);\">\n" +
                "          <!-- Emerald Success Header -->\n" +
                "          <tr>\n" +
                "            <td style=\"background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center;\">\n" +
                "              <div style=\"display:inline-block; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.3); padding:5px 16px; border-radius:9999px; font-size:11px; font-weight:800; color:#ffffff; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px;\">\n" +
                "                ✅ ATTENDANCE CONFIRMED\n" +
                "              </div>\n" +
                "              <h1 style=\"margin:0; color:#ffffff; font-size:25px; font-weight:900; letter-spacing:0.5px;\">🏋️‍♂️ GYMBROSS FITNESS</h1>\n" +
                "              <p style=\"margin:6px 0 0 0; color:#d1fae5; font-size:14px; font-weight:600;\">Workout & Check-In Logged</p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "\n" +
                "          <!-- Content -->\n" +
                "          <tr>\n" +
                "            <td style=\"padding:32px 28px;\">\n" +
                "              <h2 style=\"margin:0 0 12px 0; color:#ffffff; font-size:21px; font-weight:700;\">Great Job Showing Up! 💪</h2>\n" +
                "              <p style=\"margin:0 0 22px 0; color:#a1a1aa; font-size:14px; line-height:1.6;\">\n" +
                "                Hi <strong style=\"color:#ffffff;\">" + displayName + "</strong>,<br/>\n" +
                "                Your gym attendance has been successfully marked for today. Keep up the consistency and stay committed to your goals!\n" +
                "              </p>\n" +
                "\n" +
                "              <!-- Details Table -->\n" +
                "              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#121215; border:1px solid #27272a; border-radius:12px; margin-bottom:26px;\">\n" +
                "                <tr>\n" +
                "                  <td style=\"padding:10px 14px; font-size:13px; color:#71717a; width:38%; border-bottom:1px solid #1f1f23;\">Check-In Time:</td>\n" +
                "                  <td style=\"padding:10px 14px; font-size:13px; color:#34d399; font-weight:700; border-bottom:1px solid #1f1f23;\">" + checkInTime + "</td>\n" +
                "                </tr>\n" +
                streakBadge.toString() +
                daysLeftRow.toString() +
                "                <tr>\n" +
                "                  <td style=\"padding:10px 14px; font-size:13px; color:#71717a;\">Status:</td>\n" +
                "                  <td style=\"padding:10px 14px; font-size:13px; color:#10b981; font-weight:700;\">Active & Recorded</td>\n" +
                "                </tr>\n" +
                "              </table>\n" +
                "\n" +
                "              <!-- CTA Button -->\n" +
                "              <div style=\"text-align:center; margin:22px 0 16px 0;\">\n" +
                "                <a href=\"" + cleanAttendanceLink + "\" style=\"display:inline-block; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#ffffff; text-decoration:none; font-weight:800; font-size:15px; padding:14px 34px; border-radius:10px; box-shadow:0 4px 16px rgba(16, 185, 129, 0.4); letter-spacing:0.3px;\">\n" +
                "                  📊 View Attendance & Workouts\n" +
                "                </a>\n" +
                "              </div>\n" +
                "\n" +
                "              <!-- Footer Note -->\n" +
                "              <div style=\"padding-top:16px; border-top:1px solid #27272a; font-size:12px; color:#71717a; line-height:1.5;\">\n" +
                "                🔒 Track your routine, log meals, and view your trainer notes anytime on the GymBross platform.\n" +
                "              </div>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "\n" +
                "          <!-- Footer -->\n" +
                "          <tr>\n" +
                "            <td style=\"background-color:#09090b; padding:20px 24px; text-align:center; border-top:1px solid #27272a; font-size:12px; color:#71717a;\">\n" +
                "              © 2026 GymBross Inc. All rights reserved. • High Performance Fitness Operations\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
                "</html>";
    }
}
