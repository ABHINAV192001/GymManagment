package com.Gym.GymCommonServices.service.impl;

import com.Gym.GymCommonServices.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final com.Gym.GymCommonServices.service.AppUrlService appUrlService;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public String getCleanFrontendUrl() {
        return appUrlService.resolveFrontendUrl();
    }

    public String sanitizeUrl(String url) {
        if (url == null || url.isBlank()) {
            return appUrlService.resolveFrontendUrl();
        }
        return url.trim();
    }

    @Override
    @Async
    public void sendEmail(String to, String subject, String body) {
        if (body != null && (body.contains("<html") || body.contains("<div") || body.contains("<table"))) {
            sendHtmlEmail(to, subject, body);
            return;
        }

        log.info("Converting plain-text email to enterprise GymBross HTML layout for: {}", to);
        String htmlContent = wrapPlainTextInBrandedHtml(to, subject, body);
        sendHtmlEmail(to, subject, htmlContent);
    }

    private String wrapPlainTextInBrandedHtml(String to, String subject, String body) {
        String safeSubject = (subject != null && !subject.isBlank()) ? subject : "GymBross Notification";
        String rawText = body != null ? body : "";

        // Extract any URLs present in the text to buttonize them
        java.util.regex.Pattern urlPattern = java.util.regex.Pattern.compile("(https?://[^\\s<>\"']+)");
        java.util.regex.Matcher matcher = urlPattern.matcher(rawText);
        String detectedUrl = null;
        if (matcher.find()) {
            detectedUrl = sanitizeUrl(matcher.group(1));
        }

        // Clean out raw URLs and "URL:" prefix from the body text so no raw link is displayed
        String cleanedText = rawText
                .replaceAll("(?i)(log your meals, workouts, and water on:?\\s*|click here:?\\s*|url:?\\s*|link:?\\s*)?https?://[^\\s<>\"']+", "")
                .trim();

        // Convert newlines to HTML paragraphs/breaks and escape HTML special characters
        String escapedText = cleanedText
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\n\n", "</p><p style=\"margin:0 0 14px 0; color:#d4d4d8; font-size:14px; line-height:1.6;\">")
                .replace("\n", "<br/>");

        StringBuilder actionButtonHtml = new StringBuilder();
        if (detectedUrl != null && !detectedUrl.isBlank()) {
            actionButtonHtml.append("<!-- Standalone Action Button -->\n")
                    .append("<div style=\"text-align:center; margin:26px 0 14px 0;\">\n")
                    .append("  <a href=\"").append(detectedUrl).append("\" style=\"display:inline-block; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#ffffff; text-decoration:none; font-weight:800; font-size:15px; padding:14px 34px; border-radius:10px; box-shadow:0 4px 16px rgba(16, 185, 129, 0.4); letter-spacing:0.3px;\">\n")
                    .append("    👉 Open GymBross Portal\n")
                    .append("  </a>\n")
                    .append("</div>\n");
        }

        return "<!DOCTYPE html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <title>" + safeSubject + "</title>\n" +
                "</head>\n" +
                "<body style=\"margin:0; padding:0; background-color:#09090b; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#f4f4f5;\">\n" +
                "  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#09090b; padding:36px 12px;\">\n" +
                "    <tr>\n" +
                "      <td align=\"center\">\n" +
                "        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px; background-color:#18181b; border:1px solid #27272a; border-radius:16px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.6);\">\n" +
                "          <!-- Header -->\n" +
                "          <tr>\n" +
                "            <td style=\"background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px 24px; text-align: center;\">\n" +
                "              <div style=\"display:inline-block; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.3); padding:5px 16px; border-radius:9999px; font-size:11px; font-weight:800; color:#ffffff; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px;\">\n" +
                "                🔔 GYMBROSS NOTIFICATION\n" +
                "              </div>\n" +
                "              <h1 style=\"margin:0; color:#ffffff; font-size:24px; font-weight:900; letter-spacing:0.5px;\">🏋️‍♂️ GYMBROSS PLATFORM</h1>\n" +
                "              <p style=\"margin:6px 0 0 0; color:#d1fae5; font-size:13px; font-weight:600;\">Operations & Fitness Management</p>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "\n" +
                "          <!-- Body -->\n" +
                "          <tr>\n" +
                "            <td style=\"padding:32px 28px;\">\n" +
                "              <div style=\"background-color:#141417; border:1px solid #27272a; border-radius:12px; padding:22px; margin-bottom:20px;\">\n" +
                "                <p style=\"margin:0 0 14px 0; color:#d4d4d8; font-size:14px; line-height:1.6;\">\n" +
                escapedText +
                "                </p>\n" +
                actionButtonHtml.toString() +
                "              </div>\n" +
                "\n" +
                "              <!-- Security Note -->\n" +
                "              <div style=\"padding-top:14px; border-top:1px solid #27272a; font-size:12px; color:#71717a; line-height:1.5;\">\n" +
                "                🔒 <strong style=\"color:#a1a1aa;\">Automated Notice:</strong> Sent to " + to + " via GymBross notification services.\n" +
                "              </div>\n" +
                "            </td>\n" +
                "          </tr>\n" +
                "\n" +
                "          <!-- Footer -->\n" +
                "          <tr>\n" +
                "            <td style=\"background-color:#09090b; padding:18px 24px; text-align:center; border-top:1px solid #27272a; font-size:12px; color:#71717a;\">\n" +
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

    @Override
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        log.info("Attempting to send HTML email to: {} via sender: {}", to, fromEmail);
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            if (fromEmail != null && !fromEmail.trim().isEmpty()) {
                helper.setFrom(fromEmail.trim(), "GymBross Platform");
            }
            helper.setTo(to.trim());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(mimeMessage);
            log.info("HTML Email Sent Successfully to: {}", to);
        } catch (Exception e) {
            log.error("FAILED TO SEND HTML EMAIL to {}: {}", to, e.getMessage(), e);
        }
    }
}
