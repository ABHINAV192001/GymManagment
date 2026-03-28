package com.gymbross.usermanagement.service.impl;

import com.Gym.GymCommonServices.entity.Trainer;
import com.Gym.GymCommonServices.entity.TrainerRating;
import com.Gym.GymCommonServices.entity.User;
import com.gymbross.usermanagement.repository.TrainerRatingRepository;
import com.gymbross.usermanagement.repository.TrainerRepository;
import com.gymbross.usermanagement.repository.UserRepository;
import com.gymbross.usermanagement.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final TrainerRatingRepository trainerRatingRepository;
    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    @SuppressWarnings("null")
    public void rateTrainer(String username, Long trainerId, Double rating, String comment) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        // Optional: Check if trainer is actually assigned to this user
        if (user.getTrainer() == null || !user.getTrainer().getId().equals(trainerId)) {
            throw new RuntimeException("You can only rate your assigned trainer");
        }

        TrainerRating trainerRating = TrainerRating.builder()
                .user(user)
                .trainer(trainer)
                .rating(rating)
                .comment(comment)
                .build();

        trainerRatingRepository.save(trainerRating);
    }
}
