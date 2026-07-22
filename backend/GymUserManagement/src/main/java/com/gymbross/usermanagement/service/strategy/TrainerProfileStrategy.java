package com.gymbross.usermanagement.service.strategy;

import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.dto.UserProfileDto;
import com.gymbross.usermanagement.repository.TrainerRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TrainerProfileStrategy implements UserProfileStrategy {

        private final TrainerRatingRepository trainerRatingRepository;
        private final com.gymbross.usermanagement.repository.UserRepository userRepository;

    @Override
    public boolean supports(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getProfile(String username) {
        User trainer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
                
        return UserProfileDto.builder()
                .id(trainer.getId())
                .username(trainer.getUsername())
                .name(trainer.getName())
                .email(trainer.getEmail())
                .phone(trainer.getPhone())
                .role("TRAINER")
                .experience(trainer.getExperience())
                .isPersonalTrainer(trainer.getIsPersonalTrainer())
                .shiftTimings(trainer.getShiftTimings())
                .averageRating(trainerRatingRepository.getAverageRating(trainer.getId()))
                .build();
    }

    @Override
    @Transactional
    public UserProfileDto updateProfile(String username, UserProfileDto dto) {
        User trainer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (dto.getName() != null) trainer.setName(dto.getName());
        if (dto.getEmail() != null) trainer.setEmail(dto.getEmail());
        if (dto.getPhone() != null) trainer.setPhone(dto.getPhone());
        if (dto.getExperience() != null) trainer.setExperience(dto.getExperience());
        if (dto.getShiftTimings() != null) trainer.setShiftTimings(dto.getShiftTimings());
        if (dto.getIsPersonalTrainer() != null) trainer.setIsPersonalTrainer(dto.getIsPersonalTrainer());

        userRepository.save(trainer);
        return getProfile(username);
    }
    
    @Override
    public void toggleUserStatus(String username, boolean isActive) {
        // Not implemented for trainer in UserServiceImpl previously
    }
}
