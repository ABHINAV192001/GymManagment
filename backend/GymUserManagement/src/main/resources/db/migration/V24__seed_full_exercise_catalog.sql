-- V24__seed_full_exercise_catalog.sql
-- Pure SQL migration seeding comprehensive exercise catalog across all muscle groups (Chest, Back, Legs, Shoulders, Arms, Abs)

INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, mechanics, difficulty_level, recommended_sets, recommended_reps, rest_interval, description, created_at)
VALUES
-- CHEST
('e2400001-0000-0000-0000-000000000001', 'Barbell Incline Bench Press', 'CHEST', 'Triceps, Upper Deltoid', 'Barbell', 'COMPOUND', 'INTERMEDIATE', 4, '8-10', '90s', 'Upper pectoral builder placing shoulder at 30-degree elevation.', NOW()),
('e2400001-0000-0000-0000-000000000002', 'Dumbbell Flat Flyes', 'CHEST', 'Front Deltoid', 'Dumbbell', 'ISOLATION', 'BEGINNER', 4, '12-15', '60s', 'Isolation exercise maximizing pectoral stretch at the bottom position.', NOW()),
('e2400001-0000-0000-0000-000000000003', 'Pec Deck Machine Butterfly', 'CHEST', 'Front Deltoid', 'Machine', 'ISOLATION', 'BEGINNER', 4, '12-15', '60s', 'Machine chest squeeze delivering peak contraction across inner chest.', NOW()),
('e2400001-0000-0000-0000-000000000004', 'Weighted Bodyweight Dips', 'CHEST', 'Triceps, Lower Pecs', 'Bodyweight', 'COMPOUND', 'PRO', 4, '6-8', '120s', 'Forward-leaning dip focusing heavy load on lower chest line.', NOW()),

-- BACK
('e2400001-0000-0000-0000-000000000005', 'Bent-Over Barbell Row', 'BACK', 'Biceps, Rear Deltoids, Core', 'Barbell', 'COMPOUND', 'INTERMEDIATE', 4, '8-10', '90s', 'Fundamental thick back mass builder targeting lats and rhomboids.', NOW()),
('e2400001-0000-0000-0000-000000000006', 'Wide-Grip Lat Pulldown', 'BACK', 'Biceps, Brachialis', 'Cable', 'COMPOUND', 'BEGINNER', 4, '10-12', '60s', 'Primary lat width movement depressing and retracting shoulder blades.', NOW()),
('e2400001-0000-0000-0000-000000000007', 'Single-Arm Dumbbell Row', 'BACK', 'Biceps, Core', 'Dumbbell', 'COMPOUND', 'BEGINNER', 4, '10-12', '60s', 'Unilateral rowing movement allowing maximum stretch and full lat range.', NOW()),
('e2400001-0000-0000-0000-000000000008', 'Seated Cable Row (V-Grip)', 'BACK', 'Rhomboids, Lower Traps', 'Cable', 'COMPOUND', 'BEGINNER', 4, '10-12', '60s', 'Mid-back thickness builder squeezing shoulder blades together.', NOW()),

-- SHOULDERS
('e2400001-0000-0000-0000-000000000009', 'Dumbbell Lateral Raise', 'SHOULDERS', 'Traps', 'Dumbbell', 'ISOLATION', 'BEGINNER', 4, '12-15', '60s', 'Side deltoid isolation constructing shoulder width and capping.', NOW()),
('e2400001-0000-0000-0000-000000000010', 'Arnold Overhead Press', 'SHOULDERS', 'Triceps, Upper Pecs', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 4, '8-10', '90s', 'Rotational dumbbell overhead press targeting all three deltoid heads.', NOW()),
('e2400001-0000-0000-0000-000000000011', 'Reverse Pec Deck Flyes', 'SHOULDERS', 'Rhomboids, Rear Delts', 'Machine', 'ISOLATION', 'BEGINNER', 4, '12-15', '60s', 'Rear deltoid isolation maintaining upper body balance and posture.', NOW()),

-- LEGS
('e2400001-0000-0000-0000-000000000012', 'Romanian Deadlift (Barbell)', 'HAMSTRINGS', 'Glutes, Lower Back', 'Barbell', 'COMPOUND', 'INTERMEDIATE', 4, '8-10', '90s', 'Hip hinge movement placing extreme eccentric stretch on hamstrings.', NOW()),
('e2400001-0000-0000-0000-000000000013', '45-Degree Incline Leg Press', 'QUADS', 'Glutes, Hamstrings', 'Machine', 'COMPOUND', 'BEGINNER', 4, '10-12', '90s', 'Machine leg drive allowing heavy quad overload without spinal compression.', NOW()),
('e2400001-0000-0000-0000-000000000014', 'Bulgarian Split Squats', 'QUADS', 'Glutes, Hamstrings', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 4, '10-12', '90s', 'Single-leg quad and glute builder improving unilateral balance.', NOW()),

-- ARMS
('e2400001-0000-0000-0000-000000000015', 'Incline Dumbbell Bicep Curl', 'BICEPS', 'Brachialis', 'Dumbbell', 'ISOLATION', 'BEGINNER', 4, '10-12', '60s', 'Seated incline curl stretching the long head of the bicep for peak height.', NOW()),
('e2400001-0000-0000-0000-000000000016', 'EZ-Bar Skullcrushers', 'TRICEPS', 'Forearms', 'Barbell', 'ISOLATION', 'INTERMEDIATE', 4, '10-12', '60s', 'Lying tricep extension targeting the long tricep head behind the head.', NOW()),

-- ABS
('e2400001-0000-0000-0000-000000000017', 'Hanging Leg Raises', 'ABS', 'Hip Flexors, Core', 'Bodyweight', 'COMPOUND', 'INTERMEDIATE', 4, '12-15', '60s', 'Hanging ab movement curling pelvis upward to hit lower abdominal wall.', NOW()),
('e2400001-0000-0000-0000-000000000018', 'Ab Wheel Rollouts', 'ABS', 'Lats, Erector Spinae', 'Bodyweight', 'COMPOUND', 'PRO', 4, '10-12', '90s', 'Anti-extension core movement building dense abdominal wall strength.', NOW())
ON CONFLICT (id) DO NOTHING;
