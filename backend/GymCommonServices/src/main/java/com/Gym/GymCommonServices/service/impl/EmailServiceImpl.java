package com.Gym.GymCommonServices.service.impl;

import com.Gym.GymCommonServices.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:abhinavsahu120@gmail.com}")
    private String fromEmail;

    @Override
    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (fromEmail != null && !fromEmail.trim().isEmpty()) {
                message.setFrom(fromEmail);
            }
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Email Sent Successfully to: " + to + " (From: " + fromEmail + ")");
        } catch (Exception e) {
            System.err.println("FAILED TO SEND EMAIL to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
