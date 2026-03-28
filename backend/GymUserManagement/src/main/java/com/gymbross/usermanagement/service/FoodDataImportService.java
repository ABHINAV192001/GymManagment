package com.gymbross.usermanagement.service;

import java.io.IOException;

public interface FoodDataImportService {
    void importNutrients(String filePath) throws IOException;

    void importFoods(String filePath) throws IOException;

    void importFoodPortions(String filePath) throws IOException;

    void importFoodNutrients(String filePath) throws IOException;

    void fullImport(String directoryPath) throws IOException;
}
