package com.gymbross.duo.entity;

public enum ChallengeType {
    POINT_RACE,   // First to reach target points (e.g. 20 pts)
    STREAK_DAYS,  // First to maintain N consecutive workout days (e.g. 14 days)
    DURATION_RACE // Highest score at end of fixed duration (e.g. 30 days)
}
