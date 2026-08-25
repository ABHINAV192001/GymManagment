package com.gymbross.workout.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WorkoutDataInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking and backfilling missing exercise details in GymWorkoutService...");
        try {
            // 1. Standardize muscle_group names to UPPERCASE
            jdbcTemplate.execute("UPDATE exercises SET muscle_group = UPPER(muscle_group) WHERE muscle_group IS NOT NULL;");

            // 2. Clean up incomplete duplicate records where secondary_muscles IS NULL and another detailed exercise exists
            jdbcTemplate.execute("""
                DELETE FROM exercises e1
                WHERE e1.secondary_muscles IS NULL
                  AND EXISTS (
                    SELECT 1 FROM exercises e2
                    WHERE UPPER(e2.name) = UPPER(e1.name)
                      AND e2.id <> e1.id
                      AND e2.secondary_muscles IS NOT NULL
                );
            """);

            // 3. Backfill missing attributes
            jdbcTemplate.execute("""
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
            """);

            jdbcTemplate.execute("UPDATE exercises SET equipment = 'Bodyweight' WHERE equipment IS NULL;");
            jdbcTemplate.execute("UPDATE exercises SET mechanics = 'COMPOUND' WHERE mechanics IS NULL;");
            jdbcTemplate.execute("UPDATE exercises SET difficulty_level = 'INTERMEDIATE' WHERE difficulty_level IS NULL;");
            jdbcTemplate.execute("UPDATE exercises SET recommended_sets = 4 WHERE recommended_sets IS NULL;");
            jdbcTemplate.execute("UPDATE exercises SET recommended_reps = '10-12' WHERE recommended_reps IS NULL;");
            jdbcTemplate.execute("UPDATE exercises SET rest_interval = '60s' WHERE rest_interval IS NULL;");

            jdbcTemplate.execute("""
                UPDATE exercises SET execution_steps = CASE
                    WHEN muscle_group = 'ABS' OR muscle_group = 'CORE' THEN '1. Position body carefully on mat or equipment aligning hips and spine.\\n2. Inhale deeply and brace core abdominals prior to movement.\\n3. Flex abdominal wall forcefully bringing ribcage toward pelvis under full control.'
                    WHEN muscle_group = 'CHEST' THEN '1. Position body flat or on incline bench aligning chest with bar or handles.\\n2. Inhale and brace core prior to pressing initiation.\\n3. Press weight explosively while maintaining shoulder stabilization.'
                    WHEN muscle_group = 'BACK' THEN '1. Grip weight or handle securely aligning shoulders with resistance vector.\\n2. Inhale and pull weight toward midsection squeezing shoulder blades together.\\n3. Lower weight under controlled eccentric stretch.'
                    WHEN muscle_group = 'FOREARMS' THEN '1. Grip bar or dumbbell with wrists supported over bench edge.\\n2. Flex or extend wrists through full smooth range of motion.\\n3. Squeeze forearms tightly at peak contraction.'
                    WHEN muscle_group = 'HAMSTRINGS' THEN '1. Hinge at hips keeping spine straight and knees slightly soft.\\n2. Lower weight down shins until deep hamstring stretch is felt.\\n3. Drive hips forward squeezing glutes and hamstrings to return upright.'
                    WHEN muscle_group = 'GLUTES' THEN '1. Plant feet firmly and brace core prior to movement.\\n2. Drive through heels extending hips fully toward ceiling.\\n3. Squeeze glutes aggressively at peak extension before lowering.'
                    WHEN muscle_group = 'CALVES' THEN '1. Position balls of feet on step or footplate with heels hanging off.\\n2. Lower heels down into deep ankle stretch.\\n3. Raise heels as high as possible squeezing calf muscles hard at top.'
                    ELSE '1. Position body carefully aligning joints with resistance vector.\\n2. Inhale and brace core prior to initiation.\\n3. Execute movement under full muscular control with peak contraction.'
                END
                WHERE execution_steps IS NULL;
            """);

            jdbcTemplate.execute("""
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
            """);

            // 4. Ensure FOREARMS seed exercises exist
            jdbcTemplate.execute("""
                INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, mechanics, difficulty_level, recommended_sets, recommended_reps, rest_interval, description, execution_steps, safety_tips, created_at)
                VALUES
                ('e3300001-0000-0000-0000-000000000001', 'Palms-Up Barbell Wrist Curl', 'FOREARMS', 'Wrist Flexors, Brachioradialis', 'Barbell', 'ISOLATION', 'BEGINNER', 4, '15-20', '45s', 'Primary wrist flexor isolation building lower arm thickness and grip strength.', '1. Sit on bench resting forearms on thighs with wrists hanging over knees holding barbell palms-up.\\n2. Lower barbell letting it roll down fingers into deep stretch.\\n3. Curl wrist upward squeezing flexor muscles at top.', 'Perform movement under strict control without lifting elbows off thighs.', NOW()),
                ('e3300001-0000-0000-0000-000000000002', 'Palms-Down Wrist Curl', 'FOREARMS', 'Wrist Extensors, Brachioradialis', 'Barbell', 'ISOLATION', 'BEGINNER', 4, '15-20', '45s', 'Target wrist extensors building forearm top balance and lateral density.', '1. Rest forearms on bench holding barbell palms facing down.\\n2. Lower bar down allowing wrists to extend downward.\\n3. Raise bar upward flexing back of hand toward ceiling.', 'Use moderate weight to avoid strain on wrist tendons.', NOW()),
                ('e3300001-0000-0000-0000-000000000003', 'Heavy Dumbbell Farmers Walk', 'FOREARMS', 'Traps, Core, Full Grip', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 4, '45s', '60s', 'Functional loaded carry building crush grip endurance and forearm mass.', '1. Deadlift two heavy dumbbells to standing position.\\n2. Stand tall with shoulders back and core engaged.\\n3. Walk forward in straight line with controlled steps.', 'Maintain tall posture and do not let dumbbells rest against legs.', NOW()),
                ('e3400001-0000-0000-0000-000000000001', 'Reverse Barbell Curl', 'FOREARMS', 'Brachioradialis, Biceps', 'Barbell', 'COMPOUND', 'INTERMEDIATE', 4, '10-12', '60s', 'Overhand pronated curl targeting the brachioradialis and upper forearm mass.', '1. Stand tall holding barbell with shoulder-width overhand grip.\\n2. Inhale and brace core while keeping elbows tucked at sides.\\n3. Curl bar upward toward chest flexing top of forearms.', 'Avoid swinging torso or flaring elbows outward.', NOW()),
                ('e3400001-0000-0000-0000-000000000002', 'Behind-The-Back Wrist Curl', 'FOREARMS', 'Wrist Flexors', 'Barbell', 'ISOLATION', 'BEGINNER', 4, '15-20', '45s', 'Standing wrist flexor curl executed behind the glutes for dense lower arm flexors.', '1. Stand holding barbell behind lower back with palms facing away.\\n2. Let barbell roll down fingers into full stretch.\\n3. Curl wrists upward squeezing forearms tightly at peak contraction.', 'Keep body upright and do not shrug shoulders during movement.', NOW()),
                ('e3400001-0000-0000-0000-000000000003', 'Plate Pinch Hold', 'FOREARMS', 'Thumb Flexors, Grip Strength', 'Weight Plate', 'ISOLATION', 'INTERMEDIATE', 4, '30-45s', '60s', 'Isometric pinch grip strength exercise holding weight plates by smooth edge.', '1. Stand holding two smooth weight plates pinched together between thumb and fingers.\\n2. Keep arms extended at sides and maintain tall posture.\\n3. Hold for target duration until grip fails.', 'Perform over padded surface in case plate drops.', NOW()),
                ('e3400001-0000-0000-0000-000000000004', 'Dead Hang for Grip', 'FOREARMS', 'Full Forearms, Lats, Core', 'Pull-Up Bar', 'COMPOUND', 'BEGINNER', 3, '45-60s', '60s', 'Bodyweight isometric pull-up bar hang building crush grip endurance and decompressing spine.', '1. Grip pull-up bar with firm overhand grip slightly wider than shoulders.\\n2. Lift feet off ground and hang passively with arms fully extended.\\n3. Engage core and hold firm until time target is reached.', 'Do not drop suddenly; lower feet gently to ground.', NOW()),
                ('e3400001-0000-0000-0000-000000000005', 'Dumbbell Radial Deviation', 'FOREARMS', 'Brachioradialis, Wrist Extensors', 'Dumbbell', 'ISOLATION', 'INTERMEDIATE', 3, '12-15', '45s', 'Leverage wrist tilt raising dumbbell head upward targeting radial forearm tie-ins.', '1. Hold dumbbell at base of handle with arm extended at side.\\n2. Tilt wrist upward bringing front head of dumbbell toward ceiling.\\n3. Lower under control to starting position.', 'Use light weight to avoid wrist tendon strain.', NOW()),
                ('e3400001-0000-0000-0000-000000000006', 'Dumbbell Wrist Roller Extension', 'FOREARMS', 'Wrist Extensors, Brachialis', 'Dumbbell', 'ISOLATION', 'INTERMEDIATE', 4, '15-20', '45s', 'Constant tension rolling extension for upper forearm thickness.', '1. Rest forearms on flat bench holding dumbbells palms down.\\n2. Flex wrists up and down smoothly through complete arc.\\n3. Squeeze top of forearms on every repetition.', 'Maintain steady tempo without jerking wrists.', NOW()),
                ('e3400001-0000-0000-0000-000000000007', 'Cross-Body Hammer Curl', 'FOREARMS', 'Brachioradialis, Biceps', 'Dumbbell', 'COMPOUND', 'BEGINNER', 4, '10-12', '60s', 'Across-chest neutral grip dumbbell curl isolating lower arm outer sweep.', '1. Stand holding dumbbells at sides with palms facing torso.\\n2. Curl one dumbbell across chest toward opposite shoulder.\\n3. Squeeze brachioradialis at top before lowering smoothly.', 'Keep shoulder relaxed and focus pure tension on forearm.', NOW())
                ON CONFLICT (id) DO NOTHING;
            """);

            // 5. Ensure HAMSTRINGS seed exercises exist
            jdbcTemplate.execute("""
                INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, mechanics, difficulty_level, recommended_sets, recommended_reps, rest_interval, description, execution_steps, safety_tips, created_at)
                VALUES
                ('e3400002-0000-0000-0000-000000000001', 'Seated Leg Curl Machine', 'HAMSTRINGS', 'Calves, Glutes', 'Machine', 'ISOLATION', 'BEGINNER', 4, '12-15', '60s', 'Seated knee flexion machine targeting full hamstring belly with peak squeeze.', '1. Sit in machine with pad positioned against lower calves just above ankles.\\n2. Brace chest handles and curl legs down toward seat under control.\\n3. Pause briefly at peak contraction before controlling return.', 'Do not let hips lift off seat during curl.', NOW()),
                ('e3400002-0000-0000-0000-000000000002', 'Lying Prone Leg Curl', 'HAMSTRINGS', 'Calves, Lower Back', 'Machine', 'ISOLATION', 'BEGINNER', 4, '10-12', '60s', 'Prone lying knee flexion delivering maximum stretch and muscular overload.', '1. Lie face down on machine bench with lever pad resting above heels.\\n2. Keep hips pressed into bench and curl weight toward glutes.\\n3. Squeeze hamstrings tightly at top before lowering under control.', 'Keep hips flush on bench; do not arch lower back.', NOW()),
                ('e3400002-0000-0000-0000-000000000003', 'Nordic Hamstring Curl', 'HAMSTRINGS', 'Glutes, Core', 'Bodyweight', 'COMPOUND', 'PRO', 3, '6-8', '90s', 'Eccentric hamstring bodyweight exercise proven to maximize hamstrings density and injury resilience.', '1. Kneel on soft mat with ankles anchored securely behind you.\\n2. Lower torso forward as slowly as possible keeping hips straight.\\n3. Catch yourself with hands on floor and push back to start.', 'Maintain rigid straight line from knees to shoulders throughout eccentric lowering.', NOW()),
                ('e3400002-0000-0000-0000-000000000004', 'Dumbbell Stiff-Legged Deadlift', 'HAMSTRINGS', 'Glutes, Lower Back', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 4, '10-12', '75s', 'Dumbbell hip hinge stretch building hamstrings eccentric strength and hamstring-glute tie-in.', '1. Stand holding dumbbells in front of thighs with slight bend in knees.\\n2. Push hips backward lowering dumbbells down shins until deep stretch is felt.\\n3. Drive hips forward to stand tall.', 'Keep spine neutral; do not round back.', NOW()),
                ('e3400002-0000-0000-0000-000000000005', 'Glute-Ham Raise (GHR)', 'HAMSTRINGS', 'Glutes, Lower Back, Calves', 'GHD Machine', 'COMPOUND', 'PRO', 4, '8-10', '90s', 'Full posterior chain builder using GHD machine for high eccentric strength.', '1. Set feet in GHD machine footplate with knees resting on thigh pad.\\n2. Lower torso horizontal and use hamstrings to pull body back upright.\\n3. Squeeze hamstrings and glutes hard at top position.', 'Execute with smooth rhythm without hyperextending back.', NOW()),
                ('e3400002-0000-0000-0000-000000000006', 'Single-Leg Dumbbell RDL', 'HAMSTRINGS', 'Glutes, Core, Balance', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 3, '10-12', '60s', 'Unilateral hip hinge correcting hamstring strength imbalances and improving hip stability.', '1. Stand on right leg holding dumbbell in left hand.\\n2. Hinge forward extending left leg straight behind you until torso is parallel to floor.\\n3. Drive right heel into ground to return upright.', 'Keep hips square to floor during hinge.', NOW()),
                ('e3400002-0000-0000-0000-000000000007', 'Good Mornings (Barbell)', 'HAMSTRINGS', 'Lower Back, Glutes', 'Barbell', 'COMPOUND', 'INTERMEDIATE', 4, '8-10', '90s', 'Barbell hip hinge across upper back developing posterior chain power.', '1. Rest barbell across upper traps as in back squat.\\n2. Soften knees and push hips backward lowering torso until parallel with ground.\\n3. Engage hamstrings to pull back upright.', 'Keep lower back tight; do not overload weight beyond spinal tolerance.', NOW()),
                ('e3400002-0000-0000-0000-000000000008', 'Kettlebell Swing', 'HAMSTRINGS', 'Glutes, Core, Lower Back', 'Kettlebell', 'COMPOUND', 'BEGINNER', 4, '15-20', '60s', 'Dynamic hip hinge generating explosive hamstring contractions.', '1. Stand over kettlebell with feet shoulder-width apart.\\n2. Hinge hips back, grab handle, and swing bell dynamically between legs.\\n3. Snap hips forward explosively bringing bell to chest height.', 'Movement is driven by hip hinge, not arm lifting.', NOW()),
                ('e3400002-0000-0000-0000-000000000009', 'Swiss Ball Hamstring Curl', 'HAMSTRINGS', 'Glutes, Core', 'Stability Ball', 'COMPOUND', 'INTERMEDIATE', 3, '12-15', '60s', 'Bridge hamstring curl pulling stability ball with heels toward glutes.', '1. Lie on back with heels on stability ball and arms flat at sides.\\n2. Lift hips into bridge and dig heels into ball pulling it toward glutes.\\n3. Extend legs back out under full control.', 'Keep hips elevated throughout repetitions.', NOW())
                ON CONFLICT (id) DO NOTHING;
            """);

            // 6. Ensure GLUTES seed exercises exist
            jdbcTemplate.execute("""
                INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, mechanics, difficulty_level, recommended_sets, recommended_reps, rest_interval, description, execution_steps, safety_tips, created_at)
                VALUES
                ('e3400003-0000-0000-0000-000000000001', 'Barbell Hip Thrust', 'GLUTES', 'Hamstrings, Core', 'Barbell', 'COMPOUND', 'INTERMEDIATE', 4, '10-12', '90s', 'Gold-standard glute builder delivering max mechanical tension at peak hip lockout.', '1. Sit on floor with upper back against bench and loaded barbell across hips.\\n2. Plant feet firmly and drive through heels lifting hips until parallel to floor.\\n3. Squeeze glutes aggressively at top pause before lowering.', 'Keep chin tucked and do not hyperextend lumbar spine at top.', NOW()),
                ('e3400003-0000-0000-0000-000000000002', 'Cable Glute Kickback', 'GLUTES', 'Hamstrings', 'Cable Machine', 'ISOLATION', 'BEGINNER', 4, '12-15', '60s', 'Targeted gluteus maximus isolation delivering continuous cable tension.', '1. Attach ankle cuff to low cable pulley and face machine.\\n2. Lean forward slightly and kick leg straight back driving through heel.\\n3. Squeeze glute tightly at top position before returning.', 'Avoid arching lower back to create movement; use glute strength.', NOW()),
                ('e3400003-0000-0000-0000-000000000003', 'Dumbbell Sumo Squats', 'GLUTES', 'Quads, Adductors', 'Dumbbell', 'COMPOUND', 'BEGINNER', 4, '10-12', '75s', 'Wide-stance squat emphasizing glutes and inner thigh drive.', '1. Stand with wide stance and toes turned out 45 degrees holding heavy dumbbell vertically.\\n2. Lower hips deeply into squat keeping knees aligned over toes.\\n3. Drive through heels squeezing glutes to stand.', 'Keep chest upright and do not let knees cave inward.', NOW()),
                ('e3400003-0000-0000-0000-000000000004', 'Frog Pumps', 'GLUTES', 'Hamstrings', 'Bodyweight', 'ISOLATION', 'BEGINNER', 4, '20-25', '45s', 'High-rep glute bridge variation with soles of feet pressed together.', '1. Lie on back with knees bent out and soles of feet pressed together near glutes.\\n2. Drive outer edges of feet into floor extending hips to ceiling.\\n3. Squeeze glutes hard at peak contraction.', 'Focus on high repetitions and peak muscular burn.', NOW()),
                ('e3400003-0000-0000-0000-000000000005', 'Abductor Machine Flyes', 'GLUTES', 'Gluteus Medius, Hips', 'Machine', 'ISOLATION', 'BEGINNER', 4, '15-20', '60s', 'Seated hip abduction machine isolating gluteus medius for hip width.', '1. Sit in hip abductor machine with outer thighs against pads.\\n2. Push legs outward as far as comfortable squeezing outer glutes.\\n3. Return slowly resisting machine tension.', 'Pause for 1 second at maximum outer expansion.', NOW()),
                ('e3400003-0000-0000-0000-000000000006', 'Reverse Hyper-Extensions', 'GLUTES', 'Hamstrings, Lower Back', 'Machine', 'COMPOUND', 'INTERMEDIATE', 4, '12-15', '60s', 'Posterior chain builder extending legs backward while supporting torso.', '1. Lie face down on hyper bench with hips at edge and legs hanging down.\\n2. Lift legs up backward squeezing glutes until legs align with torso.\\n3. Lower legs under full control.', 'Avoid swinging legs with heavy momentum.', NOW()),
                ('e3400003-0000-0000-0000-000000000007', 'Curtsy Lunges', 'GLUTES', 'Quads, Glute Medius', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 3, '10-12', '60s', 'Cross-behind lunge targeting gluteus medius and side hip line.', '1. Stand holding dumbbells at sides.\\n2. Step right leg cross-behind left leg and lower into lunge.\\n3. Push through front left heel to return standing.', 'Keep front knee tracking over toes.', NOW()),
                ('e3400003-0000-0000-0000-000000000008', 'Cable Pull-Through', 'GLUTES', 'Hamstrings, Lower Back', 'Cable Machine', 'COMPOUND', 'BEGINNER', 4, '12-15', '60s', 'Low cable hip hinge focusing on explosive glute lockout without spinal strain.', '1. Stand facing away from low cable with rope attachment between legs.\\n2. Hinge at hips lowering torso forward while cable pulls rope back.\\n3. Drive hips forward squeezing glutes hard at top.', 'Do not pull with arms; drive entirely through hips.', NOW()),
                ('e3400003-0000-0000-0000-000000000009', 'Deficit Reverse Lunges', 'GLUTES', 'Quads, Hamstrings', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 4, '10-12', '75s', 'Step-elevated reverse lunge providing deep glute stretch at bottom.', '1. Stand on 2-4 inch step holding dumbbells at sides.\\n2. Step back off platform into deep lunge touching back knee near floor.\\n3. Drive through front heel to return to platform.', 'Maintain forward torso tilt to maximize glute load.', NOW())
                ON CONFLICT (id) DO NOTHING;
            """);

            // 7. Ensure CALVES seed exercises exist
            jdbcTemplate.execute("""
                INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, mechanics, difficulty_level, recommended_sets, recommended_reps, rest_interval, description, execution_steps, safety_tips, created_at)
                VALUES
                ('e3400004-0000-0000-0000-000000000001', 'Standing Barbell Calf Raise', 'CALVES', 'Gastrocnemius, Soleus', 'Barbell', 'ISOLATION', 'INTERMEDIATE', 4, '15-20', '45s', 'Heavy standing calf raise maximizing gastrocnemius diamond sweep.', '1. Stand with balls of feet on calf block holding barbell on upper traps.\\n2. Lower heels down into deep ankle stretch.\\n3. Drive up onto tiptoes squeezing calves hard at top.', 'Pause 1 second at top and 1 second at bottom stretch.', NOW()),
                ('e3400004-0000-0000-0000-000000000002', 'Seated Soleus Calf Raise', 'CALVES', 'Soleus Muscle', 'Machine', 'ISOLATION', 'BEGINNER', 4, '15-20', '45s', 'Seated 90-degree bent-knee calf raise isolating the soleus muscle under calves.', '1. Sit in machine with thigh pad locked above knees and balls of feet on block.\\n2. Release safety catch and lower heels down into deep stretch.\\n3. Raise heels as high as possible flexing soleus tightly.', 'Avoid bouncing at bottom of movement.', NOW()),
                ('e3400004-0000-0000-0000-000000000003', 'Donkey Calf Raise', 'CALVES', 'Gastrocnemius, Soleus', 'Machine', 'ISOLATION', 'INTERMEDIATE', 4, '15-20', '45s', 'Bent-over hip hinge calf raise placing extreme stretch on upper gastrocnemius.', '1. Hinge forward at hips resting lower back pad on machine or partner.\\n2. Place balls of feet on step and stretch heels downward.\\n3. Raise up onto toes squeezing top calf contraction.', 'Keep knees straight but soft to target gastrocnemius.', NOW()),
                ('e3400004-0000-0000-0000-000000000004', 'Leg Press Calf Press', 'CALVES', 'Gastrocnemius, Ankles', 'Machine', 'ISOLATION', 'BEGINNER', 4, '15-20', '45s', 'Heavy calf extension performed on leg press sled with safety catches engaged.', '1. Place balls of feet on bottom edge of leg press footplate with heels hanging off.\\n2. Press sled out extending ankles forward.\\n3. Flex ankles backward under full control.', 'Never unlatch safety stops during calf extension.', NOW()),
                ('e3400004-0000-0000-0000-000000000005', 'Single-Leg Dumbbell Calf Raise', 'CALVES', 'Ankles, Balance', 'Dumbbell', 'ISOLATION', 'INTERMEDIATE', 4, '12-15', '45s', 'Unilateral calf raise correcting calf asymmetry and improving ankle stability.', '1. Stand on one foot on step block holding dumbbell in same-side hand.\\n2. Lower heel down into deep stretch.\\n3. Raise heel fully squeezing calf muscle at top.', 'Lightly touch wall with non-working hand for balance.', NOW()),
                ('e3400004-0000-0000-0000-000000000006', 'Smith Machine Calf Raise', 'CALVES', 'Gastrocnemius', 'Smith Machine', 'ISOLATION', 'BEGINNER', 4, '15-20', '45s', 'Guided Smith machine calf extension allowing heavy load with stable balance.', '1. Set step block under Smith machine bar and rest bar on upper traps.\\n2. Step onto block with heels hanging off.\\n3. Perform calf raises through full range of motion.', 'Control eccentric lowering phase for 2-3 seconds.', NOW()),
                ('e3400004-0000-0000-0000-000000000007', 'Farmer Tip-Toe Walk', 'CALVES', 'Soleus, Forearms, Core', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 3, '45s', '60s', 'Loaded tip-toe carry building calf isometric endurance and ankle stability.', '1. Hold heavy dumbbells at sides and raise up onto balls of feet.\\n2. Walk forward taking small controlled steps while staying on tiptoes.\\n3. Maintain high heel elevation throughout set.', 'Keep core braced and upright stance.', NOW()),
                ('e3400004-0000-0000-0000-000000000008', 'Box Jump Calf Explosions', 'CALVES', 'Ankles, Quads', 'Plyo Box', 'COMPOUND', 'INTERMEDIATE', 3, '10', '60s', 'Plyometric ankle jump focusing on explosive calf plantarflexion.', '1. Stand in front of low plyo box.\\n2. Dip knees slightly and explode upward off balls of feet onto box.\\n3. Step down carefully and repeat.', 'Land softly absorbing impact.', NOW()),
                ('e3400004-0000-0000-0000-000000000009', 'Jump Rope Calf Conditioning', 'CALVES', 'Ankles, Cardio', 'Jump Rope', 'ISOLATION', 'BEGINNER', 3, '120s', '45s', 'Rhythmic jump rope bounding building calf springiness and vascularity.', '1. Hold jump rope handles and stay light on balls of feet.\\n2. Jump 1-2 inches off floor with minimal knee bend flexing calves.\\n3. Maintain steady cadence for duration of round.', 'Keep jumps low to stay light on feet.', NOW())
                ON CONFLICT (id) DO NOTHING;
            """);

            // 8. Ensure workouts, split days, and workout exercises are seeded
            jdbcTemplate.execute("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='difficulty') THEN
                        ALTER TABLE workouts ADD COLUMN difficulty VARCHAR(50);
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='days_per_week') THEN
                        ALTER TABLE workouts ADD COLUMN days_per_week INT DEFAULT 3;
                    END IF;
                END $$;
            """);

            jdbcTemplate.execute("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='workout_split_days') THEN
                        CREATE TABLE workout_split_days (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
                            day_label VARCHAR(50),
                            name VARCHAR(255),
                            description TEXT,
                            display_order INT DEFAULT 1,
                            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                            deleted_at TIMESTAMP WITHOUT TIME ZONE
                        );
                    END IF;
                END $$;

                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workout_split_days' AND column_name='deleted_at') THEN
                        ALTER TABLE workout_split_days ADD COLUMN deleted_at TIMESTAMP WITHOUT TIME ZONE;
                    END IF;
                END $$;
            """);

            // 9. Seed 12 Curated Preset Workout Splits into workouts table
            jdbcTemplate.execute("""
                INSERT INTO workouts (id, title, description, category, difficulty, duration, calories)
                VALUES
                ('b1111111-0000-0000-0000-000000000001', 'Push / Pull / Legs (PPL) Hypertrophy Split', 'Gold-standard 6-day split isolating pushing muscles (Chest/Shoulders/Triceps), pulling muscles (Back/Biceps), and lower body.', 'PPL', 'INTERMEDIATE', '6 Days/Wk', 450),
                ('b1111111-0000-0000-0000-000000000002', 'The Arnold Schwarzenegger Golden Era Split', 'High volume chest/back super-sets paired with shoulders and arms for maximum upper body expansion.', 'CLASSIC PRO', 'PRO', '6 Days/Wk', 550),
                ('b1111111-0000-0000-0000-000000000003', '4-Day Upper / Lower Strength & Volume Split', 'Optimal recovery split training upper body and lower body twice per week with heavy compound progression.', 'STRENGTH & HYPERTROPHY', 'BEGINNER', '4 Days/Wk', 400),
                ('b1111111-0000-0000-0000-000000000004', '5-Day Classic Bodypart Bro Split', 'Bodybuilding split hitting one major muscle group per day with maximum single-session volume.', 'BODYBUILDING', 'INTERMEDIATE', '5 Days/Wk', 420),
                ('b1111111-0000-0000-0000-000000000005', 'Fat Loss Shred & High-Calorie Burn Split', 'High-tempo circuit and metabolic resistance split designed to maximize caloric expenditure and strip body fat while preserving muscle.', 'FAT LOSS / SHRED', 'BEGINNER', '5 Days/Wk', 600),
                ('b1111111-0000-0000-0000-000000000006', '5x5 Heavy Powerlifting Peak Strength Split', 'Low-rep, high-intensity compound power split focused on heavy deadlifts, squats, and bench press for raw maximum strength.', 'POWERLIFTING', 'PRO', '4 Days/Wk', 480),
                ('b1111111-0000-0000-0000-000000000007', 'German Volume Training (GVT 10x10) Mass Split', 'Brutal 10 sets of 10 reps protocol targeting maximum sarcoplasmic hypertrophy and muscle cell swelling.', 'MASS BUILDING', 'PRO', '5 Days/Wk', 520),
                ('b1111111-0000-0000-0000-000000000008', '3-Day Full Body Frequency Hypertrophy Split', 'High-frequency 3-day full body routine hitting every major muscle group 3x per week for busy schedules.', 'FULL BODY', 'BEGINNER', '3 Days/Wk', 380),
                ('b1111111-0000-0000-0000-000000000009', 'Mike Mentzer Heavy Duty High Intensity (HIT) Split', 'Ultra-low volume, single all-out failure set strategy to force rapid muscle adaptions and maximum growth.', 'HIT / HIGH INTENSITY', 'PRO', '3 Days/Wk', 350),
                ('b1111111-0000-0000-0000-000000000010', '5-Day Upper / Lower / Arms Specialization Split', 'Hypertrophy split with dedicated arm and shoulder specialization days for maximum arm expansion.', 'ARMS & UPPER', 'INTERMEDIATE', '5 Days/Wk', 460),
                ('b1111111-0000-0000-0000-000000000011', 'Functional Athletic Performance & Agility Hybrid Split', 'Explosive plyometrics, rotational core, sprint work, and athletic compound lifting for hybrid conditioning.', 'ATHLETIC / HYBRID', 'INTERMEDIATE', '4 Days/Wk', 500),
                ('b1111111-0000-0000-0000-000000000012', 'Posterior Chain & Glute Sculpting Split', 'Targeted posterior chain split emphasizing gluteal hypertrophy, hamstrings, and spinal erector strength.', 'GLUTE & POSTERIOR', 'BEGINNER', '4 Days/Wk', 410)
                ON CONFLICT (id) DO UPDATE SET 
                  title = EXCLUDED.title,
                  description = EXCLUDED.description,
                  category = EXCLUDED.category,
                  difficulty = EXCLUDED.difficulty,
                  duration = EXCLUDED.duration,
                  calories = EXCLUDED.calories;

                INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order)
                VALUES
                ('d1111111-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000001', 'Day 1 — Monday', 'Push A (Chest, Shoulders & Triceps)', 'Flat Barbell Bench Press, Incline Dumbbell Press, Military Overhead Press, Cable Chest Flyes, Dumbbell Lateral Raises, Triceps Rope Pushdowns', 1),
                ('d1111111-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000001', 'Day 2 — Tuesday', 'Pull A (Back, Biceps & Rear Delts)', 'Conventional Deadlift, Wide-Grip Lat Pulldowns, Barbell Bent-Over Rows, Face Pulls, EZ-Bar Bicep Curls, Dumbbell Hammer Curls', 2),
                ('d1111111-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000001', 'Day 3 — Wednesday', 'Legs A (Quads, Hamstrings & Calves)', 'Barbell Back Squat, Romanian Deadlift, 45-Degree Leg Press, Leg Extensions, Lying Leg Curls, Standing Calf Raises', 3),
                ('d1111111-0000-0000-0000-000000000004', 'b1111111-0000-0000-0000-000000000001', 'Day 4 — Thursday', 'Push B (Upper Chest, Side Delts & Triceps Long Head)', 'Incline Barbell Bench Press, Bodyweight Dips, Arnold Press, Cable Lateral Raises, Skull Crushers, Overhead Triceps Extension', 4),
                ('d1111111-0000-0000-0000-000000000005', 'b1111111-0000-0000-0000-000000000001', 'Day 5 — Friday', 'Pull B (Lat Width, Rhomboids & Biceps Peak)', 'Weighted Wide-Grip Pull-Ups, T-Bar Rows, Seated Cable Rows, Reverse Pec Deck Flyes, Preacher Curls, Concentration Curls', 5),
                ('d1111111-0000-0000-0000-000000000006', 'b1111111-0000-0000-0000-000000000001', 'Day 6 — Saturday', 'Legs B (Posterior Chain, Glutes & Abs)', 'Barbell Front Squat, Barbell Hip Thrusts, Bulgarian Split Squat, Single-Leg Hamstring Curl, Seated Calf Raises, Hanging Leg Raises', 6),

                -- Arnold Schwarzenegger Golden Era Split (b002)
                ('d1111111-0000-0000-0000-000000000011', 'b1111111-0000-0000-0000-000000000002', 'Day 1 — Monday', 'Chest & Back Super-Sets (Volume A)', 'Barbell Bench Press superset w/ Wide-Grip Pull-Up, Incline Dumbbell Press superset w/ T-Bar Row, Cable Crossover superset w/ Seated Cable Row', 1),
                ('d1111111-0000-0000-0000-000000000012', 'b1111111-0000-0000-0000-000000000002', 'Day 2 — Tuesday', 'Shoulders, Arms & Abs', 'Standing Military Press, Dumbbell Lateral Raises, Barbell Biceps Curl, Close-Grip Bench Press, Alternating Dumbbell Curl, Triceps Pushdowns, Cable Crunches', 2),
                ('d1111111-0000-0000-0000-000000000013', 'b1111111-0000-0000-0000-000000000002', 'Day 3 — Wednesday', 'Legs', 'Barbell Back Squat, Leg Press, Leg Extensions, Lying Leg Curls, Standing Calf Raises, Seated Calf Raises', 3),
                ('d1111111-0000-0000-0000-000000000014', 'b1111111-0000-0000-0000-000000000002', 'Day 4 — Thursday', 'Chest & Back Super-Sets (Volume B)', 'Incline Barbell Press superset w/ Close-Grip Pull-Down, Decline Dumbbell Press superset w/ Dumbbell Row, Pec Deck Fly superset w/ Hyperextension', 4),
                ('d1111111-0000-0000-0000-000000000015', 'b1111111-0000-0000-0000-000000000002', 'Day 5 — Friday', 'Shoulders, Arms & Abs', 'Dumbbell Overhead Press, Barbell Upright Row, EZ-Bar Preacher Curl, Skull Crushers, Concentration Curl, Overhead Triceps Extension, Hanging Leg Raises', 5),
                ('d1111111-0000-0000-0000-000000000016', 'b1111111-0000-0000-0000-000000000002', 'Day 6 — Saturday', 'Legs', 'Front Squat, Romanian Deadlift, Hack Squat, Leg Curl, Donkey Calf Raises, Tibialis Raise', 6),

                -- 5-Day Classic Bro Split (b004)
                ('d1111111-0000-0000-0000-000000000041', 'b1111111-0000-0000-0000-000000000004', 'Day 1 — Monday', 'Chest Day', 'Flat Barbell Bench Press, Incline Dumbbell Press, Decline Barbell Press, Cable Chest Flyes, Pec Deck Butterfly, Weighted Dips', 1),
                ('d1111111-0000-0000-0000-000000000042', 'b1111111-0000-0000-0000-000000000004', 'Day 2 — Tuesday', 'Back Day', 'Deadlift, Wide-Grip Pull-Ups, Barbell Bent-Over Row, T-Bar Row, Seated Cable Row, Single-Arm Dumbbell Row', 2),
                ('d1111111-0000-0000-0000-000000000043', 'b1111111-0000-0000-0000-000000000004', 'Day 3 — Wednesday', 'Shoulders Day', 'Standing Military Press, Dumbbell Lateral Raises, Barbell Upright Row, Rear Delt Fly, Arnold Press, Shrugs', 3),
                ('d1111111-0000-0000-0000-000000000044', 'b1111111-0000-0000-0000-000000000004', 'Day 4 — Thursday', 'Arms Day (Biceps & Triceps)', 'Barbell Bicep Curl, Incline Dumbbell Curl, Hammer Curls, Preacher Curl, Triceps Pushdowns, Skull Crushers, Overhead Triceps Extension, Dips', 4),
                ('d1111111-0000-0000-0000-000000000045', 'b1111111-0000-0000-0000-000000000004', 'Day 5 — Friday', 'Legs Day', 'Barbell Back Squat, Romanian Deadlift, Leg Press, Leg Extensions, Lying Leg Curls, Standing Calf Raises, Seated Calf Raises', 5),

                -- Fat Loss Shred (b005)
                ('d1111111-0000-0000-0000-000000000051', 'b1111111-0000-0000-0000-000000000005', 'Day 1 — Monday', 'Upper Body HIIT Circuit', 'Push-Ups, Dumbbell Rows, Shoulder Press, Lat Pulldown, Bicep Curls, Tricep Pushdowns, Mountain Climbers', 1),
                ('d1111111-0000-0000-0000-000000000052', 'b1111111-0000-0000-0000-000000000005', 'Day 2 — Tuesday', 'Lower Body Metabolic Blast', 'Goblet Squat, Romanian Deadlift, Reverse Lunges, Leg Press, Leg Extensions, Box Jumps, Jump Squats', 2),
                ('d1111111-0000-0000-0000-000000000053', 'b1111111-0000-0000-0000-000000000005', 'Day 3 — Wednesday', 'Full Body Cardio Resistance', 'Burpees, Kettlebell Swings, Battle Ropes, Jump Rope, Dumbbell Thrusters, Renegade Rows, Plank Holds', 3),
                ('d1111111-0000-0000-0000-000000000054', 'b1111111-0000-0000-0000-000000000005', 'Day 4 — Thursday', 'Upper Body Strength + Cardio', 'Incline Press, Weighted Pull-Ups, Cable Flyes, Face Pulls, Hammer Curls, Dips, Stationary Bike Sprint Intervals', 4),
                ('d1111111-0000-0000-0000-000000000055', 'b1111111-0000-0000-0000-000000000005', 'Day 5 — Friday', 'Lower Body + Core Shred', 'Hip Thrusts, Sumo Deadlift, Walking Lunges, Calf Raises, Hanging Leg Raises, Cable Crunches, Russian Twists', 5),

                -- 5x5 Powerlifting (b006)
                ('d1111111-0000-0000-0000-000000000061', 'b1111111-0000-0000-0000-000000000006', 'Day 1 — Monday', 'Heavy Squat & Press (5×5 A)', 'Barbell Back Squat 5x5, Barbell Bench Press 5x5, Barbell Row 5x5', 1),
                ('d1111111-0000-0000-0000-000000000062', 'b1111111-0000-0000-0000-000000000006', 'Day 2 — Wednesday', 'Heavy Squat & Overhead (5×5 B)', 'Barbell Back Squat 5x5, Overhead Press 5x5, Deadlift 1x5', 2),
                ('d1111111-0000-0000-0000-000000000063', 'b1111111-0000-0000-0000-000000000006', 'Day 3 — Friday', 'Heavy Squat & Press (5×5 A)', 'Barbell Back Squat 5x5, Barbell Bench Press 5x5, Barbell Row 5x5', 3),
                ('d1111111-0000-0000-0000-000000000064', 'b1111111-0000-0000-0000-000000000006', 'Day 4 — Next Monday', 'Heavy Squat & Overhead (5×5 B)', 'Barbell Back Squat 5x5, Overhead Press 5x5, Deadlift 1x5', 4),

                -- GVT 10x10 (b007)
                ('d1111111-0000-0000-0000-000000000071', 'b1111111-0000-0000-0000-000000000007', 'Day 1 — Monday', 'Chest & Back 10×10', 'Flat Barbell Bench Press 10x10, Wide-Grip Pull-Ups 10x10, Incline Dumbbell Fly 3x12, Cable Row 3x12', 1),
                ('d1111111-0000-0000-0000-000000000072', 'b1111111-0000-0000-0000-000000000007', 'Day 2 — Tuesday', 'Legs & Abs 10×10', 'Barbell Back Squat 10x10, Romanian Deadlift 10x10, Leg Press 3x15, Hanging Leg Raises 3x15', 2),
                ('d1111111-0000-0000-0000-000000000073', 'b1111111-0000-0000-0000-000000000007', 'Day 3 — Thursday', 'Arms & Shoulders 10×10', 'Barbell Bicep Curl 10x10, Close-Grip Bench Press 10x10, Dumbbell Lateral Raises 3x15, Overhead Press 3x12', 3),
                ('d1111111-0000-0000-0000-000000000074', 'b1111111-0000-0000-0000-000000000007', 'Day 4 — Friday', 'Back & Chest Accessory 10×10', 'Incline Barbell Press 10x10, T-Bar Row 10x10, Pec Deck Fly 3x12, Lat Pulldown 3x12', 4),
                ('d1111111-0000-0000-0000-000000000075', 'b1111111-0000-0000-0000-000000000007', 'Day 5 — Saturday', 'Legs & Core Accessory 10×10', 'Front Squat 10x10, Leg Curl 10x10, Cable Crunches 3x15, Calf Raises 3x20', 5),

                -- 3-Day Full Body (b008)
                ('d1111111-0000-0000-0000-000000000081', 'b1111111-0000-0000-0000-000000000008', 'Day 1 — Monday', 'Full Body A (Squat Focus)', 'Barbell Back Squat, Barbell Bench Press, Barbell Row, Overhead Press, Romanian Deadlift, Dips, Bicep Curls', 1),
                ('d1111111-0000-0000-0000-000000000082', 'b1111111-0000-0000-0000-000000000008', 'Day 2 — Wednesday', 'Full Body B (Hinge Focus)', 'Deadlift, Incline Dumbbell Press, Weighted Pull-Ups, Goblet Squat, Cable Flyes, Tricep Pushdowns, Hammer Curls', 2),
                ('d1111111-0000-0000-0000-000000000083', 'b1111111-0000-0000-0000-000000000008', 'Day 3 — Friday', 'Full Body C (Frequency Volume)', 'Bulgarian Split Squat, Barbell Bench Press, Lat Pulldowns, Leg Press, Arnold Press, Skull Crushers, Preacher Curls', 3),

                -- Mike Mentzer HIT (b009)
                ('d1111111-0000-0000-0000-000000000091', 'b1111111-0000-0000-0000-000000000009', 'Day 1 — Monday', 'Chest & Back (1 All-Out Set Each)', 'Flat Bench Press 1x failure, Weighted Wide-Grip Pull-Ups 1x failure, Pec Deck 1x failure, Deadlift 1x failure', 1),
                ('d1111111-0000-0000-0000-000000000092', 'b1111111-0000-0000-0000-000000000009', 'Day 2 — Wednesday', 'Legs (1 All-Out Set Each)', 'Leg Press 1x failure, Leg Extensions 1x failure, Lying Leg Curls 1x failure, Standing Calf Raises 1x failure', 2),
                ('d1111111-0000-0000-0000-000000000093', 'b1111111-0000-0000-0000-000000000009', 'Day 3 — Friday', 'Shoulders & Arms (1 All-Out Set Each)', 'Overhead Press 1x failure, Lateral Raises 1x failure, Barbell Curl 1x failure, Skull Crushers 1x failure', 3),

                -- Arms Specialization (b010)
                ('d1111111-0000-0000-0000-000000000101', 'b1111111-0000-0000-0000-000000000010', 'Day 1 — Monday', 'Upper Body Push + Triceps', 'Bench Press, Overhead Press, Cable Flyes, Triceps Pushdowns, Skull Crushers, Overhead Extension, Dips', 1),
                ('d1111111-0000-0000-0000-000000000102', 'b1111111-0000-0000-0000-000000000010', 'Day 2 — Tuesday', 'Lower Body Power', 'Barbell Squat, Romanian Deadlift, Leg Press, Leg Extensions, Seated Leg Curls, Calf Raises', 2),
                ('d1111111-0000-0000-0000-000000000103', 'b1111111-0000-0000-0000-000000000010', 'Day 3 — Thursday', 'Upper Body Pull + Biceps', 'Deadlift, Pull-Ups, T-Bar Row, Cable Rows, Barbell Curl, Incline Dumbbell Curl, Hammer Curls, Preacher Curl', 3),
                ('d1111111-0000-0000-0000-000000000104', 'b1111111-0000-0000-0000-000000000010', 'Day 4 — Friday', 'Arms Specialization Day', 'Close-Grip Bench Press, Skull Crushers, Rope Pushdowns, Barbell Curl, Concentration Curl, Reverse Curl, Wrist Curls', 4),
                ('d1111111-0000-0000-0000-000000000105', 'b1111111-0000-0000-0000-000000000010', 'Day 5 — Saturday', 'Shoulders & Posterior Delts', 'Military Press, Arnold Press, Dumbbell Lateral Raises, Face Pulls, Rear Delt Flyes, Shrugs', 5),

                -- Athletic Hybrid (b011)
                ('d1111111-0000-0000-0000-000000000111', 'b1111111-0000-0000-0000-000000000011', 'Day 1 — Monday', 'Lower Body Power & Explosiveness', 'Barbell Squat, Deadlift, Box Jumps, Broad Jumps, Sled Push, Sprint Intervals', 1),
                ('d1111111-0000-0000-0000-000000000112', 'b1111111-0000-0000-0000-000000000011', 'Day 2 — Tuesday', 'Upper Body Push & Core Rotation', 'Push Press, Bench Press, Landmine Press, Cable Wood Chop, Medicine Ball Slam, Pallof Press', 2),
                ('d1111111-0000-0000-0000-000000000113', 'b1111111-0000-0000-0000-000000000011', 'Day 3 — Thursday', 'Upper Body Pull & Rotational Core', 'Pull-Ups, Dumbbell Row, Face Pulls, Rotational Cable Row, Battle Ropes, Turkish Get-Up', 3),
                ('d1111111-0000-0000-0000-000000000114', 'b1111111-0000-0000-0000-000000000011', 'Day 4 — Friday', 'Full Body Athletic Conditioning', 'Power Clean, Farmers Walk, Kettlebell Swing, Agility Ladder, Plyo Push-Ups, Timed Sprint Repeats', 4),

                -- Glute Sculpting (b012)
                ('d1111111-0000-0000-0000-000000000121', 'b1111111-0000-0000-0000-000000000012', 'Day 1 — Monday', 'Glutes & Hamstrings Heavy', 'Barbell Hip Thrust, Romanian Deadlift, Sumo Deadlift, Cable Glute Kickback, Lying Leg Curl, Deficit Reverse Lunge', 1),
                ('d1111111-0000-0000-0000-000000000122', 'b1111111-0000-0000-0000-000000000012', 'Day 2 — Wednesday', 'Quads & Glutes Volume', 'Barbell Back Squat, Leg Press, Bulgarian Split Squat, Curtsy Lunges, Leg Extensions, Abductor Machine', 2),
                ('d1111111-0000-0000-0000-000000000123', 'b1111111-0000-0000-0000-000000000012', 'Day 3 — Friday', 'Posterior Chain & Core Finish', 'Glute-Ham Raise, Cable Pull-Through, Frog Pumps, Single-Leg RDL, Reverse Hyper-Extensions, Cable Crunches', 3),
                ('d1111111-0000-0000-0000-000000000124', 'b1111111-0000-0000-0000-000000000012', 'Day 4 — Saturday', 'Glutes & Hamstrings Pump', 'Dumbbell Hip Thrust, Kettlebell Swing, Step-Ups, Nordic Hamstring Curl, Swiss Ball Leg Curl, Hip Abductor Flyes', 4)

                ON CONFLICT (id) DO NOTHING;
            """);

            // 10. Map exercises to new splits
            jdbcTemplate.execute("""
                INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, time)
                VALUES
                -- Fat Loss Shred (b005)
                ('c1111111-0000-0000-0000-000000000051', 'b1111111-0000-0000-0000-000000000005', 'e1111111-0000-0000-0000-000000000001', 4, 15, 45),
                ('c1111111-0000-0000-0000-000000000052', 'b1111111-0000-0000-0000-000000000005', 'e1111111-0000-0000-0000-000000000002', 4, 15, 45),
                ('c1111111-0000-0000-0000-000000000053', 'b1111111-0000-0000-0000-000000000005', 'e1111111-0000-0000-0000-000000000006', 4, 15, 45),
                ('c1111111-0000-0000-0000-000000000054', 'b1111111-0000-0000-0000-000000000005', 'e1111111-0000-0000-0000-000000000004', 4, 20, 30),

                -- Powerlifting 5x5 (b006)
                ('c1111111-0000-0000-0000-000000000061', 'b1111111-0000-0000-0000-000000000006', 'e1111111-0000-0000-0000-000000000001', 5, 5, 180),
                ('c1111111-0000-0000-0000-000000000062', 'b1111111-0000-0000-0000-000000000006', 'e1111111-0000-0000-0000-000000000006', 5, 5, 180),
                ('c1111111-0000-0000-0000-000000000063', 'b1111111-0000-0000-0000-000000000006', 'e1111111-0000-0000-0000-000000000002', 5, 5, 180),

                -- GVT 10x10 (b007)
                ('c1111111-0000-0000-0000-000000000071', 'b1111111-0000-0000-0000-000000000007', 'e1111111-0000-0000-0000-000000000001', 10, 10, 60),
                ('c1111111-0000-0000-0000-000000000072', 'b1111111-0000-0000-0000-000000000007', 'e1111111-0000-0000-0000-000000000006', 10, 10, 60),

                -- 3-Day Full Body (b008)
                ('c1111111-0000-0000-0000-000000000081', 'b1111111-0000-0000-0000-000000000008', 'e1111111-0000-0000-0000-000000000001', 3, 10, 90),
                ('c1111111-0000-0000-0000-000000000082', 'b1111111-0000-0000-0000-000000000008', 'e1111111-0000-0000-0000-000000000006', 3, 10, 90),
                ('c1111111-0000-0000-0000-000000000083', 'b1111111-0000-0000-0000-000000000008', 'e1111111-0000-0000-0000-000000000002', 3, 10, 90),

                -- Heavy Duty HIT (b009)
                ('c1111111-0000-0000-0000-000000000091', 'b1111111-0000-0000-0000-000000000009', 'e1111111-0000-0000-0000-000000000001', 1, 8, 180),
                ('c1111111-0000-0000-0000-000000000092', 'b1111111-0000-0000-0000-000000000009', 'e1111111-0000-0000-0000-000000000006', 1, 8, 180),

                -- Arms Specialization (b010)
                ('c1111111-0000-0000-0000-000000000101', 'b1111111-0000-0000-0000-000000000010', 'e1111111-0000-0000-0000-000000000003', 4, 12, 60),
                ('c1111111-0000-0000-0000-000000000102', 'b1111111-0000-0000-0000-000000000010', 'e1111111-0000-0000-0000-000000000004', 4, 12, 60),

                -- Athletic Conditioning (b011)
                ('c1111111-0000-0000-0000-000000000111', 'b1111111-0000-0000-0000-000000000011', 'e1111111-0000-0000-0000-000000000006', 4, 8, 90),
                ('c1111111-0000-0000-0000-000000000112', 'b1111111-0000-0000-0000-000000000011', 'e1111111-0000-0000-0000-000000000002', 4, 10, 60),

                -- Glute Sculpting (b012)
                ('c1111111-0000-0000-0000-000000000121', 'b1111111-0000-0000-0000-000000000012', 'e1111111-0000-0000-0000-000000000006', 4, 12, 60),
                ('c1111111-0000-0000-0000-000000000122', 'b1111111-0000-0000-0000-000000000012', 'e1111111-0000-0000-0000-000000000002', 4, 10, 90)
                ON CONFLICT (id) DO NOTHING;
            """);

            log.info("12 Preset Workout Splits & Exercise mappings initialized successfully in PostgreSQL.");
        } catch (Exception e) {
            log.error("Failed to backfill exercise and workout details in GymWorkoutService", e);
        }
    }
}
