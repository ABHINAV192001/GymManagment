package com.Gym.GymCommonServices.service.impl;

import com.Gym.GymCommonServices.service.WhatsAppService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class LocalWhatsAppService implements WhatsAppService {

    @Override
    public boolean sendWhatsAppMessage(String toPhoneNumber, String messageBody) {
        if (toPhoneNumber == null || toPhoneNumber.isBlank()) {
            log.warn("Cannot send WhatsApp message: Recipient phone number is empty");
            return false;
        }

        String formattedTo = formatWhatsAppNumber(toPhoneNumber);
        log.info("[WHATSAPP NOTIFICATION LOGGED] To: {}\nMessage:\n{}", formattedTo, messageBody);
        return true;
    }

    @Override
    public boolean sendAccountCreatedNotification(String toPhoneNumber, String name, String email, String temporaryPasswordOrLink, String role) {
        String greeting = (name != null && !name.isBlank()) ? name : "Valued Member";
        String userRole = (role != null && !role.isBlank()) ? role : "Member";

        StringBuilder sb = new StringBuilder();
        sb.append("🏋️‍♂️ *WELCOME TO PLATFORM*\n\n");
        sb.append("Hello *").append(greeting).append("*,\n");
        sb.append("Your account has been created successfully!\n\n");
        sb.append("📋 *Account Credentials:*\n");
        sb.append("• *Username / Email:* ").append(email).append("\n");
        sb.append("• *Role:* ").append(userRole).append("\n");

        if (temporaryPasswordOrLink != null && !temporaryPasswordOrLink.isBlank()) {
            sb.append("• *Setup Password Link:*\n").append(temporaryPasswordOrLink).append("\n\n");
            sb.append("👉 Please click the link above to activate your account and set your login password.\n");
        }

        sb.append("\n💪 Stay strong and keep crushing your fitness goals!");
        return sendWhatsAppMessage(toPhoneNumber, sb.toString());
    }

    @Override
    public boolean sendOtpNotification(String toPhoneNumber, String name, String otpCode, int expiryMinutes, String verificationLink) {
        String greeting = (name != null && !name.isBlank()) ? name : "User";
        String message = String.format("Hello %s,\n🔒 Your Verification Code is: *%s*\nIt will expire in %d minutes.\nLink: %s", greeting, otpCode, expiryMinutes, verificationLink != null ? verificationLink : "");
        return sendWhatsAppMessage(toPhoneNumber, message);
    }

    @Override
    public boolean sendGeneralNotification(String toPhoneNumber, String title, String message) {
        String bodyText = String.format("📢 *%s*\n\n%s", title, message);
        return sendWhatsAppMessage(toPhoneNumber, bodyText);
    }

    @Override
    public boolean sendWorkoutAndDietReminder(String toPhoneNumber, String name, String reminderType, String content) {
        String greeting = (name != null && !name.isBlank()) ? name : "Member";
        String bodyText = String.format("🏋️‍♂️ Hello %s,\nYour %s Reminder:\n\n%s", greeting, reminderType != null ? reminderType : "Fitness", content != null ? content : "");
        return sendWhatsAppMessage(toPhoneNumber, bodyText);
    }

    private String formatWhatsAppNumber(String raw) {
        if (raw == null) return null;
        String clean = raw.replaceAll("[^0-9+]", "");
        if (clean.length() == 10) clean = "+91" + clean;
        else if (!clean.startsWith("+")) clean = "+" + clean;
        return "whatsapp:" + clean;
    }
}
