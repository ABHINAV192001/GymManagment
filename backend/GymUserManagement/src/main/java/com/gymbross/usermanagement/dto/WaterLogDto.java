package com.gymbross.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaterLogDto {
    private Long id;
    private double amount;
    private LocalDateTime loggedAt;
}
