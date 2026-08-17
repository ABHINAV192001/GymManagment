package com.gymbross.usermanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;

/**
 * Imports recipe data from files on startup, if present.
 * RBAC permissions and system roles are seeded by Flyway (V6, V11).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final com.gymbross.usermanagement.repository.RecipeRepository recipeRepository;
    private final com.gymbross.usermanagement.service.RecipeDataImportService recipeDataImportService;

    @Value("${app.seed.recipes-csv:Upload/recipes.csv}")
    private String recipesCsvPath;

    @Value("${app.seed.recipes-xlsx:Upload/recipes.xlsx}")
    private String recipesXlsxPath;

    @Override
    public void run(String... args) {
        File csvFile = new File(recipesCsvPath);
        if (csvFile.exists()) {
            log.info("Found {}. Reloading recipes table (clearing old data)...", csvFile.getAbsolutePath());
            recipeRepository.deleteAll();
            recipeDataImportService.importRecipes(csvFile.getAbsolutePath());
            return;
        }

        if (recipeRepository.count() == 0) {
            File xlsxFile = new File(recipesXlsxPath);
            if (xlsxFile.exists()) {
                log.info("Recipes table empty. Importing from {}...", xlsxFile.getAbsolutePath());
                recipeDataImportService.importRecipesFromExcel(xlsxFile.getAbsolutePath());
            } else {
                log.info("Recipes table empty and no recipe file found ({} or {}). Skipping recipe import.",
                        recipesCsvPath, recipesXlsxPath);
            }
        }
    }
}
