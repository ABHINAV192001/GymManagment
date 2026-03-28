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
@Table(name = "nutrient")
public class Nutrient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nutrient_number", unique = true)
    private String nutrientNumber; // USDA nutrient number

    @Column(nullable = false)
    private String name;

    @Column(name = "unit_name")
    private String unitName; // g, mg, kcal

    @Column(name = "nutrient_rank")
    private Integer nutrientRank;
}
