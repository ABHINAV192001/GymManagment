package com.Gym.GymCommonServices.dto.fdc;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FoodPortionDto {
    private Double amount;
    private MeasureUnitDto measureUnit;
    private String modifier;
    private Double gramWeight;
    private Integer sequenceNumber;
}
