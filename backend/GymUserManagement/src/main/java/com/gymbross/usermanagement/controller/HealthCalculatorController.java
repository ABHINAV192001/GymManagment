package com.gymbross.usermanagement.controller;

import com.Gym.GymCommonServices.dto.ApiResponse;
import com.gymbross.usermanagement.dto.HealthCalculationRequestDto;
import com.gymbross.usermanagement.dto.HealthCalculationResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthCalculatorController {

    @PostMapping("/calculate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<HealthCalculationResponseDto>> calculateHealthMetrics(
            @RequestBody HealthCalculationRequestDto request) {
        log.info("Backend calculating health metrics: weight={}kg, height={}cm", request.getWeightKg(), request.getHeightCm());

        double w = request.getWeightKg() != null ? request.getWeightKg() : 75.0;
        double h = request.getHeightCm() != null ? request.getHeightCm() : 178.0;
        int a = request.getAge() != null ? request.getAge() : 25;
        String gender = request.getGender() != null ? request.getGender().toUpperCase() : "MALE";
        String activity = request.getActivityLevel() != null ? request.getActivityLevel().toUpperCase() : "MODERATE";

        double heightM = h / 100.0;
        double bmi = heightM > 0 ? w / (heightM * heightM) : 0;

        String bmiStatus = "Normal Weight";
        String bmiColor = "text-emerald-400";
        if (bmi < 18.5) {
            bmiStatus = "Underweight";
            bmiColor = "text-amber-400";
        } else if (bmi >= 25 && bmi < 30) {
            bmiStatus = "Overweight";
            bmiColor = "text-amber-400";
        } else if (bmi >= 30) {
            bmiStatus = "Obese";
            bmiColor = "text-red-400";
        }

        double bmr = 10 * w + 6.25 * h - 5 * a;
        if ("MALE".equals(gender)) {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        double multiplier = 1.55;
        switch (activity) {
            case "SEDENTARY": multiplier = 1.2; break;
            case "MODERATE": multiplier = 1.55; break;
            case "ACTIVE": multiplier = 1.725; break;
            case "EXTREME": multiplier = 1.9; break;
        }

        double tdee = bmr * multiplier;
        int bulkCals = (int) Math.round(tdee + 350);
        int cutCals = (int) Math.round(tdee - 450);
        int fiberGrams = (int) Math.round((tdee / 1000.0) * 14);
        String waterLiters = String.format("%.1f", (w * 35.0) / 1000.0);

        int ft = (int) Math.floor(h / 30.48);
        int inch = (int) Math.round((h % 30.48) / 2.54);
        String heightFtInDisplay = String.format("%d' %d\"", ft, inch);

        HealthCalculationResponseDto response = HealthCalculationResponseDto.builder()
                .bmi(Math.round(bmi * 10.0) / 10.0)
                .bmiStatus(bmiStatus)
                .bmiColor(bmiColor)
                .bmr((int) Math.round(bmr))
                .tdee((int) Math.round(tdee))
                .bulkCals(bulkCals)
                .cutCals(cutCals)
                .fiberGrams(fiberGrams)
                .waterLiters(waterLiters)
                .normalizedHeightCm((int) Math.round(h))
                .normalizedHeightM(String.format("%.2f", heightM))
                .heightFtInDisplay(heightFtInDisplay)
                .normalizedWeightKg((int) Math.round(w))
                .normalizedWeightLbs((int) Math.round(w * 2.20462))
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
