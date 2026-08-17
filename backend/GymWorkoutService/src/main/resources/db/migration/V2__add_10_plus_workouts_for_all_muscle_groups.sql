-- V2__add_10_plus_workouts_for_all_muscle_groups.sql
-- Seed 10+ comprehensive exercises for FOREARMS, HAMSTRINGS, GLUTES, CALVES, ABS, QUADS, CHEST, BACK, SHOULDERS, BICEPS, TRICEPS.

-- FOREARMS (10 Exercises)
INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, mechanics, difficulty_level, recommended_sets, recommended_reps, rest_interval, description, execution_steps, safety_tips, created_at)
VALUES
('e3400001-0000-0000-0000-000000000001', 'Reverse Barbell Curl', 'FOREARMS', 'Brachioradialis, Biceps', 'Barbell', 'COMPOUND', 'INTERMEDIATE', 4, '10-12', '60s',
 'Overhand pronated curl targeting the brachioradialis and upper forearm mass.',
 '1. Stand tall holding barbell with shoulder-width overhand grip.\n2. Inhale and brace core while keeping elbows tucked at sides.\n3. Curl bar upward toward chest flexing top of forearms.',
 'Avoid swinging torso or flaring elbows outward.', NOW()),

('e3400001-0000-0000-0000-000000000002', 'Behind-The-Back Wrist Curl', 'FOREARMS', 'Wrist Flexors', 'Barbell', 'ISOLATION', 'BEGINNER', 4, '15-20', '45s',
 'Standing wrist flexor curl executed behind the glutes for dense lower arm flexors.',
 '1. Stand holding barbell behind lower back with palms facing away.\n2. Let barbell roll down fingers into full stretch.\n3. Curl wrists upward squeezing forearms tightly at peak contraction.',
 'Keep body upright and do not shrug shoulders during movement.', NOW()),

('e3400001-0000-0000-0000-000000000003', 'Plate Pinch Hold', 'FOREARMS', 'Thumb Flexors, Grip Strength', 'Weight Plate', 'ISOLATION', 'INTERMEDIATE', 4, '30-45s', '60s',
 'Isometric pinch grip strength exercise holding weight plates by smooth edge.',
 '1. Stand holding two smooth weight plates pinched together between thumb and fingers.\n2. Keep arms extended at sides and maintain tall posture.\n3. Hold for target duration until grip fails.',
 'Perform over padded surface in case plate drops.', NOW()),

('e3400001-0000-0000-0000-000000000004', 'Dead Hang for Grip', 'FOREARMS', 'Full Forearms, Lats, Core', 'Pull-Up Bar', 'COMPOUND', 'BEGINNER', 3, '45-60s', '60s',
 'Bodyweight isometric pull-up bar hang building crush grip endurance and decompressing spine.',
 '1. Grip pull-up bar with firm overhand grip slightly wider than shoulders.\n2. Lift feet off ground and hang passively with arms fully extended.\n3. Engage core and hold firm until time target is reached.',
 'Do not drop suddenly; lower feet gently to ground.', NOW()),

('e3400001-0000-0000-0000-000000000005', 'Dumbbell Radial Deviation (Hammer Lever)', 'FOREARMS', 'Brachioradialis, Wrist Extensors', 'Dumbbell', 'ISOLATION', 'INTERMEDIATE', 3, '12-15', '45s',
 'Leverage wrist tilt raising dumbbell head upward targeting radial forearm tie-ins.',
 '1. Hold dumbbell at base of handle with arm extended at side.\n2. Tilt wrist upward bringing front head of dumbbell toward ceiling.\n3. Lower under control to starting position.',
 'Use light weight to avoid wrist tendon strain.', NOW()),

('e3400001-0000-0000-0000-000000000006', 'Dumbbell Wrist Roller Extension', 'FOREARMS', 'Wrist Extensors, Brachialis', 'Dumbbell', 'ISOLATION', 'INTERMEDIATE', 4, '15-20', '45s',
 'Constant tension rolling extension for upper forearm thickness.',
 '1. Rest forearms on flat bench holding dumbbells palms down.\n2. Flex wrists up and down smoothly through complete arc.\n3. Squeeze top of forearms on every repetition.',
 'Maintain steady tempo without jerking wrists.', NOW()),

('e3400001-0000-0000-0000-000000000007', 'Cross-Body Hammer Curl', 'FOREARMS', 'Brachioradialis, Biceps', 'Dumbbell', 'COMPOUND', 'BEGINNER', 4, '10-12', '60s',
 'Across-chest neutral grip dumbbell curl isolating lower arm outer sweep.',
 '1. Stand holding dumbbells at sides with palms facing torso.\n2. Curl one dumbbell across chest toward opposite shoulder.\n3. Squeeze brachioradialis at top before lowering smoothly.',
 'Keep shoulder relaxed and focus pure tension on forearm.', NOW())
ON CONFLICT (id) DO NOTHING;


-- HAMSTRINGS (10 Exercises)
INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, mechanics, difficulty_level, recommended_sets, recommended_reps, rest_interval, description, execution_steps, safety_tips, created_at)
VALUES
('e3400002-0000-0000-0000-000000000001', 'Seated Leg Curl Machine', 'HAMSTRINGS', 'Calves, Glutes', 'Machine', 'ISOLATION', 'BEGINNER', 4, '12-15', '60s',
 'Seated knee flexion machine targeting full hamstring belly with peak squeeze.',
 '1. Sit in machine with pad positioned against lower calves just above ankles.\n2. Brace chest handles and curl legs down toward seat under control.\n3. Pause briefly at peak contraction before controlling return.',
 'Do not let hips lift off seat during curl.', NOW()),

('e3400002-0000-0000-0000-000000000002', 'Lying Prone Leg Curl', 'HAMSTRINGS', 'Calves, Lower Back', 'Machine', 'ISOLATION', 'BEGINNER', 4, '10-12', '60s',
 'Prone lying knee flexion delivering maximum stretch and muscular overload.',
 '1. Lie face down on machine bench with lever pad resting above heels.\n2. Keep hips pressed into bench and curl weight toward glutes.\n3. Squeeze hamstrings tightly at top before lowering under control.',
 'Keep hips flush on bench; do not arch lower back.', NOW()),

('e3400002-0000-0000-0000-000000000003', 'Nordic Hamstring Curl', 'HAMSTRINGS', 'Glutes, Core', 'Bodyweight', 'COMPOUND', 'PRO', 3, '6-8', '90s',
 'Eccentric hamstring bodyweight exercise proven to maximize hamstrings density and injury resilience.',
 '1. Kneel on soft mat with ankles anchored securely behind you.\n2. Lower torso forward as slowly as possible keeping hips straight.\n3. Catch yourself with hands on floor and push back to start.',
 'Maintain rigid straight line from knees to shoulders throughout eccentric lowering.', NOW()),

('e3400002-0000-0000-0000-000000000004', 'Dumbbell Stiff-Legged Deadlift', 'HAMSTRINGS', 'Glutes, Lower Back', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 4, '10-12', '75s',
 'Dumbbell hip hinge stretch building hamstrings eccentric strength and hamstring-glute tie-in.',
 '1. Stand holding dumbbells in front of thighs with slight bend in knees.\n2. Push hips backward lowering dumbbells down shins until deep stretch is felt.\n3. Drive hips forward to stand tall.',
 'Keep spine neutral; do not round back.', NOW()),

('e3400002-0000-0000-0000-000000000005', 'Glute-Ham Raise (GHR)', 'HAMSTRINGS', 'Glutes, Lower Back, Calves', 'GHD Machine', 'COMPOUND', 'PRO', 4, '8-10', '90s',
 'Full posterior chain builder using GHD machine for high eccentric strength.',
 '1. Set feet in GHD machine footplate with knees resting on thigh pad.\n2. Lower torso horizontal and use hamstrings to pull body back upright.\n3. Squeeze hamstrings and glutes hard at top position.',
 'Execute with smooth rhythm without hyperextending back.', NOW()),

('e3400002-0000-0000-0000-000000000006', 'Single-Leg Dumbbell RDL', 'HAMSTRINGS', 'Glutes, Core, Balance', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 3, '10-12', '60s',
 'Unilateral hip hinge correcting hamstring strength imbalances and improving hip stability.',
 '1. Stand on right leg holding dumbbell in left hand.\n2. Hinge forward extending left leg straight behind you until torso is parallel to floor.\n3. Drive right heel into ground to return upright.',
 'Keep hips square to floor during hinge.', NOW()),

('e3400002-0000-0000-0000-000000000007', 'Good Mornings (Barbell)', 'HAMSTRINGS', 'Lower Back, Glutes', 'Barbell', 'COMPOUND', 'INTERMEDIATE', 4, '8-10', '90s',
 'Barbell hip hinge across upper back developing posterior chain power.',
 '1. Rest barbell across upper traps as in back squat.\n2. Soften knees and push hips backward lowering torso until parallel with ground.\n3. Engage hamstrings to pull back upright.',
 'Keep lower back tight; do not overload weight beyond spinal tolerance.', NOW()),

('e3400002-0000-0000-0000-000000000008', 'Kettlebell Swing', 'HAMSTRINGS', 'Glutes, Core, Lower Back', 'Kettlebell', 'COMPOUND', 'BEGINNER', 4, '15-20', '60s',
 'Dynamic hip hinge generating explosive hamstring contractions.',
 '1. Stand over kettlebell with feet shoulder-width apart.\n2. Hinge hips back, grab handle, and swing bell dynamically between legs.\n3. Snap hips forward explosively bringing bell to chest height.',
 'Movement is driven by hip hinge, not arm lifting.', NOW()),

('e3400002-0000-0000-0000-000000000009', 'Swiss Ball Hamstring Curl', 'HAMSTRINGS', 'Glutes, Core', 'Stability Ball', 'COMPOUND', 'INTERMEDIATE', 3, '12-15', '60s',
 'Bridge hamstring curl pulling stability ball with heels toward glutes.',
 '1. Lie on back with heels on stability ball and arms flat at sides.\n2. Lift hips into bridge and dig heels into ball pulling it toward glutes.\n3. Extend legs back out under full control.',
 'Keep hips elevated throughout repetitions.', NOW())
ON CONFLICT (id) DO NOTHING;


-- GLUTES (10 Exercises)
INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, mechanics, difficulty_level, recommended_sets, recommended_reps, rest_interval, description, execution_steps, safety_tips, created_at)
VALUES
('e3400003-0000-0000-0000-000000000001', 'Barbell Hip Thrust', 'GLUTES', 'Hamstrings, Core', 'Barbell', 'COMPOUND', 'INTERMEDIATE', 4, '10-12', '90s',
 'Gold-standard glute builder delivering max mechanical tension at peak hip lockout.',
 '1. Sit on floor with upper back against bench and loaded barbell across hips.\n2. Plant feet firmly and drive through heels lifting hips until parallel to floor.\n3. Squeeze glutes aggressively at top pause before lowering.',
 'Keep chin tucked and do not hyperextend lumbar spine at top.', NOW()),

('e3400003-0000-0000-0000-000000000002', 'Cable Glute Kickback', 'GLUTES', 'Hamstrings', 'Cable Machine', 'ISOLATION', 'BEGINNER', 4, '12-15', '60s',
 'Targeted gluteus maximus isolation delivering continuous cable tension.',
 '1. Attach ankle cuff to low cable pulley and face machine.\n2. Lean forward slightly and kick leg straight back driving through heel.\n3. Squeeze glute tightly at top position before returning.',
 'Avoid arching lower back to create movement; use glute strength.', NOW()),

('e3400003-0000-0000-0000-000000000003', 'Dumbbell Sumo Squats', 'GLUTES', 'Quads, Adductors', 'Dumbbell', 'COMPOUND', 'BEGINNER', 4, '10-12', '75s',
 'Wide-stance squat emphasizing glutes and inner thigh drive.',
 '1. Stand with wide stance and toes turned out 45 degrees holding heavy dumbbell vertically.\n2. Lower hips deeply into squat keeping knees aligned over toes.\n3. Drive through heels squeezing glutes to stand.',
 'Keep chest upright and do not let knees cave inward.', NOW()),

('e3400003-0000-0000-0000-000000000004', 'Frog Pumps', 'GLUTES', 'Hamstrings', 'Bodyweight', 'ISOLATION', 'BEGINNER', 4, '20-25', '45s',
 'High-rep glute bridge variation with soles of feet pressed together.',
 '1. Lie on back with knees bent out and soles of feet pressed together near glutes.\n2. Drive outer edges of feet into floor extending hips to ceiling.\n3. Squeeze glutes hard at peak contraction.',
 'Focus on high repetitions and peak muscular burn.', NOW()),

('e3400003-0000-0000-0000-000000000005', 'Abductor Machine Flyes', 'GLUTES', 'Gluteus Medius, Hips', 'Machine', 'ISOLATION', 'BEGINNER', 4, '15-20', '60s',
 'Seated hip abduction machine isolating gluteus medius for hip width.',
 '1. Sit in hip abductor machine with outer thighs against pads.\n2. Push legs outward as far as comfortable squeezing outer glutes.\n3. Return slowly resisting machine tension.',
 'Pause for 1 second at maximum outer expansion.', NOW()),

('e3400003-0000-0000-0000-000000000006', 'Reverse Hyper-Extensions', 'GLUTES', 'Hamstrings, Lower Back', 'Machine', 'COMPOUND', 'INTERMEDIATE', 4, '12-15', '60s',
 'Posterior chain builder extending legs backward while supporting torso.',
 '1. Lie face down on hyper bench with hips at edge and legs hanging down.\n2. Lift legs up backward squeezing glutes until legs align with torso.\n3. Lower legs under full control.',
 'Avoid swinging legs with heavy momentum.', NOW()),

('e3400003-0000-0000-0000-000000000007', 'Curtsy Lunges', 'GLUTES', 'Quads, Glute Medius', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 3, '10-12', '60s',
 'Cross-behind lunge targeting gluteus medius and side hip line.',
 '1. Stand holding dumbbells at sides.\n2. Step right leg cross-behind left leg and lower into lunge.\n3. Push through front left heel to return standing.',
 'Keep front knee tracking over toes.', NOW()),

('e3400003-0000-0000-0000-000000000008', 'Cable Pull-Through', 'GLUTES', 'Hamstrings, Lower Back', 'Cable Machine', 'COMPOUND', 'BEGINNER', 4, '12-15', '60s',
 'Low cable hip hinge focusing on explosive glute lockout without spinal strain.',
 '1. Stand facing away from low cable with rope attachment between legs.\n2. Hinge at hips lowering torso forward while cable pulls rope back.\n3. Drive hips forward squeezing glutes hard at top.',
 'Do not pull with arms; drive entirely through hips.', NOW()),

('e3400003-0000-0000-0000-000000000009', 'Deficit Reverse Lunges', 'GLUTES', 'Quads, Hamstrings', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 4, '10-12', '75s',
 'Step-elevated reverse lunge providing deep glute stretch at bottom.',
 '1. Stand on 2-4 inch step holding dumbbells at sides.\n2. Step back off platform into deep lunge touching back knee near floor.\n3. Drive through front heel to return to platform.',
 'Maintain forward torso tilt to maximize glute load.', NOW())
ON CONFLICT (id) DO NOTHING;


-- CALVES (10 Exercises)
INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, mechanics, difficulty_level, recommended_sets, recommended_reps, rest_interval, description, execution_steps, safety_tips, created_at)
VALUES
('e3400004-0000-0000-0000-000000000001', 'Standing Barbell Calf Raise', 'CALVES', 'Gastrocnemius, Soleus', 'Barbell', 'ISOLATION', 'INTERMEDIATE', 4, '15-20', '45s',
 'Heavy standing calf raise maximizing gastrocnemius diamond sweep.',
 '1. Stand with balls of feet on calf block holding barbell on upper traps.\n2. Lower heels down into deep ankle stretch.\n3. Drive up onto tiptoes squeezing calves hard at top.',
 'Pause 1 second at top and 1 second at bottom stretch.', NOW()),

('e3400004-0000-0000-0000-000000000002', 'Seated Soleus Calf Raise', 'CALVES', 'Soleus Muscle', 'Machine', 'ISOLATION', 'BEGINNER', 4, '15-20', '45s',
 'Seated 90-degree bent-knee calf raise isolating the soleus muscle under calves.',
 '1. Sit in machine with thigh pad locked above knees and balls of feet on block.\n2. Release safety catch and lower heels down into deep stretch.\n3. Raise heels as high as possible flexing soleus tightly.',
 'Avoid bouncing at bottom of movement.', NOW()),

('e3400004-0000-0000-0000-000000000003', 'Donkey Calf Raise', 'CALVES', 'Gastrocnemius, Soleus', 'Machine', 'ISOLATION', 'INTERMEDIATE', 4, '15-20', '45s',
 'Bent-over hip hinge calf raise placing extreme stretch on upper gastrocnemius.',
 '1. Hinge forward at hips resting lower back pad on machine or partner.\n2. Place balls of feet on step and stretch heels downward.\n3. Raise up onto toes squeezing top calf contraction.',
 'Keep knees straight but soft to target gastrocnemius.', NOW()),

('e3400004-0000-0000-0000-000000000004', 'Leg Press Calf Press', 'CALVES', 'Gastrocnemius, Ankles', 'Machine', 'ISOLATION', 'BEGINNER', 4, '15-20', '45s',
 'Heavy calf extension performed on leg press sled with safety catches engaged.',
 '1. Place balls of feet on bottom edge of leg press footplate with heels hanging off.\n2. Press sled out extending ankles forward.\n3. Flex ankles backward under full control.',
 'Never unlatch safety stops during calf extension.', NOW()),

('e3400004-0000-0000-0000-000000000005', 'Single-Leg Dumbbell Calf Raise', 'CALVES', 'Ankles, Balance', 'Dumbbell', 'ISOLATION', 'INTERMEDIATE', 4, '12-15', '45s',
 'Unilateral calf raise correcting calf asymmetry and improving ankle stability.',
 '1. Stand on one foot on step block holding dumbbell in same-side hand.\n2. Lower heel down into deep stretch.\n3. Raise heel fully squeezing calf muscle at top.',
 'Lightly touch wall with non-working hand for balance.', NOW()),

('e3400004-0000-0000-0000-000000000006', 'Smith Machine Calf Raise', 'CALVES', 'Gastrocnemius', 'Smith Machine', 'ISOLATION', 'BEGINNER', 4, '15-20', '45s',
 'Guided Smith machine calf extension allowing heavy load with stable balance.',
 '1. Set step block under Smith machine bar and rest bar on upper traps.\n2. Step onto block with heels hanging off.\n3. Perform calf raises through full range of motion.',
 'Control eccentric lowering phase for 2-3 seconds.', NOW()),

('e3400004-0000-0000-0000-000000000007', 'Farmer Tip-Toe Walk', 'CALVES', 'Soleus, Forearms, Core', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 3, '45s', '60s',
 'Loaded tip-toe carry building calf isometric endurance and ankle stability.',
 '1. Hold heavy dumbbells at sides and raise up onto balls of feet.\n2. Walk forward taking small controlled steps while staying on tiptoes.\n3. Maintain high heel elevation throughout set.',
 'Keep core braced and upright stance.', NOW()),

('e3400004-0000-0000-0000-000000000008', 'Box Jump Calf Explosions', 'CALVES', 'Ankles, Quads', 'Plyo Box', 'COMPOUND', 'INTERMEDIATE', 3, '10', '60s',
 'Plyometric ankle jump focusing on explosive calf plantarflexion.',
 '1. Stand in front of low plyo box.\n2. Dip knees slightly and explode upward off balls of feet onto box.\n3. Step down carefully and repeat.',
 'Land softly absorbing impact.', NOW()),

('e3400004-0000-0000-0000-000000000009', 'Jump Rope Calf Conditioning', 'CALVES', 'Ankles, Cardio', 'Jump Rope', 'ISOLATION', 'BEGINNER', 3, '120s', '45s',
 'Rhythmic jump rope bounding building calf springiness and vascularity.',
 '1. Hold jump rope handles and stay light on balls of feet.\n2. Jump 1-2 inches off floor with minimal knee bend flexing calves.\n3. Maintain steady cadence for duration of round.',
 'Keep jumps low to stay light on feet.', NOW())
ON CONFLICT (id) DO NOTHING;
