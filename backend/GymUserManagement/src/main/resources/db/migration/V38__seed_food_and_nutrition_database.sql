-- V38: Seed Comprehensive Food & Recipe Database (USDA & FooDB Compliant Data)
INSERT INTO food (
    id, description, category, calories, protein, carbohydrates, fat, fiber,
    magnesium, calcium, iron, potassium, sodium, vitamin_c, is_recipe,
    recipe_ingredients, recipe_instructions, cooking_time, magnesium_rich, created_at
) VALUES
-- MAGNESIUM-RICH FOODS
(
    'a0000000-0000-0000-0000-000000000001',
    'Raw Pumpkin Seeds (Pepitas)',
    'Nuts & Seeds',
    559.0, 30.2, 10.7, 49.0, 6.0,
    592.0, 46.0, 8.8, 809.0, 7.0, 1.9, false,
    NULL, NULL, NULL, true, NOW()
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Raw Almonds',
    'Nuts & Seeds',
    579.0, 21.2, 21.6, 49.9, 12.5,
    270.0, 269.0, 3.7, 733.0, 1.0, 0.0, false,
    NULL, NULL, NULL, true, NOW()
),
(
    'a0000000-0000-0000-0000-000000000003',
    'Organic Dark Chocolate (85% Cacao)',
    'Snacks',
    600.0, 7.8, 46.0, 43.0, 11.0,
    228.0, 73.0, 11.9, 715.0, 20.0, 0.0, false,
    NULL, NULL, NULL, true, NOW()
),
(
    'a0000000-0000-0000-0000-000000000004',
    'Fresh Spinach (Raw Leaves)',
    'Vegetables',
    23.0, 2.9, 3.6, 0.4, 2.2,
    79.0, 99.0, 2.7, 558.0, 79.0, 28.1, false,
    NULL, NULL, NULL, true, NOW()
),
(
    'a0000000-0000-0000-0000-000000000005',
    'Cooked Black Beans',
    'Legumes',
    132.0, 8.9, 23.7, 0.5, 8.7,
    70.0, 27.0, 2.1, 355.0, 2.0, 0.0, false,
    NULL, NULL, NULL, true, NOW()
),

-- FRUITS & STAPLES
(
    'a0000000-0000-0000-0000-000000000006',
    'Fresh Cavendish Banana',
    'Fruits',
    89.0, 1.1, 22.8, 0.3, 2.6,
    27.0, 5.0, 0.26, 358.0, 1.0, 8.7, false,
    NULL, NULL, NULL, true, NOW()
),
(
    'a0000000-0000-0000-0000-000000000007',
    'Fresh Red Delicious Apple',
    'Fruits',
    52.0, 0.3, 13.8, 0.2, 2.4,
    5.0, 6.0, 0.12, 107.0, 1.0, 4.6, false,
    NULL, NULL, NULL, false, NOW()
),
(
    'a0000000-0000-0000-0000-000000000008',
    'Fresh Hass Avocado',
    'Fruits',
    160.0, 2.0, 8.5, 14.7, 6.7,
    29.0, 12.0, 0.55, 485.0, 7.0, 10.0, false,
    NULL, NULL, NULL, true, NOW()
),

-- HIGH PROTEIN MEATS & DAIRY
(
    'a0000000-0000-0000-0000-000000000009',
    'Boneless Skinless Chicken Breast (Raw)',
    'Poultry',
    120.0, 22.5, 0.0, 2.6, 0.0,
    29.0, 11.0, 0.74, 256.0, 65.0, 0.0, false,
    NULL, NULL, NULL, false, NOW()
),
(
    'a0000000-0000-0000-0000-000000000010',
    'Atlantic Salmon Fillet (Raw)',
    'Seafood',
    208.0, 20.4, 0.0, 13.4, 0.0,
    27.0, 9.0, 0.34, 363.0, 59.0, 0.0, false,
    NULL, NULL, NULL, true, NOW()
),
(
    'a0000000-0000-0000-0000-000000000011',
    'Greek Yogurt 0% Fat Plain',
    'Dairy',
    59.0, 10.2, 3.6, 0.4, 0.0,
    11.0, 110.0, 0.1, 141.0, 36.0, 0.0, false,
    NULL, NULL, NULL, false, NOW()
),
(
    'a0000000-0000-0000-0000-000000000012',
    'Whey Protein Isolate Powder (Unflavored)',
    'Supplements',
    370.0, 90.0, 1.0, 0.5, 0.0,
    60.0, 450.0, 1.2, 420.0, 160.0, 0.0, false,
    NULL, NULL, NULL, false, NOW()
),

-- FAT LOSS RECIPES
(
    'a0000000-0000-0000-0000-000000000013',
    'High-Protein Anabolic Lean Beef Bowl',
    'Recipes',
    145.0, 18.5, 12.0, 3.2, 2.8,
    45.0, 32.0, 2.8, 410.0, 220.0, 0.0, true,
    E'200g Lean Ground Beef (95/5)\n150g Cooked Jasmine Rice\n100g Fresh Steamed Broccoli Florets\n30g Chopped Spinach\n1 tsp Low Sodium Soy Sauce & Garlic',
    E'Brown the 95/5 lean beef in a non-stick skillet over medium-high heat with minced garlic.\nSteam broccoli florets until tender-crisp (approx 4 mins).\nWarm cooked jasmine rice and fold in raw chopped spinach until wilted.\nAssemble beef and broccoli over rice base and drizzle with low-sodium soy sauce.',
    20, true, NOW()
),
(
    'a0000000-0000-0000-0000-000000000014',
    'Magnesium & Antioxidant Fat Burner Smoothie',
    'Recipes',
    78.0, 7.2, 9.8, 1.5, 3.1,
    95.0, 140.0, 1.9, 380.0, 45.0, 0.0, true,
    E'1 scoop Whey Protein Isolate (30g)\n1 cup Unsweetened Almond Milk (240g)\n50g Fresh Baby Spinach\n15g Pumpkin Seeds\n1/2 Frozen Banana (50g)\n3-4 Ice cubes',
    E'Add unsweetened almond milk and baby spinach to high-speed blender.\nBlend spinach and milk for 20 seconds until smooth.\nAdd whey protein isolate, pumpkin seeds, frozen banana, and ice cubes.\nBlend on high for 45 seconds until creamy and frothy. Serve immediately.',
    5, true, NOW()
),
(
    'a0000000-0000-0000-0000-000000000015',
    'Zesty Lemon Herb Grilled Chicken Salad',
    'Recipes',
    98.0, 14.2, 4.1, 2.8, 1.8,
    38.0, 45.0, 1.4, 320.0, 180.0, 0.0, true,
    E'180g Grilled Chicken Breast strips\n100g Mixed Greens & Arugula\n50g Cherry Tomatoes\n30g Sliced Cucumber\n1 tbsp Lemon Juice & Apple Cider Vinegar',
    E'Season chicken breast with oregano, black pepper, and sea salt.\nGrill chicken over high heat for 5-6 mins per side until internal temp hits 165°F (74°C).\nToss mixed greens, arugula, cherry tomatoes, and cucumber in a large bowl.\nSlice chicken into strips, place over salad, and drizzle with fresh lemon juice.',
    15, false, NOW()
)
ON CONFLICT (id) DO NOTHING;
