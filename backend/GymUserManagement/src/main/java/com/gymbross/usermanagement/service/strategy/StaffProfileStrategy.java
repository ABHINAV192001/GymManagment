package com.gymbross.usermanagement.service.strategy;

import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.dto.UserProfileDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StaffProfileStrategy implements UserProfileStrategy {

    private final com.gymbross.usermanagement.repository.UserRepository userRepository;

    @Override
    public boolean supports(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getProfile(String username) {
        User staff = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
                
        return UserProfileDto.builder()
                .id(staff.getId())
                .username(staff.getUsername())
                .name(staff.getName())
                .email(staff.getEmail())
                .phone(staff.getPhone())
                .role(staff.getRole()) 
                .staffRole(staff.getRole())
                .paymentStatus(staff.getPaymentStatus())
                .shiftTimings(staff.getShiftTimings())
                .build();
    }

    @Override
    @Transactional
    public UserProfileDto updateProfile(String username, UserProfileDto dto) {
        User staff = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (dto.getName() != null) staff.setName(dto.getName());
        if (dto.getEmail() != null) staff.setEmail(dto.getEmail());
        if (dto.getPhone() != null) staff.setPhone(dto.getPhone());
        if (dto.getShiftTimings() != null) staff.setShiftTimings(dto.getShiftTimings());

        userRepository.save(staff);
        return getProfile(username);
    }
    
    @Override
    public void toggleUserStatus(String username, boolean isActive) {
        // Not implemented for staff in UserServiceImpl previously
    }
}
