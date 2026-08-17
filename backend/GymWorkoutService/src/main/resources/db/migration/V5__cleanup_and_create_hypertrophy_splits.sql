-- V5__cleanup_and_create_hypertrophy_splits.sql

-- 1. Clean up old Volume based routines (Zumba Volume 1, Cardio Volume 2, etc.)
DELETE FROM workouts WHERE title LIKE '%Volume %';

-- 2. Insert Base Workout Sessions (Hypertrophy, Zumba, Cardio, etc.)
INSERT INTO workouts (id, title, description, category, difficulty, duration, days_per_week, calories, created_at, updated_at) VALUES 
('c1000000-0000-0000-0000-000000000001', 'Hypertrophy - Push', 'Target chest, shoulders, and triceps for max muscle growth.', 'STRENGTH_TRAINING', 'INTERMEDIATE', '1 Hr', 2, 600, NOW(), NOW()),
('c1000000-0000-0000-0000-000000000002', 'Hypertrophy - Pull', 'Target back, biceps, and rear delts for a wider frame.', 'STRENGTH_TRAINING', 'INTERMEDIATE', '1 Hr', 2, 600, NOW(), NOW()),
('c1000000-0000-0000-0000-000000000003', 'Hypertrophy - Legs', 'Intense leg session focusing on quads, hamstrings, and calves.', 'STRENGTH_TRAINING', 'INTERMEDIATE', '1 Hr', 2, 700, NOW(), NOW()),
('c1000000-0000-0000-0000-000000000004', 'Zumba Ultimate Session', 'High energy, full-body dance cardio.', 'ACTIVITY_CLASS', 'ALL', '45 Min', 3, 550, NOW(), NOW()),
('c1000000-0000-0000-0000-000000000005', 'HIIT Cardio Masterclass', 'Heart-pumping cardio to burn maximum calories in minimum time.', 'CARDIO', 'INTERMEDIATE', '30 Min', 3, 400, NOW(), NOW()),
('c1000000-0000-0000-0000-000000000006', 'Fat Loss Shred', 'Combination of resistance and cardio designed for fat loss.', 'FAT_LOSS', 'PRO', '1 Hr', 4, 800, NOW(), NOW()),
('c1000000-0000-0000-0000-000000000007', 'Heavy Power Strength', 'Focus on compound movements to build overall raw strength.', 'STRENGTH_TRAINING', 'PRO', '1.5 Hr', 4, 600, NOW(), NOW()),
('c1000000-0000-0000-0000-000000000008', 'Core & Abs Blast', 'Intense core session to carve out your abs.', 'CORE', 'INTERMEDIATE', '20 Min', 3, 200, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 3. Insert Split Days for them just for display purposes
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES 
(gen_random_uuid(), 'c1000000-0000-0000-0000-000000000001', 'Push Day', 'Chest, Shoulders, Triceps', 'Push mechanics focus', 1),
(gen_random_uuid(), 'c1000000-0000-0000-0000-000000000002', 'Pull Day', 'Back, Biceps, Forearms', 'Pull mechanics focus', 1),
(gen_random_uuid(), 'c1000000-0000-0000-0000-000000000003', 'Leg Day', 'Quads, Hamstrings, Glutes, Calves', 'Lower body focus', 1),
(gen_random_uuid(), 'c1000000-0000-0000-0000-000000000004', 'Zumba', 'Dance Cardio', 'Full body rhythmic motion', 1),
(gen_random_uuid(), 'c1000000-0000-0000-0000-000000000005', 'Cardio', 'HIIT Circuit', 'High intensity intervals', 1),
(gen_random_uuid(), 'c1000000-0000-0000-0000-000000000006', 'Fat Loss', 'Metabolic Conditioning', 'Burn fat effectively', 1),
(gen_random_uuid(), 'c1000000-0000-0000-0000-000000000007', 'Strength', 'Powerbuilding', 'Heavy compound lifts', 1),
(gen_random_uuid(), 'c1000000-0000-0000-0000-000000000008', 'Abs', 'Core Strength', 'Abdominals and obliques', 1)
ON CONFLICT DO NOTHING;

-- 4. Map ~30 Exercises per Workout using Subqueries

-- Hypertrophy Push (Chest, Shoulders, Triceps)
INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, created_at, updated_at)
SELECT gen_random_uuid(), 'c1000000-0000-0000-0000-000000000001', id, 4, '8-12', NOW(), NOW()
FROM exercises
WHERE muscle_group IN ('CHEST', 'SHOULDERS', 'TRICEPS')
ORDER BY RANDOM() LIMIT 30
ON CONFLICT DO NOTHING;

-- Hypertrophy Pull (Back, Biceps, Forearms)
INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, created_at, updated_at)
SELECT gen_random_uuid(), 'c1000000-0000-0000-0000-000000000002', id, 4, '8-12', NOW(), NOW()
FROM exercises
WHERE muscle_group IN ('BACK', 'BICEPS', 'FOREARMS')
ORDER BY RANDOM() LIMIT 30
ON CONFLICT DO NOTHING;

-- Hypertrophy Legs (Quads, Hamstrings, Glutes, Calves)
INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, created_at, updated_at)
SELECT gen_random_uuid(), 'c1000000-0000-0000-0000-000000000003', id, 4, '8-12', NOW(), NOW()
FROM exercises
WHERE muscle_group IN ('QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES')
ORDER BY RANDOM() LIMIT 30
ON CONFLICT DO NOTHING;

-- Zumba Ultimate Session (Full Body / Cardio)
INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, created_at, updated_at)
SELECT gen_random_uuid(), 'c1000000-0000-0000-0000-000000000004', id, 1, 'Duration: 30s', NOW(), NOW()
FROM exercises
ORDER BY RANDOM() LIMIT 30
ON CONFLICT DO NOTHING;

-- HIIT Cardio Masterclass
INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, created_at, updated_at)
SELECT gen_random_uuid(), 'c1000000-0000-0000-0000-000000000005', id, 1, 'Duration: 30s', NOW(), NOW()
FROM exercises
ORDER BY RANDOM() LIMIT 30
ON CONFLICT DO NOTHING;

-- Fat Loss Shred
INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, created_at, updated_at)
SELECT gen_random_uuid(), 'c1000000-0000-0000-0000-000000000006', id, 3, '15-20', NOW(), NOW()
FROM exercises
ORDER BY RANDOM() LIMIT 30
ON CONFLICT DO NOTHING;

-- Heavy Power Strength (Compound focused if possible, else random)
INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, created_at, updated_at)
SELECT gen_random_uuid(), 'c1000000-0000-0000-0000-000000000007', id, 5, '3-5', NOW(), NOW()
FROM exercises
WHERE mechanics = 'COMPOUND'
ORDER BY RANDOM() LIMIT 30
ON CONFLICT DO NOTHING;

-- Core & Abs Blast
INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, created_at, updated_at)
SELECT gen_random_uuid(), 'c1000000-0000-0000-0000-000000000008', id, 3, '15-20', NOW(), NOW()
FROM exercises
WHERE muscle_group IN ('ABS', 'CORE')
ORDER BY RANDOM() LIMIT 30
ON CONFLICT DO NOTHING;
