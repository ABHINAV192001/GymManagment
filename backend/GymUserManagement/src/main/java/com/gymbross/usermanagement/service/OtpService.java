package com.gymbross.usermanagement.service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Gym.GymCommonServices.entity.Otp;
import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.service.EmailService;
import com.gymbross.usermanagement.repository.OtpRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.repository.OrganizationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(noRollbackFor = {IllegalArgumentException.class})
public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final com.Gym.GymCommonServices.service.WhatsAppService whatsAppService;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private static final int OTP_VALID_MINUTES = 15;
    private static final int RESEND_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 3;

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW, noRollbackFor = {IllegalArgumentException.class})
    public void sendOtp(String email, String phone, String otpType) {
        sendOtp(email, phone, otpType, null);
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW, noRollbackFor = {IllegalArgumentException.class})
    public void sendOtp(String email, String phone, String otpType, String inviteLink) {

        // Check cooldown
        otpRepository.findTopByEmailAndOtpTypeOrderByCreatedAtDesc(email, otpType)
                .ifPresent(last -> {
                    if (last.getCreatedAt()
                            .isAfter(java.time.Instant.now().minusSeconds(RESEND_SECONDS))) {
                        throw new IllegalArgumentException("Please wait 60 seconds before requesting another OTP.");
                    }
                });

        User user = userRepository.findTopByEmail(email).orElse(null);
        com.Gym.GymCommonServices.entity.Organization organization = organizationRepository.findTopByOwnerEmail(email)
                .orElse(null);
        com.Gym.GymCommonServices.entity.User admin = userRepository.findTopByEmail(email).orElse(null);

        com.Gym.GymCommonServices.entity.Branch branch = null;
        if (admin != null) {
            branch = admin.getBranch();
        }

        String recipientPhone = phone;
        if ((recipientPhone == null || recipientPhone.isBlank()) && user != null && user.getPhone() != null) {
            recipientPhone = user.getPhone();
        }
        if ((recipientPhone == null || recipientPhone.isBlank()) && organization != null && organization.getPhone() != null) {
            recipientPhone = organization.getPhone();
        }

        String otpCode = String.valueOf(100000 + new Random().nextInt(900000));

        otpRepository.save(Otp.builder()
                .email(email)
                .phone(recipientPhone)
                .otpType(otpType)
                .otpCode(passwordEncoder.encode(otpCode))
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusMinutes(OTP_VALID_MINUTES))
                .isUsed(false)
                .attempts(0)
                .user(user)
                .organization(organization)
                .branch(branch)
                .build());

        String subject = "Account Verification & Password Setup - GymBross";
        String actionLink = null;
        if (inviteLink != null && !inviteLink.isEmpty()) {
            actionLink = inviteLink;
        } else if ("REGISTER".equals(otpType)) {
            actionLink = frontendUrl + "/auth/verify-admin?email=" + email + "&otp=" + otpCode;
        }

        String userName = (user != null && user.getName() != null) ? user.getName() : 
                         ((organization != null && organization.getOwnerName() != null) ? organization.getOwnerName() : email.split("@")[0]);

        String htmlContent = buildHtmlEmail(userName, otpCode, OTP_VALID_MINUTES, actionLink);

        // Send HTML Email
        emailService.sendHtmlEmail(email, subject, htmlContent);

        // Send WhatsApp Notification
        if (recipientPhone != null && !recipientPhone.isBlank()) {
            whatsAppService.sendOtpNotification(recipientPhone, userName, otpCode, OTP_VALID_MINUTES, actionLink);
        }
    }

    private String buildHtmlEmail(String name, String otpCode, int validMinutes, String actionLink) {
        String greetingName = (name != null && !name.isBlank()) ? name : "Valued User";
        
        StringBuilder buttonHtml = new StringBuilder();
        if (actionLink != null && !actionLink.isBlank()) {
            buttonHtml.append("<div style=\"text-align: center; margin: 28px 0;\">")
                      .append("  <a href=\"").append(actionLink).append("\" style=\"display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);\">")
                      .append("    👉 Activate Account & Set Password")
                      .append("  </a>")
                      .append("</div>")
                      .append("<p style=\"margin: 12px 0 0 0; font-size: 12px; color: #a1a1aa; text-align: center; word-break: break-all;\">")
                      .append("  Or copy & paste this URL: <br/><a href=\"").append(actionLink).append("\" style=\"color: #34d399; text-decoration: underline;\">").append(actionLink).append("</a>")
                      .append("</p>");
        }

        return "<!DOCTYPE html>" +
               "<html>" +
               "<head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"></head>" +
               "<body style=\"margin:0; padding:0; background-color:#09090b; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#f4f4f5;\">" +
               "  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#09090b; padding:40px 10px;\">" +
               "    <tr><td align=\"center\">" +
               "      <table role=\"presentation\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#18181b; border:1px solid #27272a; border-radius:16px; overflow:hidden;\">" +
               "        <tr>" +
               "          <td style=\"background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center;\">" +
               "            <h1 style=\"margin:0; color:#ffffff; font-size:26px; font-weight:800; letter-spacing:0.5px;\">🏋️‍♂️ GYMBROSS PLATFORM</h1>" +
               "            <p style=\"margin:6px 0 0 0; color:#d1fae5; font-size:13px; font-weight:500;\">Enterprise Fitness & Member Operations</p>" +
               "          </td>" +
               "        </tr>" +
               "        <tr>" +
               "          <td style=\"padding:32px 28px;\">" +
               "            <h2 style=\"margin:0 0 16px 0; color:#ffffff; font-size:20px; font-weight:700;\">Account Verification & Password Setup</h2>" +
               "            <p style=\"margin:0 0 24px 0; color:#a1a1aa; font-size:14px; line-height:1.6;\">Hello <strong style=\"color:#ffffff;\">" + greetingName + "</strong>,<br/>Welcome to <strong style=\"color:#ffffff;\">GymBross</strong>! Your account registration has been initiated. Please use the verification code below to set up your password.</p>" +
               "            <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin-bottom:24px;\">" +
               "              <tr><td align=\"center\" style=\"background-color:#064e3b; border:1px solid #10b981; border-radius:12px; padding:20px;\">" +
               "                <div style=\"font-size:12px; font-weight:600; text-transform:uppercase; color:#6ee7b7; letter-spacing:1px; margin-bottom:6px;\">One-Time Password (OTP)</div>" +
               "                <div style=\"font-size:36px; font-weight:900; color:#34d399; letter-spacing:8px; font-family:'Courier New',monospace;\">" + otpCode + "</div>" +
               "                <div style=\"font-size:12px; color:#a7f3d0; margin-top:6px;\">⏱ Valid for " + validMinutes + " minutes</div>" +
               "              </td></tr>" +
               "            </table>" +
               buttonHtml.toString() +
               "            <div style=\"margin-top:32px; padding-top:20px; border-top:1px solid #27272a; font-size:12px; color:#71717a; line-height:1.5;\">" +
               "              🔒 <strong style=\"color:#a1a1aa;\">Security Notice:</strong> Do not share this OTP or setup link with anyone. GymBross will never ask for your credentials." +
               "            </div>" +
               "          </td>" +
               "        </tr>" +
               "        <tr>" +
               "          <td style=\"background-color:#09090b; padding:20px 24px; text-align:center; border-top:1px solid #27272a; font-size:12px; color:#71717a;\">" +
               "            © 2026 GymBross Inc. All rights reserved." +
               "          </td>" +
               "        </tr>" +
               "      </table>" +
               "    </td></tr>" +
               "  </table>" +
               "</body>" +
               "</html>";
    }

    public void verifyOtp(String email, String otpCode, String otpType) {

        Otp otp = otpRepository
                .findTopByEmailAndOtpTypeOrderByCreatedAtDesc(email, otpType)
                .orElseThrow(() -> new IllegalArgumentException("OTP not found. Please click 'Resend OTP' to request a new code."));

        if (otp.getIsUsed()) {
            throw new IllegalArgumentException("OTP has already been used. Please log in or request a new code.");
        }

        if (otp.getEndTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired. Please click 'Resend OTP' to receive a new 6-digit code.");
        }

        if (otp.getAttempts() >= MAX_ATTEMPTS) {
            throw new IllegalArgumentException("OTP locked after 3 failed attempts. Please request a new OTP.");
        }

        if (!passwordEncoder.matches(otpCode, otp.getOtpCode())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            throw new IllegalArgumentException("Invalid OTP code. Please check your email and try again.");
        }

        otp.setIsUsed(true);
        otpRepository.save(otp);

        userRepository.updateStatusByEmail(email);
        userRepository.updateStatusByEmail(email);
        organizationRepository.updateStatusByEmail(email);
    }
}
