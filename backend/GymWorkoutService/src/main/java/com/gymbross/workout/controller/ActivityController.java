package com.gymbross.workout.controller;

import com.gymbross.workout.entity.Activity;
import com.gymbross.workout.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityRepository activityRepository;

    @GetMapping
    public ResponseEntity<List<Activity>> getAllActivities(@RequestParam(required = false) String category) {
        if (category != null) {
            return ResponseEntity.ok(activityRepository.findByCategory(category));
        }
        return ResponseEntity.ok(activityRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Activity> getActivityById(@PathVariable Long id) {
        return activityRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Activity> createActivity(@RequestBody Activity activity) {
        return ResponseEntity.ok(activityRepository.save(activity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Activity> updateActivity(@PathVariable Long id, @RequestBody Activity updatedActivity) {
        return activityRepository.findById(id)
                .map(existing -> {
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
                    return ResponseEntity.ok(activityRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        if (activityRepository.existsById(id)) {
            activityRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
