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
        public UserDietPlan assignDietPlan(java.util.UUID userId, UserDietPlan dietPlan,
                        org.springframework.web.multipart.MultipartFile file, java.util.UUID orgId, java.util.UUID branchId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                if (!user.getOrganization().getId().equals(orgId)) {
                    throw new RuntimeException("Unauthorized: Cannot assign diet plan to user in another organization");
                }

                if (file != null && !file.isEmpty()) {
                        String fileName = fileStorageService.storeFile(file);
                        dietPlan.setAttachmentUrl(fileName);
                }

                dietPlan.setUser(user);
                dietPlan.setIsDeleted(false);
                return dietPlanRepository.save(dietPlan);
        }

        @Override
        public List<UserDietPlan> getUserDietPlans(java.util.UUID userId, java.util.UUID orgId, java.util.UUID branchId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                if (!user.getOrganization().getId().equals(orgId)) {
                    throw new RuntimeException("Unauthorized: Cannot view diet plans for user in another organization");
                }
                return dietPlanRepository.findByUserIdAndIsDeletedFalse(userId);
        }

        @Override
        public void deleteDietPlan(java.util.UUID id, java.util.UUID orgId, java.util.UUID branchId) {
                UserDietPlan plan = dietPlanRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Diet plan not found"));
                if (!plan.getUser().getOrganization().getId().equals(orgId)) {
                    throw new RuntimeException("Unauthorized: Cannot delete diet plan for user in another organization");
                }
                plan.softDelete();
                plan.setIsDeleted(true);
                dietPlanRepository.save(plan);
        }
}
