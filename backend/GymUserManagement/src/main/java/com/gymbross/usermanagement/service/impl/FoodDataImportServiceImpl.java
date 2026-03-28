package com.gymbross.usermanagement.service.impl;

import com.gymbross.usermanagement.service.FoodDataImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class FoodDataImportServiceImpl implements FoodDataImportService {

    @Override
    @Transactional
    public void importNutrients(String filePath) throws IOException {
        log.info("Nutrient import skipped (tables removed for refactor). File: {}", filePath);
    }

    @Override
    @Transactional
    public void importFoods(String filePath) throws IOException {
        log.info("Food import skipped (tables removed for refactor). File: {}", filePath);
        // Todo: Implement new flat structure import if CSV is available
    }

    @Override
    @Transactional
    public void importFoodPortions(String filePath) throws IOException {
        log.info("Food Portion import skipped (tables removed for refactor). File: {}", filePath);
    }

    @Override
    @Transactional
    public void importFoodNutrients(String filePath) throws IOException {
        log.info("Food Nutrient import skipped (tables removed for refactor). File: {}", filePath);
    }

    @Override
    public void fullImport(String dir) throws IOException {
        log.info("Full import skipped (tables removed for refactor). Dir: {}", dir);
    }
}
