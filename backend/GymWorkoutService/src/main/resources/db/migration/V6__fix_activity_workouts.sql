-- V6__fix_activity_workouts.sql
-- Fix Zumba, Cardio, and Fat Loss workouts that accidentally picked up heavy lifting exercises due to random sampling

-- 1. Clear existing workout_exercises for the Activity/Cardio splits
DELETE FROM workout_exercises 
WHERE workout_id IN (
    'c1000000-0000-0000-0000-000000000004', -- Zumba
    'c1000000-0000-0000-0000-000000000005', -- HIIT Cardio
    'c1000000-0000-0000-0000-000000000006'  -- Fat Loss Shred
);

-- 2. Insert Zumba Exercises (Using the specific class exercises e25...101 to 125)
INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, created_at, updated_at)
SELECT gen_random_uuid(), 'c1000000-0000-0000-0000-000000000004', id, 1, 'Duration: 30s', NOW(), NOW()
FROM exercises
WHERE id::text LIKE 'e2500001-0000-0000-0000-0000000001%'
ORDER BY id ASC;

-- 3. Insert HIIT Cardio Masterclass (Using the specific cardio exercises e25...201 to 225)
INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, created_at, updated_at)
SELECT gen_random_uuid(), 'c1000000-0000-0000-0000-000000000005', id, 1, 'Duration: 30s', NOW(), NOW()
FROM exercises
WHERE id::text LIKE 'e2500001-0000-0000-0000-0000000002%'
ORDER BY id ASC;

-- 4. Insert Fat Loss Shred (A mix of Cardio and Bodyweight/Core)
INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, created_at, updated_at)
SELECT gen_random_uuid(), 'c1000000-0000-0000-0000-000000000006', id, 3, '15-20', NOW(), NOW()
FROM exercises
WHERE (id::text LIKE 'e2500001-0000-0000-0000-0000000002%' 
       OR muscle_group IN ('ABS', 'CORE', 'FULL BODY'))
  AND equipment = 'Bodyweight'
ORDER BY RANDOM() LIMIT 20;
