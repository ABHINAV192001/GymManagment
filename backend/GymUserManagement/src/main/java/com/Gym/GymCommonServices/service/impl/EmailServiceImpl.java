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

    @Value("${spring.mail.username:abhinavsahu120@gmail.com}")
    private String fromEmail;

    @Override
    @Async
    public void sendEmail(String to, String subject, String body) {
        if (body != null && (body.contains("<html") || body.contains("<div") || body.contains("<table"))) {
            sendHtmlEmail(to, subject, body);
            return;
        }

        log.info("Attempting to send plain text email to: {} via sender: {}", to, fromEmail);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (fromEmail != null && !fromEmail.trim().isEmpty()) {
                message.setFrom(fromEmail.trim());
            }
            message.setTo(to.trim());
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Plain Text Email Sent Successfully to: {}", to);
        } catch (Exception e) {
            log.error("FAILED TO SEND PLAIN TEXT EMAIL to {}: {}", to, e.getMessage(), e);
        }
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
