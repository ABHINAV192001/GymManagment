package com.gymbross.usermanagement.dto;

import lombok.*;

public class OtpDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendOtpRequest {
        private String email;
        private String phone;
        private String otpType; // REGISTER, LOGIN, FORGOT_PASSWORD
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyOtpRequest {
        private String email;
        private String phone;
        private String otpCode;
        private String otpType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OtpResponse {
        private String message;
    }
}
