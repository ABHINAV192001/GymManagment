package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_diet_plans")
@SQLRestriction("deleted_at IS NULL")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDietPlan extends com.Gym.GymCommonServices.common.BaseEntity {

    

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Premium users are Users with the PREMIUM_USER role since the legacy
    // PremiumUser entity/table was removed.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "premium_user_id")
    private User premiumUser;

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

    }
