package com.gymbross.usermanagement.dto;

import lombok.Data;

@Data
public class RatingRequest {
    private Double rating;
    private String comment;
}
