package com.Gym.GymCommonServices.dto.fdc;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MeasureUnitDto {
    private String name;
    private String abbreviation;
}
