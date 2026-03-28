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
@Table(name = "food")
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "description", nullable = false)
    private String foodName;

    @Column(name = "category")
    private String category;

    @Column(name = "key_ingredients", columnDefinition = "TEXT")
    private String keyIngredients;

    // Macros (g)
    private Double protein;
    private Double carbohydrates;
    private Double fiber;
    private Double sugar;
    private Double fat;

    @Column(name = "saturated_fat")
    private Double saturatedFat;

    @Column(name = "mono_unsaturated_fat")
    private Double monoUnsaturatedFat;

    @Column(name = "poly_unsaturated_fat")
    private Double polyUnsaturatedFat;

    // Micros (mg)
    private Double calcium;
    private Double iron;
    private Double cholesterol;
    private Double sodium;

    // Attributes
    @Column(name = "cooking_time")
    private Integer cookingTime; // in minutes

    private Double calories; // kcal

    @Column(name = "keto_friendly")
    private Boolean ketoFriendly;

    @Column(name = "vegan_options")
    private Boolean veganOptions;

    @Column(name = "gluten_free")
    private Boolean glutenFree;

    @Column(name = "low_cholesterol")
    private Boolean lowCholesterol;

    @Column(name = "high_cholesterol")
    private Boolean highCholesterol;

    @Column(name = "high_sodium")
    private Boolean highSodium;

    @Column(name = "low_sodium")
    private Boolean lowSodium;

    @Column(name = "high_fiber")
    private Boolean highFiber;
}
