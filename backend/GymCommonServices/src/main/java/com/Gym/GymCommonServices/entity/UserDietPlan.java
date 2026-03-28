package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_diet_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDietPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "premium_user_id")
    private PremiumUser premiumUser;

    @Builder.Default
    @Column(name = "is_deleted", columnDefinition = "boolean default false")
    private Boolean isDeleted = false;

    @Column(name = "food_name")
    private String foodName;

    private String description; // User wrote "discription", correcting to valid English

    @Column(name = "timing_food") // User wrote "Timeing_food"
    private String timingFood;

    @Column(name = "attachment_url")
    private String attachmentUrl;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
