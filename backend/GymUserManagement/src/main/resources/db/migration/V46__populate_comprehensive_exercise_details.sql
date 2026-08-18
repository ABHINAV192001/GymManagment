-- V46__populate_comprehensive_exercise_details.sql
-- Backfill and enrich all exercise records with complete non-null details,
-- remove duplicates with null fields, and ensure rich seed data for all muscle groups (including FOREARMS, HAMSTRINGS, GLUTES, CALVES, ABS).

-- 0. Ensure base fitness tables exist safely regardless of microservice startup order
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='workouts') THEN
        CREATE TABLE workouts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            difficulty VARCHAR(50),
            duration VARCHAR(50),
            days_per_week INT DEFAULT 3,
            calories INT,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='exercises') THEN
        CREATE TABLE exercises (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            video_url VARCHAR(500),
            muscle_group VARCHAR(100),
            secondary_muscles VARCHAR(255),
            equipment VARCHAR(100),
            mechanics VARCHAR(50),
            difficulty_level VARCHAR(50),
            recommended_sets INT,
            recommended_reps VARCHAR(50),
            rest_interval VARCHAR(50),
            execution_steps TEXT,
            coaching_cues TEXT,
            safety_tips TEXT,
            step_one_image VARCHAR(500),
            step_one_description TEXT,
            step_two_image VARCHAR(500),
            step_two_description TEXT,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            deleted_at TIMESTAMP WITHOUT TIME ZONE
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='safety_tips') THEN
        ALTER TABLE exercises ADD COLUMN safety_tips TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='coaching_cues') THEN
        ALTER TABLE exercises ADD COLUMN coaching_cues TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='deleted_at') THEN
        ALTER TABLE exercises ADD COLUMN deleted_at TIMESTAMP WITHOUT TIME ZONE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='workout_exercises') THEN
        CREATE TABLE workout_exercises (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
            exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
            sets INT,
            reps VARCHAR(50),
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- 1. Standardize muscle_group names to UPPERCASE
UPDATE exercises
SET muscle_group = UPPER(muscle_group)
WHERE muscle_group IS NOT NULL;

-- 2. Clean up incomplete duplicate exercise records (where secondary_muscles IS NULL and another detailed exercise with same name exists)
DELETE FROM exercises e1
WHERE e1.secondary_muscles IS NULL
  AND EXISTS (
    SELECT 1 FROM exercises e2
    WHERE UPPER(e2.name) = UPPER(e1.name)
      AND e2.id <> e1.id
      AND e2.secondary_muscles IS NOT NULL
);

-- 3. Backfill default rich values for any existing exercise record with NULL attributes
UPDATE exercises
SET secondary_muscles = CASE
    WHEN muscle_group = 'CHEST' THEN 'Triceps, Front Delts'
    WHEN muscle_group = 'BACK' THEN 'Biceps, Rear Delts, Core'
    WHEN muscle_group = 'SHOULDERS' THEN 'Triceps, Upper Traps'
    WHEN muscle_group = 'BICEPS' THEN 'Brachialis, Forearms'
    WHEN muscle_group = 'TRICEPS' THEN 'Forearms, Shoulders'
    WHEN muscle_group = 'FOREARMS' THEN 'Brachioradialis, Wrist Flexors'
    WHEN muscle_group = 'ABS' OR muscle_group = 'CORE' THEN 'Obliques, Lower Back, Hip Flexors'
    WHEN muscle_group = 'QUADS' THEN 'Glutes, Hamstrings'
    WHEN muscle_group = 'HAMSTRINGS' THEN 'Glutes, Lower Back'
    WHEN muscle_group = 'GLUTES' THEN 'Hamstrings, Lower Back'
    WHEN muscle_group = 'CALVES' THEN 'Ankles, Soleus'
    ELSE 'Core, Stabilizers'
END
WHERE secondary_muscles IS NULL;

UPDATE exercises SET equipment = 'Bodyweight' WHERE equipment IS NULL;
UPDATE exercises SET mechanics = 'COMPOUND' WHERE mechanics IS NULL;
UPDATE exercises SET difficulty_level = 'INTERMEDIATE' WHERE difficulty_level IS NULL;
UPDATE exercises SET recommended_sets = 4 WHERE recommended_sets IS NULL;
UPDATE exercises SET recommended_reps = '10-12' WHERE recommended_reps IS NULL;
UPDATE exercises SET rest_interval = '60s' WHERE rest_interval IS NULL;

UPDATE exercises SET execution_steps = CASE
    WHEN muscle_group = 'ABS' OR muscle_group = 'CORE' THEN '1. Position body carefully on mat or equipment aligning hips and spine.\n2. Inhale deeply and brace core abdominals prior to movement.\n3. Flex abdominal wall forcefully bringing ribcage toward pelvis under full control.'
    WHEN muscle_group = 'CHEST' THEN '1. Position body flat or on incline bench aligning chest with bar or handles.\n2. Inhale and brace core prior to pressing initiation.\n3. Press weight explosively while maintaining shoulder stabilization.'
    WHEN muscle_group = 'BACK' THEN '1. Grip weight or handle securely aligning shoulders with resistance vector.\n2. Inhale and pull weight toward midsection squeezing shoulder blades together.\n3. Lower weight under controlled eccentric stretch.'
    WHEN muscle_group = 'FOREARMS' THEN '1. Grip bar or dumbbell with wrists supported over bench edge.\n2. Flex or extend wrists through full smooth range of motion.\n3. Squeeze forearms tightly at peak contraction.'
    WHEN muscle_group = 'HAMSTRINGS' THEN '1. Hinge at hips keeping spine straight and knees slightly soft.\n2. Lower weight down shins until deep hamstring stretch is felt.\n3. Drive hips forward squeezing glutes and hamstrings to return upright.'
    WHEN muscle_group = 'GLUTES' THEN '1. Plant feet firmly and brace core prior to movement.\n2. Drive through heels extending hips fully toward ceiling.\n3. Squeeze glutes aggressively at peak extension before lowering.'
    WHEN muscle_group = 'CALVES' THEN '1. Position balls of feet on step or footplate with heels hanging off.\n2. Lower heels down into deep ankle stretch.\n3. Raise heels as high as possible squeezing calf muscles hard at top.'
    ELSE '1. Position body carefully aligning joints with resistance vector.\n2. Inhale and brace core prior to initiation.\n3. Execute movement under full muscular control with peak contraction.'
END
WHERE execution_steps IS NULL;

UPDATE exercises SET safety_tips = CASE
    WHEN muscle_group = 'ABS' OR muscle_group = 'CORE' THEN 'Maintain neutral spine alignment throughout repetition range. Avoid pulling on neck or swinging hips for momentum.'
    WHEN muscle_group = 'CHEST' THEN 'Keep shoulder blades retracted and feet flat on floor. Avoid flaring elbows out at 90 degrees.'
    WHEN muscle_group = 'BACK' THEN 'Do not round lower back during pulling or rowing movements. Keep core tight.'
    WHEN muscle_group = 'FOREARMS' THEN 'Perform movement smoothly without jerking wrists to prevent tendon strain.'
    WHEN muscle_group = 'HAMSTRINGS' THEN 'Do not flex lower back; maintain natural arch in lumbar spine throughout hinge.'
    WHEN muscle_group = 'GLUTES' THEN 'Avoid overextending lower back at top of movement; drive purely from hips.'
    WHEN muscle_group = 'CALVES' THEN 'Avoid bouncing at bottom of stretch to prevent Achilles tendon strain.'
    ELSE 'Maintain neutral spine alignment throughout repetition range. Avoid excessive momentum or swinging.'
END
WHERE safety_tips IS NULL;

-- 4. Insert rich seed exercises for FOREARMS (ensuring FOREARMS query returns full rich exercises)
INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, mechanics, difficulty_level, recommended_sets, recommended_reps, rest_interval, description, execution_steps, safety_tips, created_at)
VALUES
(
    'e3300001-0000-0000-0000-000000000001',
    'Palms-Up Barbell Wrist Curl',
    'FOREARMS',
    'Wrist Flexors, Brachioradialis',
    'Barbell',
    'ISOLATION',
    'BEGINNER',
    4, '15-20', '45s',
    'Primary wrist flexor isolation building lower arm thickness and grip strength.',
    '1. Sit on bench resting forearms on thighs with wrists hanging over knees holding barbell palms-up.\n2. Lower barbell letting it roll down fingers into deep stretch.\n3. Curl wrist upward squeezing flexor muscles at top.',
    'Perform movement under strict control without lifting elbows off thighs.',
    NOW()
),
(
    'e3300001-0000-0000-0000-000000000002',
    'Palms-Down Wrist Curl',
    'FOREARMS',
    'Wrist Extensors, Brachioradialis',
    'Barbell',
    'ISOLATION',
    'BEGINNER',
    4, '15-20', '45s',
    'Target wrist extensors building forearm top balance and lateral density.',
    '1. Rest forearms on bench holding barbell palms facing down.\n2. Lower bar down allowing wrists to extend downward.\n3. Raise bar upward flexing back of hand toward ceiling.',
    'Use moderate weight to avoid strain on wrist tendons.',
    NOW()
),
(
    'e3300001-0000-0000-0000-000000000003',
    'Heavy Dumbbell Farmers Walk',
    'FOREARMS',
    'Traps, Core, Full Grip',
    'Dumbbell',
    'COMPOUND',
    'INTERMEDIATE',
    4, '45s', '60s',
    'Functional loaded carry building crush grip endurance and forearm mass.',
    '1. Deadlift two heavy dumbbells to standing position.\n2. Stand tall with shoulders back and core engaged.\n3. Walk forward in straight line with controlled steps.',
    'Maintain tall posture and do not let dumbbells rest against legs.',
    NOW()
)
ON CONFLICT (id) DO NOTHING;
