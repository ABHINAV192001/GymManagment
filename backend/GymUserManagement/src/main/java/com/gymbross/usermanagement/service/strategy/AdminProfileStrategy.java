package com.gymbross.usermanagement.service.strategy;

import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.dto.UserProfileDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminProfileStrategy implements UserProfileStrategy {

    private final com.gymbross.usermanagement.repository.UserRepository userRepository;

    @Override
    public boolean supports(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getProfile(String username) {
        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
                
        return UserProfileDto.builder()
                .id(admin.getId())
                .username(admin.getUsername())
                .name(admin.getName() != null ? admin.getName() : admin.getUsername())
                .email(admin.getEmail())
                .phone(admin.getPhone())
                .userCode(admin.getAdminCode())
                .dob(admin.getDob())
                .gender(admin.getGender())
                .isActive(admin.getIsActive())
                .role(admin.getRole())
                .build();
    }

    @Override
    @Transactional
    public UserProfileDto updateProfile(String username, UserProfileDto dto) {
        User admin = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (dto.getName() != null) admin.setName(dto.getName());
        if (dto.getEmail() != null) admin.setEmail(dto.getEmail());
        if (dto.getPhone() != null) admin.setPhone(dto.getPhone());
        if (dto.getDob() != null) admin.setDob(dto.getDob());
        if (dto.getGender() != null) admin.setGender(dto.getGender());

        userRepository.save(admin);
        return getProfile(username);
    }
    
    @Override
    public void toggleUserStatus(String username, boolean isActive) {
        // Not implemented for admin in UserServiceImpl previously
    }
}
