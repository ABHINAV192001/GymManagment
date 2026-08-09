-- V23__seed_preset_workout_splits_and_exercises.sql
-- Seed core compound & isolation exercises, preset hypertrophy workout routines, and routine exercise mappings.

-- 1. Ensure additional core exercises with mechanics exist in exercises table
INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, mechanics, difficulty_level, recommended_sets, recommended_reps, rest_interval, description, created_at)
VALUES
(
    'e1111111-0000-0000-0000-000000000001',
    'Barbell Conventional Deadlift',
    'BACK',
    'Hamstrings, Glutes, Erector Spinae',
    'Barbell',
    'COMPOUND',
    'PRO',
    4, '5-6', '180s',
    'The king of posterior chain compound exercises loading spinal erectors, lats, and glutes.',
    NOW()
),
(
    'e1111111-0000-0000-0000-000000000002',
    'Barbell Military Overhead Press',
    'SHOULDERS',
    'Triceps, Upper Chest, Core',
    'Barbell',
    'COMPOUND',
    'INTERMEDIATE',
    4, '6-8', '120s',
    'Strict standing overhead press building deltoid mass and shoulder joint stability.',
    NOW()
),
(
    'e1111111-0000-0000-0000-000000000003',
    'Standing EZ-Bar Bicep Curls',
    'BICEPS',
    'Brachialis, Forearms',
    'Barbell',
    'ISOLATION',
    'BEGINNER',
    4, '10-12', '60s',
    'Isolation arm curl flexing elbow under continuous tension to build peak bicep volume.',
    NOW()
),
(
    'e1111111-0000-0000-0000-000000000004',
    'Cable Triceps Rope Pushdown',
    'TRICEPS',
    'Lateral Head, Medial Head',
    'Cable',
    'ISOLATION',
    'BEGINNER',
    4, '12-15', '60s',
    'Tricep isolation exercise locking out elbows to target outer and inner tricep heads.',
    NOW()
),
(
    'e1111111-0000-0000-0000-000000000005',
    'Seated Quad Leg Extensions',
    'QUADS',
    'Rectus Femoris',
    'Machine',
    'ISOLATION',
    'BEGINNER',
    4, '12-15', '60s',
    'Machine quad isolation isolating front thigh sweep with top contraction pause.',
    NOW()
),
(
    'e1111111-0000-0000-0000-000000000006',
    'High-Bar Barbell Back Squat',
    'QUADS',
    'Glutes, Hamstrings, Core',
    'Barbell',
    'COMPOUND',
    'INTERMEDIATE',
    4, '8-10', '120s',
    'Compound leg movement driving knee flexion to maximize quad mass and leg drive.',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Preset Hypertrophy Workout Routines into workouts table
INSERT INTO workouts (id, title, description, category, difficulty, duration, calories, image_url, mandatory_exercises)
VALUES
(
    'b1111111-0000-0000-0000-000000000001',
    'Push / Pull / Legs (PPL) Hypertrophy Split',
    'Gold-standard 6-day split isolating pushing muscles (Chest/Shoulders/Triceps), pulling muscles (Back/Biceps), and lower body.',
    'PPL',
    'INTERMEDIATE',
    '6 Days/Wk',
    450,
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
    6
),
(
    'b1111111-0000-0000-0000-000000000002',
    'The Arnold Schwarzenegger Golden Era Split',
    'High volume chest/back super-sets paired with shoulders and arms for maximum upper body expansion.',
    'CLASSIC PRO',
    'PRO',
    '6 Days/Wk',
    550,
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    5
),
(
    'b1111111-0000-0000-0000-000000000003',
    '4-Day Upper / Lower Strength & Volume Split',
    'Optimal recovery split training upper body and lower body twice per week with heavy compound progression.',
    'STRENGTH & HYPERTROPHY',
    'BEGINNER',
    '4 Days/Wk',
    400,
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
    4
),
(
    'b1111111-0000-0000-0000-000000000004',
    '5-Day Classic Bodypart Bro Split',
    'Bodybuilding split hitting one major muscle group per day with maximum single-session volume.',
    'BODYBUILDING',
    'INTERMEDIATE',
    '5 Days/Wk',
    420,
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
    5
)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Workout Exercises Join Table Mappings
DELETE FROM workout_exercises WHERE workout_id IN (
    'b1111111-0000-0000-0000-000000000001',
    'b1111111-0000-0000-0000-000000000002',
    'b1111111-0000-0000-0000-000000000003',
    'b1111111-0000-0000-0000-000000000004'
);

INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, time)
VALUES
-- PPL Workout Exercises
('c1111111-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000001', 4, 10, 90),
('c1111111-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000002', 4, 8, 90),
('c1111111-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000001', 4, 5, 180),
('c1111111-0000-0000-0000-000000000004', 'b1111111-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000003', 4, 12, 60),
('c1111111-0000-0000-0000-000000000005', 'b1111111-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000004', 4, 15, 60),
('c1111111-0000-0000-0000-000000000006', 'b1111111-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000006', 4, 8, 120),

-- Arnold Split Exercises
('c1111111-0000-0000-0000-000000000007', 'b1111111-0000-0000-0000-000000000002', 'e1111111-0000-0000-0000-000000000001', 4, 10, 90),
('c1111111-0000-0000-0000-000000000008', 'b1111111-0000-0000-0000-000000000002', 'e1111111-0000-0000-0000-000000000001', 4, 6, 180),
('c1111111-0000-0000-0000-000000000009', 'b1111111-0000-0000-0000-000000000002', 'e1111111-0000-0000-0000-000000000002', 4, 8, 90),
('c1111111-0000-0000-0000-000000000010', 'b1111111-0000-0000-0000-000000000002', 'e1111111-0000-0000-0000-000000000003', 4, 10, 60),

-- Upper/Lower Exercises
('c1111111-0000-0000-0000-000000000011', 'b1111111-0000-0000-0000-000000000003', 'e1111111-0000-0000-0000-000000000001', 4, 8, 90),
('c1111111-0000-0000-0000-000000000012', 'b1111111-0000-0000-0000-000000000003', 'e1111111-0000-0000-0000-000000000006', 4, 10, 120),
('c1111111-0000-0000-0000-000000000013', 'b1111111-0000-0000-0000-000000000003', 'e1111111-0000-0000-0000-000000000005', 4, 12, 60),

-- Bro Split Exercises
('c1111111-0000-0000-0000-000000000014', 'b1111111-0000-0000-0000-000000000004', 'e1111111-0000-0000-0000-000000000001', 4, 10, 90),
('c1111111-0000-0000-0000-000000000015', 'b1111111-0000-0000-0000-000000000004', 'e1111111-0000-0000-0000-000000000001', 4, 6, 180),
('c1111111-0000-0000-0000-000000000016', 'b1111111-0000-0000-0000-000000000004', 'e1111111-0000-0000-0000-000000000002', 4, 8, 90),
('c1111111-0000-0000-0000-000000000017', 'b1111111-0000-0000-0000-000000000004', 'e1111111-0000-0000-0000-000000000006', 4, 10, 120);
