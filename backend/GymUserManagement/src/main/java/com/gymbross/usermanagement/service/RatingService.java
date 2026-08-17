package com.gymbross.usermanagement.service;

public interface RatingService {
    void rateTrainer(String username, java.util.UUID trainerId, Double rating, String comment);
}
