package com.Gym.GymCommonServices.service.impl;

import com.Gym.GymCommonServices.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
        log.info("Attempting to send email to: {} via sender: {}", to, fromEmail);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (fromEmail != null && !fromEmail.trim().isEmpty()) {
                message.setFrom(fromEmail.trim());
            }
            message.setTo(to.trim());
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email Sent Successfully to: {} (From: {})", to, fromEmail);
        } catch (Exception e) {
            log.error("FAILED TO SEND EMAIL to {}: {}", to, e.getMessage(), e);
        }
    }
}
