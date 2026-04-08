package com.gymbross.workout.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.workout.entity.Activity;
import com.gymbross.workout.repository.ActivityRepository;
import com.Gym.GymCommonServices.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityRepository activityRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Activity>>> getAllActivities(@RequestParam(required = false) String category) {
        if (category != null) {
            return ResponseEntity.ok(ApiResponse.success(activityRepository.findByCategory(category)));
        }
        return ResponseEntity.ok(ApiResponse.success(activityRepository.findAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Activity>> getActivityById(@PathVariable Long id) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(activity));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<Activity>> createActivity(@RequestBody Activity activity) {
        return ResponseEntity.ok(ApiResponse.success(activityRepository.save(activity), "Activity created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN', 'TRAINER')")
    public ResponseEntity<ApiResponse<Activity>> updateActivity(@PathVariable Long id, @RequestBody Activity updatedActivity) {
        Activity existing = activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: " + id));
        
        existing.setTitle(updatedActivity.getTitle());
        existing.setTime(updatedActivity.getTime());
        existing.setCalories(updatedActivity.getCalories());
        existing.setImage(updatedActivity.getImage());
        existing.setGradient(updatedActivity.getGradient());
        existing.setDescription(updatedActivity.getDescription());
        existing.setBenefits(updatedActivity.getBenefits());
        existing.setSchedule(updatedActivity.getSchedule());
        existing.setInstructorName(updatedActivity.getInstructorName());
        existing.setInstructorRole(updatedActivity.getInstructorRole());
        existing.setInstructorImage(updatedActivity.getInstructorImage());
        existing.setCategory(updatedActivity.getCategory());
        existing.setLinkedWorkoutId(updatedActivity.getLinkedWorkoutId());
        
        return ResponseEntity.ok(ApiResponse.success(activityRepository.save(existing), "Activity updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ORG_ADMIN', 'BRANCH_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteActivity(@PathVariable Long id) {
        if (activityRepository.existsById(id)) {
            activityRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Activity deleted successfully"));
        }
        throw new ResourceNotFoundException("Activity not found with id: " + id);
    }
}
