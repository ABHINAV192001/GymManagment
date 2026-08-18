package com.gymbross.workout.service;

import com.Gym.GymCommonServices.dto.WeeklyWorkoutPlanDto;
import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.WeeklyWorkoutPlan;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.workout.repository.WeeklyWorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserWorkoutService {

        private final UserRepository userRepository;
        private final WeeklyWorkoutPlanRepository weeklyWorkoutPlanRepository;

        @Transactional
        public void updateWeeklyPlan(java.util.UUID userId, WeeklyWorkoutPlanDto dto) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (!com.Gym.GymCommonServices.entity.Role.PREMIUM_USER.equals(user.getRole())) {
                        throw new RuntimeException("Workout plans can only be assigned to Prime (Premium) Users.");
                }

                WeeklyWorkoutPlan plan = weeklyWorkoutPlanRepository.findByUserId(userId)
                                .orElse(WeeklyWorkoutPlan.builder().user(user).build());

                plan.setMondayWorkoutId(dto.getMondayWorkoutId());
                plan.setTuesdayWorkoutId(dto.getTuesdayWorkoutId());
                plan.setWednesdayWorkoutId(dto.getWednesdayWorkoutId());
                plan.setThursdayWorkoutId(dto.getThursdayWorkoutId());
                plan.setFridayWorkoutId(dto.getFridayWorkoutId());
                plan.setSaturdayWorkoutId(dto.getSaturdayWorkoutId());
                plan.setSundayWorkoutId(dto.getSundayWorkoutId());

                weeklyWorkoutPlanRepository.save(plan);
        }

        @Transactional(readOnly = true)
        public WeeklyWorkoutPlanDto getWeeklyPlan(java.util.UUID userId) {
                WeeklyWorkoutPlan plan = weeklyWorkoutPlanRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Weekly plan not found"));

                return WeeklyWorkoutPlanDto.builder()
                                .id(plan.getId())
                                .mondayWorkoutId(plan.getMondayWorkoutId())
                                .tuesdayWorkoutId(plan.getTuesdayWorkoutId())
                                .wednesdayWorkoutId(plan.getWednesdayWorkoutId())
                                .thursdayWorkoutId(plan.getThursdayWorkoutId())
                                .fridayWorkoutId(plan.getFridayWorkoutId())
                                .saturdayWorkoutId(plan.getSaturdayWorkoutId())
                                .sundayWorkoutId(plan.getSundayWorkoutId())
                                .build();
        }

        public void updateWorkoutPlan(java.util.UUID userId, List<String> workoutPlan) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (!com.Gym.GymCommonServices.entity.Role.PREMIUM_USER.equals(user.getRole())) {
                        throw new RuntimeException("Workout plans can only be assigned to Prime (Premium) Users.");
                }

                user.setWorkoutPlan(workoutPlan);
                userRepository.save(user);
        }

        public List<String> getWorkoutPlan(java.util.UUID userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return user.getWorkoutPlan();
        }
}
