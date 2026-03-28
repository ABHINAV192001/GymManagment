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
@Table(name = "food_nutrient", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "food_id", "nutrient_id" })
})
public class FoodNutrient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nutrient_id", nullable = false)
    private Nutrient nutrient;

    private Double amount;

    @Column(name = "min_val")
    private Double minVal;

    @Column(name = "max_val")
    private Double maxVal;

    @Column(name = "median_val")
    private Double medianVal;

    @Column(name = "derived_method")
    private String derivedMethod;
}
