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
@Transactional
public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
        private final OrganizationRepository organizationRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private static final int OTP_VALID_MINUTES = 15;
    private static final int RESEND_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 3;

    public void sendOtp(String email, String phone, String otpType) {
        sendOtp(email, phone, otpType, null);
    }

    public void sendOtp(String email, String phone, String otpType, String inviteLink) {

        // Check cooldown
        otpRepository.findTopByEmailAndOtpTypeOrderByCreatedAtDesc(email, otpType)
                .ifPresent(last -> {
                    if (last.getCreatedAt()
                            .isAfter(java.time.Instant.now().minusSeconds(RESEND_SECONDS))) {
                        throw new IllegalArgumentException("Please wait 60 seconds before requesting another OTP.");
                    }
                });

        // Find user if exists (optional depending on flow, but required for updating
        // user later)
        User user = userRepository.findTopByEmail(email).orElse(null);
        com.Gym.GymCommonServices.entity.Organization organization = organizationRepository.findTopByOwnerEmail(email)
                .orElse(null);
        com.Gym.GymCommonServices.entity.User admin = userRepository.findTopByEmail(email).orElse(null);

        com.Gym.GymCommonServices.entity.Branch branch = null;
        if (admin != null) {
            branch = admin.getBranch();
        }

        String otpCode = String.valueOf(100000 + new Random().nextInt(900000));

        otpRepository.save(Otp.builder()
                .email(email)
                .phone(phone)
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

        // Send Email
        String subject = "Account Verification & Password Setup - GymBross";
        String body = "Hello,\n\nYour OTP for account verification is: " + otpCode + ". It expires in " + OTP_VALID_MINUTES + " minutes.";

        if (inviteLink != null && !inviteLink.isEmpty()) {
            body += "\n\nPlease click the link below to verify your email and set your login password:\n" + inviteLink;
        } else if ("REGISTER".equals(otpType)) {
            String verificationLink = frontendUrl + "/auth/verify-admin?email=" + email + "&otp=" + otpCode;
            body += "\n\nPlease verify your account here: " + verificationLink;
        }

        emailService.sendEmail(email, subject, body);
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

        // Activate User - Use bulk update instead of fetching and saving one by one (Fix N+1)
        userRepository.updateStatusByEmail(email);
        userRepository.updateStatusByEmail(email);
        organizationRepository.updateStatusByEmail(email);
    }
}
