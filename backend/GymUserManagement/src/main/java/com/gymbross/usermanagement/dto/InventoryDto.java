package com.gymbross.usermanagement.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InventoryDto {
    private Long id;
    private String name;
    private String description;
    private Integer quantity;
    private String category;
    private String condition;
    private LocalDateTime purchaseDate;
}
