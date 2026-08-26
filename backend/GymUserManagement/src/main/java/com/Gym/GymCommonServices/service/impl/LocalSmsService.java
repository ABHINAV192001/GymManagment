package com.Gym.GymCommonServices.service.impl;

import com.Gym.GymCommonServices.service.SmsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class LocalSmsService implements SmsService {

    @Override
    public void sendSms(String to, String messageBody) {
        log.info("[SMS NOTIFICATION LOGGED] To: {}\nMessage: {}", to, messageBody);
    }
}
