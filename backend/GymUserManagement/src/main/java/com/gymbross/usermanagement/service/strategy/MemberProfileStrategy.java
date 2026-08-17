package com.gymbross.usermanagement.service.strategy;

import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.dto.UserProfileDto;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.service.CalorieCalculatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberProfileStrategy implements UserProfileStrategy {

    private final UserRepository userRepository;
    private final CalorieCalculatorService calorieCalculatorService;

    @Override
    public boolean supports(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        int targetCalories = calorieCalculatorService.calculateTargetCalories(user);

        java.time.LocalDate endDate = null;
        if (user.getStartDate() != null) {
            endDate = user.getStartDate().plusYears(1);
        }
        
        Integer age = user.getAge();
        if (age == null && user.getDob() != null) {
            age = java.time.Period.between(user.getDob(), java.time.LocalDate.now()).getYears();
        }

        return UserProfileDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole() : "USER")
                .userCode(user.getUserCode())
                .dob(user.getDob())
                .age(age)
                .plan(user.getPlan() != null ? user.getPlan().getName() : null)
                .startDate(user.getStartDate())
                .endDate(endDate)
                .isActive(user.getIsActive())
                .trainerName(user.getTrainer() != null ? user.getTrainer().getName() : null)
                .trainerId(user.getTrainer() != null ? user.getTrainer().getId() : null)
                .hasTrainer(user.getTrainer() != null)
                .height(user.getHeight())
                .weight(user.getWeight())
                .gender(user.getGender())
                .activityLevel(user.getActivityLevel())
                .goal(user.getGoal())
                .isOnboardingCompleted(user.getIsOnboardingCompleted())
                .dailyCalorieTarget(targetCalories)
                .workoutPlanName(user.getPlan() != null ? user.getPlan() + " Workout" : "Standard Routine")
                .build();
    }

    @Override
    @Transactional
    public UserProfileDto updateProfile(String username, UserProfileDto dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getDob() != null) user.setDob(dto.getDob());
        if (dto.getHeight() != null) user.setHeight(dto.getHeight());
        if (dto.getWeight() != null) user.setWeight(dto.getWeight());
        if (dto.getGender() != null) user.setGender(dto.getGender());
        if (dto.getActivityLevel() != null) user.setActivityLevel(dto.getActivityLevel());
        if (dto.getGoal() != null) user.setGoal(dto.getGoal());
        if (dto.getAge() != null) user.setAge(dto.getAge());
        // if (dto.getPlan() != null) user.setPlan(com.Gym.GymCommonServices.entity.Plan.valueOf(dto.getPlan()));
        // Note: setting plan via string requires PlanRepository which isn't here.
        // Assuming plan update happens elsewhere or just skip for now.

        userRepository.save(user);
        return getProfile(username);
    }
    
    @Override
    @Transactional
    public void toggleUserStatus(String username, boolean isActive) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        user.setIsActive(isActive);
        userRepository.save(user);
    }
}
