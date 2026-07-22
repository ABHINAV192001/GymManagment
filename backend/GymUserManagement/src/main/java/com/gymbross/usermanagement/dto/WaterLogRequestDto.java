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
    @Min(value = 0, message = "Amount must be positive")
    private Double amount;
    
    private String date; // Keep string to match the current map logic or we can use LocalDate if we parse it in controller. Controller was using String, let's keep String but let Service parse. Or let Spring parse it by keeping it String. Let's just use String for compatibility with front-end for now.
}
