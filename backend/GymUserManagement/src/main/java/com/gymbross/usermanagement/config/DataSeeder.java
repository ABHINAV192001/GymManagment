package com.gymbross.usermanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final com.gymbross.usermanagement.repository.RecipeRepository recipeRepository;
    private final com.gymbross.usermanagement.service.RecipeDataImportService recipeDataImportService;

    @Override
    public void run(String... args) throws Exception {
        // 1. Food Data Import - DISABLED (Old normalized structure)
        /*
         * if (!foodRepository.existsByFdcId(900000L)) {
         * log.info("Dietary recipes not found. Starting automatic import...");
         * // ... import logic ...
         * }
         */
        log.info("Food Data Import in DataSeeder is disabled.");

        // 2. Recipe Entity Import
        // Prioritize the new TSV/CSV file provided by user and force reload
        String recipeCsvPath = "e:\\GymManagment\\backend\\GymUserManagement\\Upload\\recipes.csv";
        File csvFile = new File(recipeCsvPath);

        if (csvFile.exists()) {
            log.info("Found recipes.csv. Reloading recipes table (Clearing old data)...");
            recipeRepository.deleteAll();
            recipeDataImportService.importRecipes(recipeCsvPath);
        } else if (recipeRepository.count() == 0) {
            log.info("Recipes table empty. Checking for recipe files...");
            String recipeXlsxPath = "e:\\GymManagment\\backend\\GymUserManagement\\Upload\\recipes.xlsx";
            File xlsxFile = new File(recipeXlsxPath);

            if (xlsxFile.exists()) {
                recipeDataImportService.importRecipesFromExcel(recipeXlsxPath);
            } else {
                log.warn("No recipe file (recipes.xlsx or recipes.csv) found in Upload directory.");
            }
        }

        // 3. Fallback: Seed Sample Data if table is still empty
        if (recipeRepository.count() == 0) {
            log.info("Recipes table still empty after import checks. Seeding sample recipes...");
            seedSampleRecipes();
        }
    }

    private void seedSampleRecipes() {
        java.util.List<com.gymbross.usermanagement.entity.Recipe> samples = new java.util.ArrayList<>();

        samples.add(com.gymbross.usermanagement.entity.Recipe.builder()
                .recipeName("Keto Avocado Salad")
                .category("Salad")
                .calories(300.0)
                .protein(5.0)
                .carbohydrates(10.0)
                .fat(25.0)
                .ketoFriendly(true)
                .glutenFree(true)
                .veganOptions(true)
                .lowSodium(true)
                .build());

        samples.add(com.gymbross.usermanagement.entity.Recipe.builder()
                .recipeName("Vegan Oatmeal Bowl")
                .category("Breakfast")
                .calories(180.0)
                .protein(6.0)
                .carbohydrates(30.0)
                .fiber(5.0)
                .fat(4.0)
                .veganOptions(true)
                .highFiber(true)
                .lowCholesterol(true)
                .build());

        samples.add(com.gymbross.usermanagement.entity.Recipe.builder()
                .recipeName("Grilled Chicken Breast")
                .category("Main Course")
                .calories(165.0)
                .protein(31.0)
                .carbohydrates(0.0)
                .fat(3.6)
                .ketoFriendly(true)
                .glutenFree(true)
                // highProtein removed as not in entity
                .lowSodium(true)
                .build());

        samples.add(com.gymbross.usermanagement.entity.Recipe.builder()
                .recipeName("Low Sodium Spinach Smoothie")
                .category("Beverage")
                .calories(120.0)
                .protein(2.0)
                .carbohydrates(15.0)
                .fat(1.0)
                .veganOptions(true)
                .glutenFree(true)
                .lowSodium(true)
                .build());

        samples.add(com.gymbross.usermanagement.entity.Recipe.builder()
                .recipeName("High Fiber Bean Stew")
                .category("Stew")
                .calories(250.0)
                .protein(15.0)
                .carbohydrates(40.0)
                .fiber(12.0)
                .fat(5.0)
                .highFiber(true)
                .veganOptions(true)
                .build());

        recipeRepository.saveAll(samples);
        log.info("Seeded " + samples.size() + " sample recipes.");
    }
}
