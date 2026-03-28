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
import com.gymbross.usermanagement.repository.AdminRepository;
import com.gymbross.usermanagement.repository.OrganizationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final OrganizationRepository organizationRepository;

    private static final int OTP_VALID_MINUTES = 5;
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
                            .isAfter(LocalDateTime.now().minusSeconds(RESEND_SECONDS))) {
                        throw new RuntimeException("Wait 60 seconds before resending OTP");
                    }
                });

        // Find user if exists (optional depending on flow, but required for updating
        // user later)
        // Find user if exists (optional depending on flow, but required for updating
        // user later)
        User user = userRepository.findTopByEmail(email).orElse(null);
        com.Gym.GymCommonServices.entity.Organization organization = organizationRepository.findTopByOwnerEmail(email)
                .orElse(null);
        com.Gym.GymCommonServices.entity.Admin admin = adminRepository.findTopByEmail(email).orElse(null);

        com.Gym.GymCommonServices.entity.Branch branch = null;
        if (admin != null) {
            branch = admin.getBranch();
        }

        String otpCode = String.valueOf(100000 + new Random().nextInt(900000));

        otpRepository.save(Otp.builder()
                .email(email)
                .phone(phone)
                .otpType(otpType)
                .otpCode(otpCode)
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusMinutes(OTP_VALID_MINUTES))
                .isUsed(false)
                .attempts(0)
                .user(user)
                .organization(organization)
                .branch(branch)
                .build());

        // Send Email
        String subject = "Your OTP for GymBross";
        String body = "Your OTP is: " + otpCode + ". It expires in 5 minutes.";

        if (inviteLink != null && !inviteLink.isEmpty()) {
            body += "\n\nComplete your registration here: " + inviteLink;
        } else if ("REGISTER".equals(otpType)) {
            // Default verification link for Admins/Users without complex invite flow
            String verificationLink = "http://localhost:3000/auth/verify-admin?email=" + email + "&otp=" + otpCode;
            body += "\n\nVerify your account here: " + verificationLink;
        }

        emailService.sendEmail(email, subject, body);

        System.out.println("OTP SENT: " + otpCode);
    }

    public void verifyOtp(String email, String otpCode, String otpType) {

        Otp otp = otpRepository
                .findTopByEmailAndOtpTypeOrderByCreatedAtDesc(email, otpType)
                .orElseThrow(() -> new RuntimeException("OTP not found"));

        if (otp.getIsUsed()) {
            throw new RuntimeException("OTP already used");
        }

        if (otp.getEndTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (otp.getAttempts() >= MAX_ATTEMPTS) {
            throw new RuntimeException("OTP locked after 3 failed attempts");
        }

        if (!otp.getOtpCode().equals(otpCode)) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);
            throw new RuntimeException("Invalid OTP");
        }

        otp.setIsUsed(true);
        otpRepository.save(otp);

        // Activate User
        // Activate User - Check both User and Admin repositories
        // Activate User - Check both User and Admin repositories
        // Activate User - Check User, Admin, and Organization repositories
        // Activate User - Check User, Admin, and Organization repositories
        // Activate User - Check all repositories for multiple entries
        userRepository.findAllByEmail(email).forEach(user -> {
            System.out.println("Updating User status for: " + email);
            user.setIsActive(true);
            user.setIsEmailVerified(true);
            userRepository.save(user);
        });

        adminRepository.findAllByEmail(email).forEach(admin -> {
            System.out.println("Updating Admin status for: " + email);
            admin.setIsActive(true);
            admin.setIsEmailVerified(true);
            adminRepository.save(admin);
        });

        organizationRepository.findAllByOwnerEmail(email).forEach(org -> {
            System.out.println("Updating Organization status for: " + email);
            org.setIsActive(true);
            org.setIsEmailVerified(true);
            organizationRepository.save(org);
        });
    }
}
