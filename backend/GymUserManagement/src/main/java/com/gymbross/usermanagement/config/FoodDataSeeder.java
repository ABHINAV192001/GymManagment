package com.gymbross.usermanagement.config;

import com.gymbross.usermanagement.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class FoodDataSeeder {

    private final FoodRepository foodRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void seedFoodDatabase() {
        log.info("Food database seeding managed via Flyway SQL Migrations. Current DB food count: {}", foodRepository.count());
    }
}
