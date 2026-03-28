package com.gymbross.usermanagement.repository;

import com.Gym.GymCommonServices.entity.TrainerRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainerRatingRepository extends JpaRepository<TrainerRating, Long> {
    List<TrainerRating> findByTrainerId(Long trainerId);

    @Query("SELECT AVG(tr.rating) FROM TrainerRating tr WHERE tr.trainer.id = :trainerId")
    Double getAverageRating(Long trainerId);
}
