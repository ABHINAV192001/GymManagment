package com.gymbross.chatservice.exception;

import com.Gym.GymCommonServices.exception.GlobalExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ChatExceptionHandler extends GlobalExceptionHandler {
    // Inherits standardized production-ready error handling from GymCommonServices
}
