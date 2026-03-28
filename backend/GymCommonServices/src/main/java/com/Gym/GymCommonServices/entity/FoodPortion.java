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
@Table(name = "food_portion")
public class FoodPortion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;

    private Double amount;

    @Column(name = "measure_unit")
    private String measureUnit;

    private String modifier;

    @Column(name = "gram_weight")
    private Double gramWeight;

    @Column(name = "sequence_number")
    private Integer sequenceNumber;
}
