package com.gymbross.usermanagement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NutritionDataLoader implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        // Disabled due to entity refactoring (removal of FoodNutrient, FoodPortion,
        // etc.)
        // This loader relied on the old normalized structure.
        // TODO: Implement new loader for the flattened Food entity if needed.
        log.info("NutritionDataLoader skipped as the data model has been refactored.");
    }
}
