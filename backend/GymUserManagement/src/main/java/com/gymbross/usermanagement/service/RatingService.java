package com.gymbross.usermanagement.service;

public interface RatingService {
    void rateTrainer(String username, Long trainerId, Double rating, String comment);
}
