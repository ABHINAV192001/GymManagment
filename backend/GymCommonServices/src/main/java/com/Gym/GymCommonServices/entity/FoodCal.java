package com.Gym.GymCommonServices.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "food_cal")
public class FoodCal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "food_name")
    private String foodName;

    @Column(name = "food_code", unique = true)
    private String foodCode;

    private Double protein;

    private Double carbohydrates;

    private Double fats;

    private Double calories;

    private Double fiber;

    private Double sodium;

    private Double sugar;

    private String vitamins;

    private String minerals;

    private Double calcium;

    private Double iron;

    private Double potassium;

    @Column(name = "water_hydration")
    private Double waterHydration;

    @Column(name = "portion_size")
    private String portionSize;
}
