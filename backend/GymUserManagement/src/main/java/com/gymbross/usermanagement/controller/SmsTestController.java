package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.service.SmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test/sms")
public class SmsTestController {

    @Autowired
    private SmsService smsService;

    @PostMapping("/send")
    public String sendSms(@RequestParam String to, @RequestParam String message) {
        try {
            smsService.sendSms(to, message);
            return "SMS sent successfully to " + to;
        } catch (Exception e) {
            return "Failed to send SMS: " + e.getMessage();
        }
    }
}
