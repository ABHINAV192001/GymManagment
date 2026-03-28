package com.gymbross.usermanagement.entity;

import com.Gym.GymCommonServices.entity.Food;
import com.Gym.GymCommonServices.entity.FoodPortion;
import com.Gym.GymCommonServices.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "food_log")
public class FoodLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;

    // FoodPortion removed as entity is deleted.
    // Logic for portion calculation should be handled via quantity *
    // food.servingSize (if added) or just quantity logic.
    @Column(name = "serving_unit")
    private String servingUnit; // e.g. "g", "cup", "slice"

    private Double quantity; // Multiplier of the portion

    private LocalDate date;

    private String mealType; // Breakfast, Lunch, Dinner, Snack
}
