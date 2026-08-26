-- V51__seed_exercise_dataset_keyframes.sql
-- Updates existing exercises and seeds dataset keyframe exercises (0.jpg start position & 1.jpg finish position)

-- Update existing catalog exercises with standard keyframe URLs if null
UPDATE exercises 
SET step_one_image = COALESCE(step_one_image, '/exercises/' || REPLACE(LOWER(name), ' ', '_') || '/0.jpg'),
    step_two_image = COALESCE(step_two_image, '/exercises/' || REPLACE(LOWER(name), ' ', '_') || '/1.jpg')
WHERE step_one_image IS NULL OR step_two_image IS NULL;

-- Insert dataset keyframe exercises with start (0.jpg) & finish (1.jpg) paths
INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, mechanics, difficulty_level, recommended_sets, recommended_reps, rest_interval, description, execution_steps, safety_tips, step_one_image, step_two_image, created_at)
VALUES
-- ABS / CORE KEYFRAME DATASET
('e5100001-0000-0000-0000-000000000001', '3/4 Sit-Up', 'ABS', 'Hip Flexors', 'Bodyweight', 'ISOLATION', 'BEGINNER', 4, '15-20', '60s', 'Abdominal crunch lifting torso three-quarters toward knees to maintain continuous tension.', '1. Lie flat on back with knees bent at 90 degrees and feet flat.\n2. Inhale and curl shoulders and upper back off the floor toward knees.\n3. Stop at 3/4 height to keep tension on abs, then lower smoothly.', 'Avoid pulling neck with hands; keep chin neutral.', '/exercises/3_4_Sit-Up/0.jpg', '/exercises/3_4_Sit-Up/1.jpg', NOW()),

('e5100001-0000-0000-0000-000000000002', 'Ab Crunch Machine', 'ABS', 'Obliques', 'Machine', 'ISOLATION', 'BEGINNER', 4, '12-15', '60s', 'Machine seated crunch for strict abdominal isolation with adjustable load.', '1. Sit on machine with feet secured under pads and hands gripping handles.\n2. Flex abdominals to pull ribcage down toward hips.\n3. Squeeze at peak contraction for 1 second, then return with control.', 'Do not rely on arm force; drive with abdominal contraction.', '/exercises/Ab_Crunch_Machine/0.jpg', '/exercises/Ab_Crunch_Machine/1.jpg', NOW()),

('e5100001-0000-0000-0000-000000000003', 'Ab Roller Rollout', 'ABS', 'Lats, Lower Back', 'Bodyweight', 'COMPOUND', 'PRO', 4, '10-12', '90s', 'Dynamic rollout exercise developing extreme core stability and lower ab density.', '1. Kneel on pad with ab roller wheel in front under shoulders.\n2. Roll wheel forward smoothly while maintaining neutral lumbar spine.\n3. Pause when body is extended, then pull back using core and lats.', 'Do not let lower back sag into hyper-extension during reach.', '/exercises/Ab_Roller/0.jpg', '/exercises/Ab_Roller/1.jpg', NOW()),

('e5100001-0000-0000-0000-000000000004', 'Air Bike Crunch', 'ABS', 'Obliques', 'Bodyweight', 'ISOLATION', 'INTERMEDIATE', 4, '15-20', '60s', 'Dynamic rotational abdominal crunch engaging rectus abdominis and obliques simultaneously.', '1. Lie back with hands behind head and legs elevated with knees bent.\n2. Bring right elbow to left knee while extending right leg outward.\n3. Alternate sides continuously in a smooth pedaling motion.', 'Focus on twisting shoulder across torso, not just pulling elbows.', '/exercises/Air_Bike/0.jpg', '/exercises/Air_Bike/1.jpg', NOW()),

-- LEGS & HAMSTRINGS
('e5100001-0000-0000-0000-000000000005', '90/90 Hamstring Stretch & Flex', 'HAMSTRINGS', 'Glutes', 'Bodyweight', 'ISOLATION', 'BEGINNER', 3, '10-12', '45s', 'Targeted hamstring mobility and hip flexor active isolation movement.', '1. Lie on back with one leg at 90-degree hip and knee flex.\n2. Extend lower leg toward ceiling until hamstring stretch is felt.\n3. Pause briefly and return leg to 90-degree bent position.', 'Keep hips grounded throughout rotation.', '/exercises/90_90_Hamstring/0.jpg', '/exercises/90_90_Hamstring/1.jpg', NOW()),

('e5100001-0000-0000-0000-000000000006', 'Adductor Seated Machine', 'QUADS', 'Inner Thigh, Glutes', 'Machine', 'ISOLATION', 'BEGINNER', 4, '12-15', '60s', 'Seated inner thigh adduction developing inner leg density and hip joint stability.', '1. Sit on adductor machine with pads positioned outside thighs.\n2. Contract inner thighs to press pads inward until they touch.\n3. Hold peak squeeze for 1 second, then open under slow control.', 'Avoid using upper body momentum to force pads together.', '/exercises/Adductor/0.jpg', '/exercises/Adductor/1.jpg', NOW())

ON CONFLICT (id) DO UPDATE SET
step_one_image = EXCLUDED.step_one_image,
step_two_image = EXCLUDED.step_two_image,
execution_steps = EXCLUDED.execution_steps,
safety_tips = EXCLUDED.safety_tips;
