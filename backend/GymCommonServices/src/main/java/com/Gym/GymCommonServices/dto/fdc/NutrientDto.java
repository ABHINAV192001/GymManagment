package com.Gym.GymCommonServices.dto.fdc;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class NutrientDto {
    private Long id;
    private String number;
    private String name;
    private String unitName;
    private Integer rank;
}
