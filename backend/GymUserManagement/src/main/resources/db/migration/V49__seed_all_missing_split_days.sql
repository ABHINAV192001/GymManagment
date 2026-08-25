-- V49__seed_all_missing_split_days.sql
-- Seeds workout_split_days for every program that currently has none.
-- Idempotent: ON CONFLICT (id) DO NOTHING.
-- Covers: b1111111 presets (Full Body, Bro Split, Arms, Powerlifting 5x5,
--         GVT, HIT, Athletic Hybrid, Glute Sculpting, Fat Loss Shred)
--         and b2222222 programs from V46 (Arnold Split, Bro Split, PPL,
--         Upper-Lower, PPL-Upper-Lower Hybrid, Push-Pull+Legs 3-Day,
--         Cardio+Strength, Chest-Back-Legs-Shoulders-Arms, Full Body Split,
--         Torso-Limbs, Upper-Lower-Arms).

-- ============================================================
-- b1111111 PRESET PROGRAMS
-- ============================================================

-- 1. 3-Day Full Body Frequency Hypertrophy Split (b1111111-0000-0000-0000-000000000008)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e0081001-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000008', 'Day 1 - Monday',    'Full Body A (Squat Focus)',        'Barbell Back Squat, Barbell Bench Press, Barbell Row, Overhead Press, Romanian Deadlift, Dips, Bicep Curls',                     1),
  ('e0081001-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000008', 'Day 2 - Wednesday', 'Full Body B (Hinge Focus)',        'Deadlift, Incline Dumbbell Press, Weighted Pull-Ups, Goblet Squat, Cable Flyes, Tricep Pushdowns, Hammer Curls',                 2),
  ('e0081001-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000008', 'Day 3 - Friday',    'Full Body C (Frequency Volume)',   'Bulgarian Split Squat, Barbell Bench Press, Lat Pulldowns, Leg Press, Arnold Press, Skull Crushers, Preacher Curls',             3)
ON CONFLICT (id) DO NOTHING;

-- 2. 5-Day Classic Bodypart Bro Split (b1111111-0000-0000-0000-000000000004)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e0041001-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000004', 'Day 1 - Monday',    'Chest Day',                        'Flat Barbell Bench Press, Incline Dumbbell Press, Decline Barbell Press, Cable Chest Flyes, Pec Deck Butterfly, Weighted Dips',                                   1),
  ('e0041001-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000004', 'Day 2 - Tuesday',   'Back Day',                         'Deadlift, Wide-Grip Pull-Ups, Barbell Bent-Over Row, T-Bar Row, Seated Cable Row, Single-Arm Dumbbell Row',                                                       2),
  ('e0041001-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000004', 'Day 3 - Wednesday', 'Shoulders Day',                    'Standing Military Press, Dumbbell Lateral Raises, Barbell Upright Row, Rear Delt Fly, Arnold Press, Shrugs',                                                       3),
  ('e0041001-0000-0000-0000-000000000004', 'b1111111-0000-0000-0000-000000000004', 'Day 4 - Thursday',  'Arms Day (Biceps & Triceps)',       'Barbell Bicep Curl, Incline Dumbbell Curl, Hammer Curls, Preacher Curl, Triceps Pushdowns, Skull Crushers, Overhead Triceps Extension',                           4),
  ('e0041001-0000-0000-0000-000000000005', 'b1111111-0000-0000-0000-000000000004', 'Day 5 - Friday',    'Legs Day',                         'Barbell Back Squat, Romanian Deadlift, Leg Press, Leg Extensions, Lying Leg Curls, Standing Calf Raises, Seated Calf Raises',                                    5)
ON CONFLICT (id) DO NOTHING;

-- 3. 5-Day Upper / Lower / Arms Specialization (b1111111-0000-0000-0000-000000000010)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e0101001-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000010', 'Day 1 - Monday',    'Upper Body Push + Triceps',        'Bench Press, Overhead Press, Cable Flyes, Triceps Pushdowns, Skull Crushers, Overhead Triceps Extension, Dips',                                                    1),
  ('e0101001-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000010', 'Day 2 - Tuesday',   'Lower Body Power',                 'Barbell Squat, Romanian Deadlift, Leg Press, Leg Extensions, Seated Leg Curls, Calf Raises',                                                                       2),
  ('e0101001-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000010', 'Day 3 - Thursday',  'Upper Body Pull + Biceps',         'Deadlift, Pull-Ups, T-Bar Row, Cable Rows, Barbell Curl, Incline Dumbbell Curl, Hammer Curls, Preacher Curl',                                                     3),
  ('e0101001-0000-0000-0000-000000000004', 'b1111111-0000-0000-0000-000000000010', 'Day 4 - Friday',    'Arms Specialization Day',          'Close-Grip Bench Press, Skull Crushers, Rope Pushdowns, Barbell Curl, Concentration Curl, Reverse Curl, Wrist Curls',                                            4),
  ('e0101001-0000-0000-0000-000000000005', 'b1111111-0000-0000-0000-000000000010', 'Day 5 - Saturday',  'Shoulders & Rear Delts',           'Military Press, Arnold Press, Dumbbell Lateral Raises, Face Pulls, Rear Delt Flyes, Shrugs',                                                                      5)
ON CONFLICT (id) DO NOTHING;

-- 4. 5x5 Heavy Powerlifting Peak Strength Split (b1111111-0000-0000-0000-000000000006)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e0061001-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000006', 'Day 1 - Monday',      'Heavy Squat & Press (5x5 A)',       'Barbell Back Squat 5x5, Barbell Bench Press 5x5, Barbell Row 5x5',              1),
  ('e0061001-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000006', 'Day 2 - Wednesday',   'Heavy Squat & Overhead (5x5 B)',    'Barbell Back Squat 5x5, Overhead Press 5x5, Deadlift 1x5',                     2),
  ('e0061001-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000006', 'Day 3 - Friday',      'Heavy Squat & Press (5x5 A)',       'Barbell Back Squat 5x5, Barbell Bench Press 5x5, Barbell Row 5x5',              3),
  ('e0061001-0000-0000-0000-000000000004', 'b1111111-0000-0000-0000-000000000006', 'Day 4 - Next Monday', 'Heavy Squat & Overhead (5x5 B)',    'Barbell Back Squat 5x5, Overhead Press 5x5, Deadlift 1x5',                     4)
ON CONFLICT (id) DO NOTHING;

-- 5. German Volume Training GVT 10x10 Mass Split (b1111111-0000-0000-0000-000000000007)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e0071001-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000007', 'Day 1 - Monday',    'Chest & Back 10x10',               'Flat Barbell Bench Press 10x10, Wide-Grip Pull-Ups 10x10, Incline Dumbbell Fly 3x12, Cable Row 3x12',              1),
  ('e0071001-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000007', 'Day 2 - Tuesday',   'Legs & Abs 10x10',                 'Barbell Back Squat 10x10, Romanian Deadlift 10x10, Leg Press 3x15, Hanging Leg Raises 3x15',                       2),
  ('e0071001-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000007', 'Day 3 - Thursday',  'Arms & Shoulders 10x10',           'Barbell Bicep Curl 10x10, Close-Grip Bench Press 10x10, Lateral Raises 3x15, Overhead Press 3x12',                 3),
  ('e0071001-0000-0000-0000-000000000004', 'b1111111-0000-0000-0000-000000000007', 'Day 4 - Friday',    'Back & Chest Accessory 10x10',     'Incline Barbell Press 10x10, T-Bar Row 10x10, Pec Deck Fly 3x12, Lat Pulldown 3x12',                               4),
  ('e0071001-0000-0000-0000-000000000005', 'b1111111-0000-0000-0000-000000000007', 'Day 5 - Saturday',  'Legs & Core Accessory 10x10',      'Front Squat 10x10, Leg Curl 10x10, Cable Crunches 3x15, Calf Raises 3x20',                                         5)
ON CONFLICT (id) DO NOTHING;

-- 6. Mike Mentzer Heavy Duty HIT Split (b1111111-0000-0000-0000-000000000009)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e0091001-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000009', 'Day 1 - Monday',    'Chest & Back (1 All-Out Set)',      'Flat Bench Press 1x failure, Wide-Grip Pull-Ups 1x failure, Pec Deck 1x failure, Deadlift 1x failure',              1),
  ('e0091001-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000009', 'Day 2 - Wednesday', 'Legs (1 All-Out Set)',              'Leg Press 1x failure, Leg Extensions 1x failure, Lying Leg Curls 1x failure, Standing Calf Raises 1x failure',     2),
  ('e0091001-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000009', 'Day 3 - Friday',    'Shoulders & Arms (1 All-Out Set)', 'Overhead Press 1x failure, Lateral Raises 1x failure, Barbell Curl 1x failure, Skull Crushers 1x failure',          3)
ON CONFLICT (id) DO NOTHING;

-- 7. Functional Athletic Performance & Agility Hybrid Split (b1111111-0000-0000-0000-000000000011)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e0111001-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000011', 'Day 1 - Monday',    'Lower Body Power & Explosiveness', 'Barbell Squat, Deadlift, Box Jumps, Broad Jumps, Sled Push, Sprint Intervals',                                       1),
  ('e0111001-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000011', 'Day 2 - Tuesday',   'Upper Body Push & Core Rotation',  'Push Press, Bench Press, Landmine Press, Cable Wood Chop, Medicine Ball Slam, Pallof Press',                         2),
  ('e0111001-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000011', 'Day 3 - Thursday',  'Upper Body Pull & Rotational Core', 'Pull-Ups, Dumbbell Row, Face Pulls, Rotational Cable Row, Battle Ropes, Turkish Get-Up',                            3),
  ('e0111001-0000-0000-0000-000000000004', 'b1111111-0000-0000-0000-000000000011', 'Day 4 - Friday',    'Full Body Athletic Conditioning',  'Power Clean, Farmers Walk, Kettlebell Swing, Agility Ladder, Plyo Push-Ups, Timed Sprint Repeats',                   4)
ON CONFLICT (id) DO NOTHING;

-- 8. Posterior Chain & Glute Sculpting Split (b1111111-0000-0000-0000-000000000012)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e0121001-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000012', 'Day 1 - Monday',    'Glutes & Hamstrings Heavy',        'Barbell Hip Thrust, Romanian Deadlift, Sumo Deadlift, Cable Glute Kickback, Lying Leg Curl, Deficit Reverse Lunge',   1),
  ('e0121001-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000012', 'Day 2 - Wednesday', 'Quads & Glutes Volume',            'Barbell Back Squat, Leg Press, Bulgarian Split Squat, Curtsy Lunges, Leg Extensions, Abductor Machine',                2),
  ('e0121001-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000012', 'Day 3 - Friday',    'Posterior Chain & Core Finish',    'Glute-Ham Raise, Cable Pull-Through, Frog Pumps, Single-Leg RDL, Reverse Hyper-Extensions, Cable Crunches',           3),
  ('e0121001-0000-0000-0000-000000000004', 'b1111111-0000-0000-0000-000000000012', 'Day 4 - Saturday',  'Glutes & Hamstrings Pump',         'Dumbbell Hip Thrust, Kettlebell Swing, Step-Ups, Nordic Hamstring Curl, Swiss Ball Leg Curl, Hip Abductor Flyes',     4)
ON CONFLICT (id) DO NOTHING;

-- 9. Fat Loss Shred & High-Calorie Burn Split (b1111111-0000-0000-0000-000000000005)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e0051001-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000005', 'Day 1 - Monday',    'Upper Body HIIT Circuit',          'Push-Ups, Dumbbell Rows, Shoulder Press, Lat Pulldown, Bicep Curls, Tricep Pushdowns, Mountain Climbers',              1),
  ('e0051001-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000005', 'Day 2 - Tuesday',   'Lower Body Metabolic Blast',       'Goblet Squat, Romanian Deadlift, Reverse Lunges, Leg Press, Leg Extensions, Box Jumps, Jump Squats',                  2),
  ('e0051001-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000005', 'Day 3 - Wednesday', 'Full Body Cardio Resistance',      'Burpees, Kettlebell Swings, Battle Ropes, Jump Rope, Dumbbell Thrusters, Renegade Rows, Plank Holds',                 3),
  ('e0051001-0000-0000-0000-000000000004', 'b1111111-0000-0000-0000-000000000005', 'Day 4 - Thursday',  'Upper Body Strength + Cardio',     'Incline Press, Weighted Pull-Ups, Cable Flyes, Face Pulls, Hammer Curls, Dips, Bike Sprint Intervals',                 4),
  ('e0051001-0000-0000-0000-000000000005', 'b1111111-0000-0000-0000-000000000005', 'Day 5 - Friday',    'Lower Body + Core Shred',          'Hip Thrusts, Sumo Deadlift, Walking Lunges, Calf Raises, Hanging Leg Raises, Cable Crunches, Russian Twists',         5)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- b2222222 PROGRAMS (from V46)
-- ============================================================

-- 10. Arnold Split (b2222222-0000-0000-0000-000000000005)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e2221001-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000005', 'Day 1 - Monday',    'Chest & Back (Volume A)',          'Barbell Flat Bench Press superset Wide-Grip Pull-Up, Incline Dumbbell Press superset T-Bar Row, Cable Crossover superset Seated Cable Row',                       1),
  ('e2221001-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000005', 'Day 2 - Tuesday',   'Shoulders, Arms & Abs',            'Standing Barbell Military Press, Dumbbell Lateral Raises, Seated Arnold Press, Barbell Biceps Curl, Incline Seated Dumbbell Curls, Tricep Rope Pushdowns',      2),
  ('e2221001-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000005', 'Day 3 - Wednesday', 'Legs',                             'Barbell High-Bar Back Squat, 45-Degree Leg Press, Romanian Deadlift, Standing Calf Raises',                                                                       3),
  ('e2221001-0000-0000-0000-000000000004', 'b2222222-0000-0000-0000-000000000005', 'Day 4 - Thursday',  'Chest & Back (Volume B)',          'Incline Barbell Press superset Close-Grip Lat Pull-Down, Decline Dumbbell Press superset Single-Arm Row, Pec Deck superset Hyperextension',                      4),
  ('e2221001-0000-0000-0000-000000000005', 'b2222222-0000-0000-0000-000000000005', 'Day 5 - Friday',    'Shoulders, Arms & Abs',            'Dumbbell Overhead Press, Barbell Upright Row, High Cable Face Pulls, Barbell Heavy Shrugs, Preacher EZ-Bar Curls, Overhead Dumbbell Tricep Extension',           5),
  ('e2221001-0000-0000-0000-000000000006', 'b2222222-0000-0000-0000-000000000005', 'Day 6 - Saturday',  'Legs',                             'Barbell Front Squat, Romanian Deadlift, Hack Squat, Lying Hamstring Leg Curls, Seated Calf Raises',                                                               6)
ON CONFLICT (id) DO NOTHING;

-- 11. Bro Split (b2222222-0000-0000-0000-000000000003)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e2223001-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000003', 'Day 1 - Monday',    'Chest Day',                        'Barbell Flat Bench Press, Incline Dumbbell Bench Press, Cable Standing Chest Flyes, Parallel Bar Chest Dips, Incline Cable Flyes',                               1),
  ('e2223001-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000003', 'Day 2 - Tuesday',   'Back Day',                         'Barbell Conventional Deadlift, Lat Pulldown Wide Grip, Bent-Over Barbell Row, Seated Cable Rows, Single-Arm Dumbbell Row, Hyperextension Back Extensions',        2),
  ('e2223001-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000003', 'Day 3 - Wednesday', 'Shoulders Day',                    'Standing Barbell Military Press, Dumbbell Lateral Raises, Seated Arnold Press, Barbell Heavy Shrugs',                                                             3),
  ('e2223001-0000-0000-0000-000000000004', 'b2222222-0000-0000-0000-000000000003', 'Day 4 - Thursday',  'Arms Day (Biceps & Triceps)',       'Standing EZ-Bar Bicep Curls, Dumbbell Alternating Hammer Curls, Tricep Rope Pushdowns, Overhead Dumbbell Tricep Extension',                                      4),
  ('e2223001-0000-0000-0000-000000000005', 'b2222222-0000-0000-0000-000000000003', 'Day 5 - Friday',    'Legs Day',                         'Barbell High-Bar Back Squat, 45-Degree Leg Press, Romanian Deadlift, Lying Hamstring Leg Curls, Standing Calf Raises, Hanging Leg Raises',                      5)
ON CONFLICT (id) DO NOTHING;

-- 12. Push-Pull-Legs PPL (b2222222-0000-0000-0000-000000000001)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e2211001-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000001', 'Day 1 - Monday',    'Push A (Chest, Shoulders & Triceps)',  'Barbell Flat Bench Press, Incline Dumbbell Bench Press, Decline Barbell Bench Press, Cable Standing Chest Flyes, Parallel Bar Chest Dips, Machine Seated Chest Press, Incline Cable Flyes, Pec Deck Butterfly Flyes, Weighted Feet-Elevated Pushups', 1),
  ('e2211001-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000001', 'Day 2 - Tuesday',   'Pull A (Back, Biceps & Rear Delts)',   'Lat Pulldown Wide Grip, Bent-Over Barbell Row, Seated Cable Rows, Single-Arm Dumbbell Row, Bodyweight Wide Pull-Ups, T-Bar Landmine Row, Straight-Arm Cable Lat Pulldown',                                                                          2),
  ('e2211001-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000001', 'Day 3 - Wednesday', 'Legs A (Quads, Hamstrings & Calves)', 'Barbell High-Bar Back Squat, 45-Degree Leg Press, Romanian Deadlift, Standing Barbell Military Press, Dumbbell Lateral Raises, Seated Arnold Dumbbell Press',                                                                                    3),
  ('e2211001-0000-0000-0000-000000000004', 'b2222222-0000-0000-0000-000000000001', 'Day 4 - Thursday',  'Push B (Upper Chest, Side Delts)',     'Standing Barbell Military Press, Dumbbell Lateral Raises, Seated Arnold Dumbbell Press, High Cable Face Pulls, Barbell Heavy Shrugs',                                                                                                             4),
  ('e2211001-0000-0000-0000-000000000005', 'b2222222-0000-0000-0000-000000000001', 'Day 5 - Friday',    'Pull B (Lat Width & Biceps Peak)',     'Lat Pulldown Wide Grip, Bent-Over Barbell Row, Seated Cable Rows, T-Bar Landmine Row, Straight-Arm Cable Lat Pulldown',                                                                                                                          5),
  ('e2211001-0000-0000-0000-000000000006', 'b2222222-0000-0000-0000-000000000001', 'Day 6 - Saturday',  'Legs B (Posterior Chain & Core)',      'Barbell High-Bar Back Squat, 45-Degree Leg Press, Romanian Deadlift',                                                                                                                                                                            6)
ON CONFLICT (id) DO NOTHING;

-- 13. Upper-Lower Split (b2222222-0000-0000-0000-000000000002)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e2202001-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000002', 'Day 1 - Monday',    'Upper Body (Chest, Back & Shoulders)', 'Barbell Flat Bench Press, Incline Dumbbell Bench Press, Cable Flyes, Parallel Bar Chest Dips, Lat Pulldown Wide Grip, Bent-Over Barbell Row, Seated Cable Rows, Single-Arm Dumbbell Row, Bodyweight Pull-Ups, Standing Military Press, Dumbbell Lateral Raises, High Cable Face Pulls', 1),
  ('e2202001-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000002', 'Day 2 - Tuesday',   'Lower Body (Quads, Glutes & Posterior)', 'Barbell High-Bar Back Squat, Barbell Front Squat, 45-Degree Leg Press, Dumbbell Bulgarian Split Squat, Barbell Hip Thrusts, Romanian Deadlift, Standing Calf Raises',                                                                                        2),
  ('e2202001-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000002', 'Day 3 - Thursday',  'Upper Body (Arms & Volume)',           'Standing EZ-Bar Bicep Curls, Tricep Rope Pushdowns, High Cable Face Pulls, Ab Roller Wheel Rollouts, Hanging Leg Raises',                                                                                                                               3),
  ('e2202001-0000-0000-0000-000000000004', 'b2222222-0000-0000-0000-000000000002', 'Day 4 - Friday',    'Lower Body (Posterior Chain)',         'Barbell Hip Thrusts, Romanian Deadlift, Barbell High-Bar Back Squat, Standing Calf Raises, Ab Roller Wheel Rollouts',                                                                                                                                   4)
ON CONFLICT (id) DO NOTHING;

-- 14. Push-Pull-Legs + Upper-Lower Hybrid (b2222222-0000-0000-0000-000000000004)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e2204001-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000004', 'Day 1 - Monday',    'Push (Chest, Shoulders & Triceps)',  'Barbell Flat Bench Press, Incline Dumbbell Bench Press, Decline Barbell Bench Press, Parallel Bar Chest Dips, Standing Barbell Military Press, Dumbbell Lateral Raises, High Cable Face Pulls, Tricep Rope Pushdowns, Close-Grip Barbell Bench Press', 1),
  ('e2204001-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000004', 'Day 2 - Tuesday',   'Pull (Back & Biceps)',               'Barbell Conventional Deadlift, Lat Pulldown Wide Grip, Bent-Over Barbell Row, Seated Cable Rows, Bodyweight Wide Pull-Ups, Standing EZ-Bar Bicep Curls',                                                                                              2),
  ('e2204001-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000004', 'Day 3 - Thursday',  'Legs (Quads, Hamstrings & Glutes)', 'Barbell High-Bar Back Squat, Barbell Front Squat, 45-Degree Leg Press, Dumbbell Bulgarian Split Squat, Barbell Hip Thrusts, Romanian Deadlift, Standing Calf Raises',                                                                                 3),
  ('e2204001-0000-0000-0000-000000000004', 'b2222222-0000-0000-0000-000000000004', 'Day 4 - Friday',    'Upper Hypertrophy (Volume Day)',     'Barbell Flat Bench Press, Incline Dumbbell Press, Seated Cable Rows, Bodyweight Pull-Ups, Dumbbell Lateral Raises, EZ-Bar Bicep Curls, Ab Roller Wheel Rollouts',                                                                                     4),
  ('e2204001-0000-0000-0000-000000000005', 'b2222222-0000-0000-0000-000000000004', 'Day 5 - Saturday',  'Lower Hypertrophy (Volume Day)',     '45-Degree Leg Press, Dumbbell Bulgarian Split Squat, Romanian Deadlift, Standing Calf Raises, Ab Roller Wheel Rollouts',                                                                                                                              5)
ON CONFLICT (id) DO NOTHING;

-- 15. Push-Pull + Legs 3-Day (b2222222-0000-0000-0000-000000000006)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e2206001-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000006', 'Day 1 - Monday & Friday', 'Push + Pull (Upper Body)',      'Barbell Flat Bench Press, Incline Dumbbell Bench Press, Cable Standing Chest Flyes, Parallel Bar Chest Dips, Machine Seated Chest Press, Lat Pulldown Wide Grip, Bent-Over Barbell Row, Seated Cable Rows, Single-Arm Dumbbell Row, Bodyweight Wide Pull-Ups, Standing Barbell Military Press, Dumbbell Lateral Raises, EZ-Bar Bicep Curls, Tricep Rope Pushdowns', 1),
  ('e2206001-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000006', 'Day 2 - Wednesday',       'Legs (Full Lower Body)',         'Barbell High-Bar Back Squat, 45-Degree Leg Press, Seated Quad Leg Extensions, Romanian Deadlift, Lying Hamstring Leg Curls, Standing Calf Raises, Hanging Leg Raises, Decline Weighted Ab Crunches',                                                                                                                                                                   2)
ON CONFLICT (id) DO NOTHING;

-- 16. Cardio + Strength Split (b2222222-0000-0000-0000-000000000020)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e2220001-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000020', 'Day 1 - Monday',    'Upper Body Strength',              'Barbell Flat Bench Press, Incline Dumbbell Bench Press, Barbell Conventional Deadlift, Lat Pulldown Wide Grip, Bent-Over Barbell Row, Standing Barbell Military Press, Dumbbell Lateral Raises',                1),
  ('e2220001-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000020', 'Day 2 - Tuesday',   'Cardio & Conditioning',            'Heavy Kettlebell Swings, Dumbbell Thrusters, Battle Rope Alternating Slams, Burpees to Pull-Up, Medicine Ball Wall Balls, High Knee Mountain Climbers',                                                       2),
  ('e2220001-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000020', 'Day 3 - Wednesday', 'Lower Body Strength',              'Barbell High-Bar Back Squat, 45-Degree Leg Press, Romanian Deadlift, Hanging Leg Raises, Ab Roller Wheel Rollouts',                                                                                           3),
  ('e2220001-0000-0000-0000-000000000004', 'b2222222-0000-0000-0000-000000000020', 'Day 4 - Thursday',  'Cardio Intervals & Endurance',     'Treadmill High Incline Sprint, Spin Bike High Cadence Sprint, Freestyle Crawl Sprint Laps, Rowing Ergometer 500m Sprint, Stairmaster High SPM Sprints, Stairmaster Skip-a-Step Glute Climbs',                  4),
  ('e2220001-0000-0000-0000-000000000005', 'b2222222-0000-0000-0000-000000000020', 'Day 5 - Friday',    'Full Body Conditioning',           'Heavy Kettlebell Swings, Dumbbell Thrusters, Battle Rope Alternating Slams, Burpees to Pull-Up, Hanging Leg Raises, Ab Roller Wheel Rollouts',                                                               5)
ON CONFLICT (id) DO NOTHING;

-- 17. Chest-Back-Legs-Shoulders-Arms (b2222222-0000-0000-0000-000000000009)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e2209001-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000009', 'Day 1 - Monday',    'Chest Day',                        'Barbell Flat Bench Press, Incline Dumbbell Bench Press, Cable Standing Chest Flyes, Parallel Bar Chest Dips, Incline Cable Flyes',                                                                            1),
  ('e2209001-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000009', 'Day 2 - Tuesday',   'Back Day',                         'Barbell Conventional Deadlift, Lat Pulldown Wide Grip, Bent-Over Barbell Row, Seated Cable Rows, Single-Arm Dumbbell Row',                                                                                   2),
  ('e2209001-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000009', 'Day 3 - Wednesday', 'Legs Day',                         'Barbell High-Bar Back Squat, 45-Degree Leg Press, Dumbbell Bulgarian Split Squat, Romanian Deadlift',                                                                                                        3),
  ('e2209001-0000-0000-0000-000000000004', 'b2222222-0000-0000-0000-000000000009', 'Day 4 - Thursday',  'Shoulders Day',                    'Standing Barbell Military Press, Dumbbell Lateral Raises, Seated Arnold Dumbbell Press, High Cable Face Pulls, Barbell Heavy Shrugs',                                                                          4),
  ('e2209001-0000-0000-0000-000000000005', 'b2222222-0000-0000-0000-000000000009', 'Day 5 - Friday',    'Arms Day (Biceps & Triceps)',       'Standing EZ-Bar Bicep Curls, Dumbbell Alternating Hammer Curls, Incline Seated Dumbbell Bicep Curls, Tricep Rope Pushdowns, Overhead Dumbbell Tricep Extension, EZ-Bar Lying Skullcrushers',                5)
ON CONFLICT (id) DO NOTHING;

-- 18. Full Body Split (b2222222-0000-0000-0000-000000000007)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e2207001-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000007', 'Day 1 - Monday',    'Full Body A (Push Focus)',          'Barbell Flat Bench Press, Incline Dumbbell Bench Press, Parallel Bar Chest Dips, Barbell Conventional Deadlift, Lat Pulldown Wide Grip, Standing Barbell Military Press, Dumbbell Lateral Raises, Standing EZ-Bar Bicep Curls, Tricep Rope Pushdowns, Barbell High-Bar Back Squat, 45-Degree Leg Press, Barbell Hip Thrusts', 1),
  ('e2207001-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000007', 'Day 2 - Wednesday', 'Full Body B (Pull Focus)',          'Barbell Conventional Deadlift, Bent-Over Barbell Row, Bodyweight Wide Pull-Ups, Romanian Deadlift, Standing Calf Raises, Hanging Leg Raises, Heavy Kettlebell Swings, Dumbbell Thrusters, Heavy Farmer Carry Walks, High Knee Mountain Climbers',                                                                  2),
  ('e2207001-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000007', 'Day 3 - Friday',    'Full Body C (Leg Focus)',           'Dumbbell Bulgarian Split Squat, 45-Degree Leg Press, Barbell Hip Thrusts, Romanian Deadlift, Standing Calf Raises, Barbell Flat Bench Press, Bodyweight Wide Pull-Ups, Standing Barbell Military Press',                                                                                                          3)
ON CONFLICT (id) DO NOTHING;

-- 19. Torso-Limbs Split (b2222222-0000-0000-0000-000000000010)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e2210001-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000010', 'Day 1 - Monday',    'Torso (Chest, Back & Shoulders)',  'Barbell Flat Bench Press, Incline Dumbbell Bench Press, Cable Standing Chest Flyes, Parallel Bar Chest Dips, Incline Cable Flyes, Lat Pulldown Wide Grip, Bent-Over Barbell Row, Seated Cable Rows, Single-Arm Dumbbell Row, Standing Barbell Military Press, Dumbbell Lateral Raises, High Cable Face Pulls', 1),
  ('e2210001-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000010', 'Day 2 - Tuesday',   'Limbs (Biceps, Triceps & Legs)',   'Standing EZ-Bar Bicep Curls, Dumbbell Alternating Hammer Curls, Tricep Rope Pushdowns, Overhead Dumbbell Tricep Extension, Barbell High-Bar Back Squat, 45-Degree Leg Press, Dumbbell Bulgarian Split Squat, Romanian Deadlift, Lying Hamstring Leg Curls, Standing Calf Raises',                             2),
  ('e2210001-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000010', 'Day 3 - Thursday',  'Torso (Volume Day)',               'Barbell Flat Bench Press, Incline Dumbbell Bench Press, Cable Standing Chest Flyes, Lat Pulldown Wide Grip, Seated Cable Rows, Standing Barbell Military Press, Dumbbell Lateral Raises',                                                                                                                   3),
  ('e2210001-0000-0000-0000-000000000004', 'b2222222-0000-0000-0000-000000000010', 'Day 4 - Friday',    'Limbs (Volume & Isolation)',       'Standing EZ-Bar Bicep Curls, Tricep Rope Pushdowns, Barbell High-Bar Back Squat, Romanian Deadlift, Lying Hamstring Leg Curls, Standing Calf Raises',                                                                                                                                                   4)
ON CONFLICT (id) DO NOTHING;

-- 20. Upper-Lower-Arms Split (b2222222-0000-0000-0000-000000000008)
INSERT INTO workout_split_days (id, workout_id, day_label, name, description, display_order) VALUES
  ('e2208001-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000008', 'Day 1 - Monday',    'Upper Body (Chest, Back & Shoulders)', 'Barbell Flat Bench Press, Incline Dumbbell Bench Press, Cable Standing Chest Flyes, Lat Pulldown Wide Grip, Bent-Over Barbell Row, Seated Cable Rows, Standing Barbell Military Press, Dumbbell Lateral Raises',                           1),
  ('e2208001-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000008', 'Day 2 - Tuesday',   'Lower Body (Quads, Hamstrings)',       'Barbell High-Bar Back Squat, 45-Degree Leg Press, Dumbbell Bulgarian Split Squat, Romanian Deadlift, Standing Calf Raises',                                                                                                              2),
  ('e2208001-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000008', 'Day 3 - Thursday',  'Arms Day (Biceps Specialization)',     'Standing EZ-Bar Bicep Curls, Dumbbell Alternating Hammer Curls, Incline Seated Dumbbell Bicep Curls, Preacher EZ-Bar Bicep Curls, Concentration Single-Arm Dumbbell Curls, High Cable Bicep Peak Curls',                             3),
  ('e2208001-0000-0000-0000-000000000004', 'b2222222-0000-0000-0000-000000000008', 'Day 4 - Friday',    'Arms Day (Triceps Specialization)',    'Tricep Rope Pushdowns, Overhead Dumbbell Tricep Extension, EZ-Bar Lying Skullcrushers, Close-Grip Barbell Bench Press',                                                                                                              4)
ON CONFLICT (id) DO NOTHING;
