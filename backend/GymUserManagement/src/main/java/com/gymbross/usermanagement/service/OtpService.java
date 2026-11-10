package com.gymbross.usermanagement.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Gym.GymCommonServices.entity.Branch;
import com.Gym.GymCommonServices.entity.Organization;
import com.Gym.GymCommonServices.entity.Otp;
import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.service.EmailService;
import com.Gym.GymCommonServices.service.WhatsAppService;
import com.gymbross.usermanagement.repository.BranchRepository;
import com.gymbross.usermanagement.repository.OrganizationRepository;
import com.gymbross.usermanagement.repository.OtpRepository;
import com.gymbross.usermanagement.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(noRollbackFor = {IllegalArgumentException.class})
public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final WhatsAppService whatsAppService;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final BranchRepository branchRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.Gym.GymCommonServices.service.AppUrlService appUrlService;

    private static final int OTP_VALID_MINUTES = 15;
    private static final int RESEND_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 3;

    /**
     * Resolves the base frontend URL dynamically via AppUrlService.
     */
    public String getCleanFrontendUrl() {
        return appUrlService.resolveFrontendUrl();
    }

    /**
     * Sanitizes any URL ensuring clean whitespace.
     */
    public String sanitizeUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return appUrlService.resolveFrontendUrl();
        }
        return url.trim();
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW, noRollbackFor = {IllegalArgumentException.class})
    public void sendOtp(String email, String phone, String otpType) {
        sendOtp(null, email, phone, otpType, null, false);
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW, noRollbackFor = {IllegalArgumentException.class})
    public void sendOtp(String email, String phone, String otpType, String inviteLink) {
        sendOtp(null, email, phone, otpType, inviteLink, false);
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW, noRollbackFor = {IllegalArgumentException.class})
    public void sendRegistrationOtp(User user, String email, String phone, String inviteLink, boolean bypassCooldown) {
        sendOtp(user, email, phone, "REGISTER", inviteLink, bypassCooldown);
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW, noRollbackFor = {IllegalArgumentException.class})
    public void sendOtp(User providedUser, String email, String phone, String otpType, String inviteLink, boolean bypassCooldown) {
        String recipientEmail = email != null ? email.trim() : null;
        if (recipientEmail == null || recipientEmail.isEmpty()) {
            throw new IllegalArgumentException("Recipient email cannot be empty.");
        }

        // Check cooldown unless explicitly bypassed for administrative onboarding/registration
        if (!bypassCooldown) {
            otpRepository.findTopByEmailAndOtpTypeOrderByCreatedAtDesc(recipientEmail, otpType)
                    .ifPresent(last -> {
                        if (last.getCreatedAt().isAfter(java.time.Instant.now().minusSeconds(RESEND_SECONDS))) {
                            throw new IllegalArgumentException("Please wait 60 seconds before requesting another OTP.");
                        }
                    });
        }

        User user = providedUser;
        if (user == null) {
            user = userRepository.findTopByEmail(recipientEmail).orElse(null);
        }

        Organization organization = null;
        if (user != null && user.getOrganization() != null) {
            organization = user.getOrganization();
        } else {
            organization = organizationRepository.findTopByOwnerEmail(recipientEmail).orElse(null);
        }

        Branch branch = null;
        if (user != null && user.getBranch() != null) {
            branch = user.getBranch();
        }

        String recipientPhone = phone;
        if ((recipientPhone == null || recipientPhone.isBlank()) && user != null && user.getPhone() != null) {
            recipientPhone = user.getPhone();
        }
        if ((recipientPhone == null || recipientPhone.isBlank()) && organization != null && organization.getPhone() != null) {
            recipientPhone = organization.getPhone();
        }

        String otpCode = String.valueOf(100000 + new Random().nextInt(900000));

        // Save OTP entity - attach relations safely avoiding foreign key transaction boundary issues
        Otp.OtpBuilder otpBuilder = Otp.builder()
                .email(recipientEmail)
                .phone(recipientPhone)
                .otpType(otpType)
                .otpCode(passwordEncoder.encode(otpCode))
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusMinutes(OTP_VALID_MINUTES))
                .isUsed(false)
                .attempts(0);

        if (user != null && user.getId() != null && userRepository.existsById(user.getId())) {
            otpBuilder.user(user);
        }
        if (organization != null && organization.getId() != null && organizationRepository.existsById(organization.getId())) {
            otpBuilder.organization(organization);
        }
        if (branch != null && branch.getId() != null && branchRepository.existsById(branch.getId())) {
            otpBuilder.branch(branch);
        }

        otpRepository.save(otpBuilder.build());

        // Prepare Base & Direct Links dynamically
        String baseFrontend = appUrlService.resolveFrontendUrl(inviteLink);
        String loginLink = appUrlService.buildFrontendUrl("/auth/login", baseFrontend);

        String actionLink = null;
        if (inviteLink != null && !inviteLink.trim().isEmpty()) {
            actionLink = inviteLink.trim();
            if (!actionLink.contains("otp=")) {
                actionLink += (actionLink.contains("?") ? "&" : "?") + "otp=" + otpCode;
            }
        } else if (user != null && user.getUserCode() != null) {
            String roleStr = (user.getRole() != null && !user.getRole().isBlank()) ? user.getRole() : "MEMBER";
            String encodedEmail = URLEncoder.encode(recipientEmail, StandardCharsets.UTF_8);
            actionLink = appUrlService.buildFrontendUrl("/auth/register/join?u=" + user.getUserCode()
                    + "&role=" + roleStr + "&email=" + encodedEmail + "&otp=" + otpCode, baseFrontend);
        } else if ("FORGOT_PASSWORD".equalsIgnoreCase(otpType)) {
            String encodedEmail = URLEncoder.encode(recipientEmail, StandardCharsets.UTF_8);
            actionLink = appUrlService.buildFrontendUrl("/auth/reset-password?email=" + encodedEmail + "&otp=" + otpCode, baseFrontend);
        } else if ("REGISTER".equals(otpType)) {
            String encodedEmail = URLEncoder.encode(recipientEmail, StandardCharsets.UTF_8);
            actionLink = appUrlService.buildFrontendUrl("/auth/verify-admin?email=" + encodedEmail + "&otp=" + otpCode, baseFrontend);
        }

        // Resolve display details
        String greetingName = (user != null && user.getName() != null && !user.getName().isBlank()) ? user.getName().trim() :
                ((organization != null && organization.getOwnerName() != null && !organization.getOwnerName().isBlank())
                        ? organization.getOwnerName().trim() : recipientEmail.split("@")[0]);

        String userCode = user != null ? user.getUserCode() : null;
        String roleName = (user != null && user.getRole() != null && !user.getRole().isBlank()) ? user.getRole() : "MEMBER";

        String gymName = "GymBross";
        if (branch != null && branch.getName() != null && !branch.getName().isBlank()) {
            gymName = branch.getName().trim();
        } else if (organization != null && organization.getName() != null && !organization.getName().isBlank()) {
            gymName = organization.getName().trim();
        }

        String subject;
        String htmlContent;

        if ("FORGOT_PASSWORD".equalsIgnoreCase(otpType)) {
            subject = "Reset Your " + gymName + " Password - Verification Code";
            htmlContent = buildForgotPasswordHtmlEmail(
                    greetingName,
                    recipientEmail,
                    gymName,
                    otpCode,
                    OTP_VALID_MINUTES,
                    actionLink,
                    loginLink
            );
        } else {
            subject = "Welcome to " + gymName + " - Complete Registration & Login Details";
            htmlContent = buildRegistrationAndLoginHtmlEmail(
                    greetingName,
                    recipientEmail,
                    userCode,
                    roleName,
                    gymName,
                    otpCode,
                    OTP_VALID_MINUTES,
                    actionLink,
                    loginLink
            );
        }

        // Send HTML Email
        emailService.sendHtmlEmail(recipientEmail, subject, htmlContent);
        log.info("OTP HTML email ({}) successfully sent to: {}", otpType, recipientEmail);

        // Send WhatsApp Notification if phone number is available
        if (recipientPhone != null && !recipientPhone.isBlank()) {
            try {
                whatsAppService.sendOtpNotification(recipientPhone, greetingName, otpCode, OTP_VALID_MINUTES, actionLink);
            } catch (Exception ex) {
                log.warn("Could not deliver WhatsApp OTP notification to {}: {}", recipientPhone, ex.getMessage());
            }
        }
    }

    /**
     * Builds an enterprise-grade dark HTML email for password reset requests.
     */
    public String buildForgotPasswordHtmlEmail(
            String name,
            String email,
            String gymName,
            String otpCode,
            int validMinutes,
            String resetLink,
            String loginLink) {

        String displayName = (name != null && !name.isBlank()) ? name : "Valued Member";
        String displayGym = (gymName != null && !gymName.isBlank()) ? gymName : "GymBross Fitness";
        String displayEmail = (email != null && !email.isBlank()) ? email : "";
        String displayOtp = (otpCode != null && !otpCode.isBlank()) ? otpCode : "------";

        String cleanResetLink = sanitizeUrl(resetLink);
        String cleanLoginLink = sanitizeUrl(loginLink);

        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>Password Reset - " + displayGym + "</title>\n" +
                "</head>\n" +
                "<body style=\"margin:0; padding:0; background-color:#09090b; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#f4f4f5;\">\n" +
                "  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#09090b; padding:36px 12px;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\">\n" +
                "        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px; background-color:#18181b; border:1px solid #27272a; border-radius:16px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.6);\">\n" +
                "          <!-- Indigo / Violet Header -->\n" +
                "          <tr>\n" +
                "            <td style=\"background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%); padding: 32px 24px; text-align: center;\">\n" +
                "              <div style=\"display:inline-block; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.3); padding:5px 16px; border-radius:9999px; font-size:11px; font-weight:800; color:#ffffff; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px;\">\n" +
                "                🔑 PASSWORD RESET REQUEST\n" +
                "              </div>\n" +
                "              <h1 style=\"margin:0; color:#ffffff; font-size:25px; font-weight:900; letter-spacing:0.5px;\">🏋️‍♂️ GYMBROSS PLATFORM</h1>\n" +
                "              <p style=\"margin:6px 0 0 0; color:#e0e7ff; font-size:14px; font-weight:600;\">" + displayGym + " • Secure Account Recovery</p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "\n" +
                "          <!-- Card Body -->\n" +
                "          <tr>\n" +
                "            <td style=\"padding:32px 28px;\">\n" +
                "              <h2 style=\"margin:0 0 12px 0; color:#ffffff; font-size:21px; font-weight:700;\">Reset Your Password 🔒</h2>\n" +
                "              <p style=\"margin:0 0 22px 0; color:#a1a1aa; font-size:14px; line-height:1.6;\">\n" +
                "                Hello <strong style=\"color:#ffffff;\">" + displayName + "</strong>,<br/>\n" +
                "                We received a request to reset your password for your account (<strong style=\"color:#c084fc;\">" + displayEmail + "</strong>). Use the one-time verification code below or click the button to set a new password:\n" +
                "              </p>\n" +
                "\n" +
                "              <!-- OTP Card -->\n" +
                "              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin-bottom:26px;\">\n" +
                "                <tr>\n" +
                "                  <td align=\"center\" style=\"background-color:#2e1065; border:1px solid #7c3aed; border-radius:14px; padding:22px 16px;\">\n" +
                "                    <div style=\"font-size:12px; font-weight:700; text-transform:uppercase; color:#c084fc; letter-spacing:1.5px; margin-bottom:6px;\">One-Time Password (OTP)</div>\n" +
                "                    <div style=\"font-size:38px; font-weight:900; color:#e9d5ff; letter-spacing:10px; font-family:'Courier New',Courier,monospace; margin:8px 0;\">" + displayOtp + "</div>\n" +
                "                    <div style=\"font-size:12px; color:#c4b5fd;\">⏱ Valid for " + validMinutes + " minutes • Single use only</div>\n" +
                "                  </td>\n" +
                "                </tr>\n" +
                "              </table>\n" +
                "\n" +
                "              <!-- Action Buttons -->\n" +
                "              <div style=\"background-color:#141417; border:1px solid #27272a; border-radius:14px; padding:22px; margin-bottom:24px;\">\n" +
                "                <div style=\"font-size:14px; font-weight:800; color:#ffffff; margin-bottom:14px; letter-spacing:0.3px;\">\n" +
                "                  ⚡ Quick Options:\n" +
                "                </div>\n" +
                "\n" +
                "                <!-- Primary CTA -->\n" +
                "                <div style=\"text-align:center; margin:16px 0 14px 0;\">\n" +
                "                  <a href=\"" + cleanResetLink + "\" style=\"display:inline-block; background:linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color:#ffffff; text-decoration:none; font-weight:800; font-size:15px; padding:14px 34px; border-radius:10px; box-shadow:0 4px 16px rgba(124, 58, 237, 0.4); letter-spacing:0.3px;\">\n" +
                "                    👉 Reset Password & Set New Credentials\n" +
                "                  </a>\n" +
                "                </div>\n" +
                "\n" +
                "                <!-- Secondary CTA -->\n" +
                "                <div style=\"text-align:center; margin:10px 0 4px 0;\">\n" +
                "                  <a href=\"" + cleanLoginLink + "\" style=\"display:inline-block; background-color:#27272a; border:1px solid #3f3f46; color:#e4e4e7; text-decoration:none; font-weight:700; font-size:13px; padding:10px 24px; border-radius:8px; box-shadow:0 2px 8px rgba(0, 0, 0, 0.3);\">\n" +
                "                    🔑 Return to Login\n" +
                "                  </a>\n" +
                "                </div>\n" +
                "              </div>\n" +
                "\n" +
                "              <!-- Security Note -->\n" +
                "              <div style=\"padding-top:16px; border-top:1px solid #27272a; font-size:12px; color:#71717a; line-height:1.5;\">\n" +
                "                🔒 <strong style=\"color:#a1a1aa;\">Security Notice:</strong> If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.\n" +
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
     * Builds an enterprise-grade HTML email containing:
     * - Role badge and platform branding
     * - Personalized welcome with gym/branch context
     * - Account summary table (Email, ID, Role, Gym)
     * - Prominent OTP Verification card
     * - Step 1: Complete Registration & Set Password (CTA Button + Copyable URL)
     * - Step 2: Go to Member/Staff Login (CTA Button + Copyable URL)
     * - Security notice and footer
     */
    public String buildRegistrationAndLoginHtmlEmail(
            String name,
            String email,
            String userCode,
            String role,
            String gymName,
            String otpCode,
            int validMinutes,
            String registrationLink,
            String loginLink) {

        String displayName = (name != null && !name.isBlank()) ? name : "Valued User";
        String displayRole = (role != null && !role.isBlank()) ? role.toUpperCase() : "MEMBER";
        String displayGym = (gymName != null && !gymName.isBlank()) ? gymName : "GymBross Fitness";
        String displayEmail = (email != null && !email.isBlank()) ? email : "";
        String displayOtp = (otpCode != null && !otpCode.isBlank()) ? otpCode : "------";

        String cleanRegLink = sanitizeUrl(registrationLink);
        String cleanLoginLink = sanitizeUrl(loginLink);

        StringBuilder idRowHtml = new StringBuilder();
        if (userCode != null && !userCode.isBlank()) {
            idRowHtml.append("<tr>")
                    .append("  <td style=\"padding:8px 12px; font-size:13px; color:#71717a; width:36%; border-bottom:1px solid #1f1f23;\">Member/User ID:</td>")
                    .append("  <td style=\"padding:8px 12px; font-size:13px; color:#34d399; font-weight:700; font-family:'Courier New',monospace; border-bottom:1px solid #1f1f23;\">")
                    .append(userCode).append("</td>")
                    .append("</tr>");
        }

        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>Welcome to " + displayGym + "</title>\n" +
                "</head>\n" +
                "<body style=\"margin:0; padding:0; background-color:#09090b; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#f4f4f5;\">\n" +
                "  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#09090b; padding:40px 12px;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\">\n" +
                "        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:620px; background-color:#18181b; border:1px solid #27272a; border-radius:16px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.6);\">\n" +
                "          <!-- Gradient Header -->\n" +
                "          <tr>\n" +
                "            <td style=\"background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center;\">\n" +
                "              <div style=\"display:inline-block; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.25); padding:5px 16px; border-radius:9999px; font-size:11px; font-weight:800; color:#ffffff; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px;\">\n" +
                "                " + displayRole + " ACCOUNT\n" +
                "              </div>\n" +
                "              <h1 style=\"margin:0; color:#ffffff; font-size:26px; font-weight:900; letter-spacing:0.5px;\">🏋️‍♂️ GYMBROSS PLATFORM</h1>\n" +
                "              <p style=\"margin:6px 0 0 0; color:#d1fae5; font-size:14px; font-weight:600;\">" + displayGym + " • Operations & Member Portal</p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "\n" +
                "          <!-- Main Body -->\n" +
                "          <tr>\n" +
                "            <td style=\"padding:32px 28px;\">\n" +
                "              <h2 style=\"margin:0 0 12px 0; color:#ffffff; font-size:22px; font-weight:700;\">Welcome to " + displayGym + "! 🎉</h2>\n" +
                "              <p style=\"margin:0 0 22px 0; color:#a1a1aa; font-size:14px; line-height:1.6;\">\n" +
                "                Hello <strong style=\"color:#ffffff;\">" + displayName + "</strong>,<br/>\n" +
                "                Your account has been officially registered. Follow the two quick steps below to verify your account, set your password, and access your dashboard.\n" +
                "              </p>\n" +
                "\n" +
                "              <!-- Account Summary Card -->\n" +
                "              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#121215; border:1px solid #27272a; border-radius:12px; margin-bottom:26px;\">\n" +
                "                <tr>\n" +
                "                  <td style=\"padding:8px 12px; font-size:13px; color:#71717a; width:36%; border-bottom:1px solid #1f1f23;\">Registered Email:</td>\n" +
                "                  <td style=\"padding:8px 12px; font-size:13px; color:#f4f4f5; font-weight:600; border-bottom:1px solid #1f1f23;\">" + displayEmail + "</td>\n" +
                "                </tr>\n" +
                idRowHtml.toString() +
                "                <tr>\n" +
                "                  <td style=\"padding:8px 12px; font-size:13px; color:#71717a; border-bottom:1px solid #1f1f23;\">Account Role:</td>\n" +
                "                  <td style=\"padding:8px 12px; font-size:13px; color:#f4f4f5; font-weight:600; border-bottom:1px solid #1f1f23;\">" + displayRole + "</td>\n" +
                "                </tr>\n" +
                "                <tr>\n" +
                "                  <td style=\"padding:8px 12px; font-size:13px; color:#71717a;\">Facility / Branch:</td>\n" +
                "                  <td style=\"padding:8px 12px; font-size:13px; color:#f4f4f5; font-weight:600;\">" + displayGym + "</td>\n" +
                "                </tr>\n" +
                "              </table>\n" +
                "\n" +
                "              <!-- OTP Card -->\n" +
                "              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin-bottom:26px;\">\n" +
                "                <tr>\n" +
                "                  <td align=\"center\" style=\"background-color:#064e3b; border:1px solid #10b981; border-radius:14px; padding:22px 16px;\">\n" +
                "                    <div style=\"font-size:12px; font-weight:700; text-transform:uppercase; color:#6ee7b7; letter-spacing:1.5px; margin-bottom:6px;\">One-Time Verification Password (OTP)</div>\n" +
                "                    <div style=\"font-size:38px; font-weight:900; color:#34d399; letter-spacing:10px; font-family:'Courier New',Courier,monospace; margin:8px 0;\">" + displayOtp + "</div>\n" +
                "                    <div style=\"font-size:12px; color:#a7f3d0;\">⏱ Valid for " + validMinutes + " minutes • Single use only</div>\n" +
                "                  </td>\n" +
                "                </tr>\n" +
                "              </table>\n" +
                "\n" +
                "              <!-- Two Step Action Section -->\n" +
                "              <div style=\"background-color:#141417; border:1px solid #27272a; border-radius:14px; padding:22px; margin-bottom:26px;\">\n" +
                "                <div style=\"font-size:15px; font-weight:800; color:#ffffff; margin-bottom:18px; letter-spacing:0.3px;\">\n" +
                "                  📋 2-Step Onboarding Process:\n" +
                "                </div>\n" +
                "\n" +
                "                <!-- STEP 1 -->\n" +
                "                <div style=\"margin-bottom:22px; padding-bottom:20px; border-bottom:1px solid #27272a;\">\n" +
                "                  <div style=\"font-size:13px; font-weight:800; color:#10b981; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;\">\n" +
                "                    STEP 1: Verify OTP & Set Your Password\n" +
                "                  </div>\n" +
                "                  <p style=\"margin:0 0 14px 0; font-size:13px; color:#a1a1aa; line-height:1.5;\">\n" +
                "                    Click the button below to navigate to the registration page. Your OTP is automatically linked to activate your profile and create your permanent login password.\n" +
                "                  </p>\n" +
                "                  <div style=\"text-align:center; margin:18px 0 8px 0;\">\n" +
                "                    <a href=\"" + cleanRegLink + "\" style=\"display:inline-block; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#ffffff; text-decoration:none; font-weight:800; font-size:15px; padding:14px 32px; border-radius:10px; box-shadow:0 4px 14px rgba(16, 185, 129, 0.4);\">\n" +
                "                      👉 Complete Registration & Set Password\n" +
                "                    </a>\n" +
                "                  </div>\n" +
                "                </div>\n" +
                "\n" +
                "                <!-- STEP 2 -->\n" +
                "                <div>\n" +
                "                  <div style=\"font-size:13px; font-weight:800; color:#38bdf8; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;\">\n" +
                "                    STEP 2: Log In to Your Account\n" +
                "                  </div>\n" +
                "                  <p style=\"margin:0 0 14px 0; font-size:13px; color:#a1a1aa; line-height:1.5;\">\n" +
                "                    Once your registration and password setup are completed, click below to open the login page and sign in using your email and password.\n" +
                "                  </p>\n" +
                "                  <div style=\"text-align:center; margin:18px 0 8px 0;\">\n" +
                "                    <a href=\"" + cleanLoginLink + "\" style=\"display:inline-block; background-color:#27272a; border:1px solid #3f3f46; color:#ffffff; text-decoration:none; font-weight:800; font-size:15px; padding:14px 32px; border-radius:10px; box-shadow:0 4px 14px rgba(0, 0, 0, 0.3);\">\n" +
                "                      🔑 Go to Member / Staff Login\n" +
                "                    </a>\n" +
                "                  </div>\n" +
                "                </div>\n" +
                "              </div>\n" +
                "\n" +
                "              <!-- Security Note -->\n" +
                "              <div style=\"padding-top:16px; border-top:1px solid #27272a; font-size:12px; color:#71717a; line-height:1.5;\">\n" +
                "                🔒 <strong style=\"color:#a1a1aa;\">Security Notice:</strong> Do not share this OTP or your password setup link with anyone. GymBross administrators will never ask for your private password.\n" +
                "              </div>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "\n" +
                "          <!-- Footer -->\n" +
                "          <tr>\n" +
                "            <td style=\"background-color:#09090b; padding:20px 24px; text-align:center; border-top:1px solid #27272a; font-size:12px; color:#71717a;\">\n" +
                "              © 2026 GymBross Inc. All rights reserved. • Enterprise Fitness & Member Operations\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "        </table>\n" +
                "      </td>\n" +
                "    </tr>\n" +
                "  </table>\n" +
                "</body>\n" +
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
