package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/Send-verify")
    public ResponseEntity<ApiResponse<String>> verify(
            @RequestParam("id") String id,
            @RequestParam("OTP") String otp) {
        // Mapping id -> email, OTP -> otpCode, default type -> REGISTER
        otpService.verifyOtp(id, otp, "REGISTER");
        return ResponseEntity.ok(ApiResponse.success("Verification Successful. User is now active."));
    }
}
