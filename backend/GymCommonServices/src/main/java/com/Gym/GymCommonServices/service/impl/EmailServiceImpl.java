package com.Gym.GymCommonServices.service.impl;

import com.Gym.GymCommonServices.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("gymbross@gmail.com"); // Placeholder
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Email Sent Successfully to: " + to);
        } catch (Exception e) {
            System.err.println("FAILED TO SEND EMAIL to " + to);
            e.printStackTrace();
        }
    }
}
