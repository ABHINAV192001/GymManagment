package com.gymbross.usermanagement.exception;

import com.Gym.GymCommonServices.exception.GlobalExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class UserManagementExceptionHandler extends GlobalExceptionHandler {
    // Inherits all common exception handling logic from GymCommonServices
}
