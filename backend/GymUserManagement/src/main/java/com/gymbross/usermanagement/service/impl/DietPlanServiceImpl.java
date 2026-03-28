package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.User;
import com.Gym.GymCommonServices.entity.UserDietPlan;
import com.gymbross.usermanagement.repository.DietPlanRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.service.DietPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DietPlanServiceImpl implements DietPlanService {

        private final DietPlanRepository dietPlanRepository;
        private final UserRepository userRepository;
        private final com.gymbross.usermanagement.service.FileStorageService fileStorageService;

        @Override
        public UserDietPlan assignDietPlan(Long userId, UserDietPlan dietPlan,
                        org.springframework.web.multipart.MultipartFile file) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (file != null && !file.isEmpty()) {
                        String fileName = fileStorageService.storeFile(file);
                        dietPlan.setAttachmentUrl(fileName);
                }

                dietPlan.setUser(user);
                dietPlan.setIsDeleted(false);
                return dietPlanRepository.save(dietPlan);
        }

        @Override
        public List<UserDietPlan> getUserDietPlans(Long userId) {
                return dietPlanRepository.findByUserIdAndIsDeletedFalse(userId);
        }

        @Override
        public void deleteDietPlan(Long id) {
                UserDietPlan plan = dietPlanRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Diet plan not found"));
                plan.setIsDeleted(true);
                dietPlanRepository.save(plan);
        }
}
