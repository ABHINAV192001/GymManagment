package com.Gym.GymCommonServices.dto.fdc;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FoodDataCentralResponse {
    @JsonProperty("FoundationFoods")
    private List<FoundationFoodDto> foundationFoods;
}
