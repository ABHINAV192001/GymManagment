package com.gymbross.usermanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaterLogRequestDto {
    @NotNull(message = "Amount is required")
    @jakarta.validation.constraints.DecimalMin(value = "0.01", message = "Water amount must be at least 0.01 L")
    @jakarta.validation.constraints.DecimalMax(value = "20.0", message = "Water amount cannot exceed 20.0 L")
    private Double amount;
    
    private String date; // Keep string to match the current map logic or we can use LocalDate if we parse it in controller. Controller was using String, let's keep String but let Service parse. Or let Spring parse it by keeping it String. Let's just use String for compatibility with front-end for now.
}
