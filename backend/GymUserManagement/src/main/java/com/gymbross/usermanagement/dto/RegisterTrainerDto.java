package com.gymbross.usermanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterTrainerDto {
    private String name;
    private String email;
    private String phone;
    private String password;
    private java.util.UUID orgId;
    private java.util.UUID branchId;
    private java.math.BigDecimal salary;
    private String shiftTimings;
    private LocalDate startDate;
    private Boolean isPersonalTrainer;
}
