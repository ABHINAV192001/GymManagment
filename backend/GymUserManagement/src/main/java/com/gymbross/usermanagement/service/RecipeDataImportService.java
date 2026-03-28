package com.gymbross.usermanagement.service;

import com.gymbross.usermanagement.entity.Recipe;
import com.gymbross.usermanagement.repository.RecipeRepository;
// Imports removed
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileInputStream;
// Imports removed
import java.io.IOException;
import java.util.Iterator;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeDataImportService {

    private final RecipeRepository recipeRepository;

    @Transactional
    public void importRecipes(String filePath) {
        log.info("Starting recipe import from TSV/CSV: {}", filePath);
        try (java.io.FileReader fr = new java.io.FileReader(filePath);
                com.opencsv.CSVReader reader = new com.opencsv.CSVReaderBuilder(fr)
                        .withCSVParser(new com.opencsv.CSVParserBuilder().withSeparator('\t').build())
                        .build()) {

            java.util.List<String[]> rows = reader.readAll();
            // Skip header if present
            if (!rows.isEmpty() && rows.get(0).length > 0 &&
                    (rows.get(0)[0].equalsIgnoreCase("id") || rows.get(0)[0].equalsIgnoreCase("\"id\""))) {
                rows.remove(0);
            }

            for (String[] row : rows) {
                try {
                    // Mapping based on recipes.csv structure:
                    // 0: id
                    // 1: calcium
                    // 2: category
                    // 3: cooking_time
                    // 4: gluten_free
                    // 5: high_cholesterol
                    // 6: high_fiber
                    // 7: high_sodium
                    // 8: iron
                    // 9: keto_friendly
                    // 10: key_ingredients
                    // 11: low_cholesterol
                    // 12: low_sodium
                    // 13: protein
                    // 14: recipe_name
                    // 15: vegan_options

                    Recipe recipe = new Recipe();
                    recipe.setCalcium(getDoubleValue(row[1]));
                    recipe.setCategory(row[2].replace("\"", "")); // Strip quotes if parser kept them
                    recipe.setCookingTime(getIntegerValue(row[3]));

                    recipe.setGlutenFree(getBooleanValue(row[4]));
                    recipe.setHighCholesterol(getBooleanValue(row[5]));
                    recipe.setHighFiber(getBooleanValue(row[6]));
                    recipe.setHighSodium(getBooleanValue(row[7]));

                    recipe.setIron(getDoubleValue(row[8]));
                    recipe.setKetoFriendly(getBooleanValue(row[9]));

                    recipe.setKeyIngredients(row[10].replace("\"", ""));

                    recipe.setLowCholesterol(getBooleanValue(row[11]));
                    recipe.setLowSodium(getBooleanValue(row[12]));

                    recipe.setProtein(getDoubleValue(row[13]));
                    recipe.setRecipeName(row[14].replace("\"", ""));
                    recipe.setVeganOptions(getBooleanValue(row[15]));

                    recipeRepository.save(recipe);
                } catch (Exception e) {
                    log.error("Error parsing row: " + java.util.Arrays.toString(row), e);
                }
            }
            log.info("Recipe import from TSV completed.");

        } catch (Exception e) {
            log.error("Failed to read recipe TSV file", e);
        }
    }

    private Double getDoubleValue(Object cell) {
        if (cell == null)
            return null;
        if (cell instanceof Number)
            return ((Number) cell).doubleValue();
        try {
            return Double.parseDouble(cell.toString().replace("\"", "").trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer getIntegerValue(Object cell) {
        if (cell == null)
            return null;
        if (cell instanceof Number)
            return ((Number) cell).intValue();
        try {
            return Integer.parseInt(cell.toString().replace("\"", "").trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Boolean getBooleanValue(Object cell) {
        if (cell == null)
            return false;
        if (cell instanceof Boolean)
            return (Boolean) cell;
        String val = cell.toString().replace("\"", "").trim().toLowerCase();
        return "true".equals(val) || "yes".equals(val) || "1".equals(val);
    }

    @Transactional
    public void importRecipesFromExcel(String filePath) {
        log.info("Starting recipe import from Excel: {}", filePath);
        try (FileInputStream fis = new FileInputStream(filePath);
                Workbook workbook = new XSSFWorkbook(fis)) {

            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            // Skip header
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                try {
                    // Mapping based on prompt order:
                    // 0: ID (Skip)
                    // 1: Recipe Name
                    // 2: Category
                    // 3: Key Ingredients
                    // 4: Protein (g)
                    // 5: Calcium (mg)
                    // 6: Iron (mg)
                    // 7: Cooking Time (min)
                    // 8-15: Booleans

                    Recipe recipe = new Recipe();
                    recipe.setRecipeName(getStringValue(row.getCell(1)));
                    recipe.setCategory(getStringValue(row.getCell(2)));
                    recipe.setKeyIngredients(getStringValue(row.getCell(3)));
                    recipe.setProtein(getDoubleValue(row.getCell(4)));
                    recipe.setCalcium(getDoubleValue(row.getCell(5)));
                    recipe.setIron(getDoubleValue(row.getCell(6)));
                    recipe.setCookingTime(getIntegerValue(row.getCell(7)));

                    recipe.setKetoFriendly(getBooleanValue(row.getCell(8)));
                    recipe.setVeganOptions(getBooleanValue(row.getCell(9)));
                    recipe.setGlutenFree(getBooleanValue(row.getCell(10)));
                    recipe.setLowCholesterol(getBooleanValue(row.getCell(11)));
                    recipe.setHighCholesterol(getBooleanValue(row.getCell(12)));
                    recipe.setHighSodium(getBooleanValue(row.getCell(13)));
                    recipe.setHighFiber(getBooleanValue(row.getCell(14)));
                    recipe.setLowSodium(getBooleanValue(row.getCell(15)));

                    recipeRepository.save(recipe);
                } catch (Exception e) {
                    log.error("Error parsing row " + row.getRowNum(), e);
                }
            }
            log.info("Excel recipe import completed.");

        } catch (IOException e) {
            log.error("Failed to read recipe Excel file", e);
        }
    }

    private String getStringValue(Cell cell) {
        if (cell == null)
            return null;
        if (cell.getCellType() == CellType.STRING)
            return cell.getStringCellValue();
        if (cell.getCellType() == CellType.NUMERIC)
            return String.valueOf(cell.getNumericCellValue());
        return null;
    }

    private Double getDoubleValue(Cell cell) {
        if (cell == null)
            return 0.0;
        if (cell.getCellType() == CellType.NUMERIC)
            return cell.getNumericCellValue();
        if (cell.getCellType() == CellType.STRING) {
            try {
                return Double.parseDouble(cell.getStringCellValue());
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
        return 0.0;
    }

    private Integer getIntegerValue(Cell cell) {
        if (cell == null)
            return 0;
        if (cell.getCellType() == CellType.NUMERIC)
            return (int) cell.getNumericCellValue();
        if (cell.getCellType() == CellType.STRING) {
            try {
                return Integer.parseInt(cell.getStringCellValue());
            } catch (NumberFormatException e) {
                return 0;
            }
        }
        return 0;
    }

    private Boolean getBooleanValue(Cell cell) {
        if (cell == null)
            return false;
        if (cell.getCellType() == CellType.BOOLEAN)
            return cell.getBooleanCellValue();
        if (cell.getCellType() == CellType.STRING) {
            String val = cell.getStringCellValue().trim().toUpperCase();
            return "TRUE".equals(val) || "YES".equals(val) || "1".equals(val);
        }
        return false;
    }
}
