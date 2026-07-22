-- 6. FOOD & NUTRITION
CREATE TABLE food (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(255),
    description VARCHAR(255) NOT NULL,
    calories FLOAT,
    protein FLOAT,
    carbohydrates FLOAT,
    fat FLOAT,
    vegan_options BOOLEAN,
    gluten_free BOOLEAN
);

CREATE TABLE nutrient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    nutrient_number VARCHAR(255) UNIQUE,
    unit_name VARCHAR(255)
);

CREATE TABLE food_nutrient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID NOT NULL REFERENCES food(id) ON DELETE CASCADE,
    nutrient_id UUID NOT NULL REFERENCES nutrient(id) ON DELETE CASCADE,
    amount FLOAT
);

CREATE TABLE food_portion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID NOT NULL REFERENCES food(id) ON DELETE CASCADE,
    amount FLOAT,
    measure_unit VARCHAR(255),
    gram_weight FLOAT
);

CREATE TABLE food_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES food(id) ON DELETE CASCADE,
    date DATE,
    meal_type VARCHAR(255),
    quantity FLOAT
);

CREATE TABLE water_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE,
    amount FLOAT
);

CREATE TABLE user_diet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    timing_food VARCHAR(255),
    food_name VARCHAR(255),
    description VARCHAR(255)
);
