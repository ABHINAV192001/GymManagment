package com.gymbross.workout.config;

import com.Gym.GymCommonServices.entity.Exercise;
import com.Gym.GymCommonServices.entity.Workout;
import com.Gym.GymCommonServices.entity.WorkoutExercise;
import com.gymbross.workout.entity.Activity;
import com.gymbross.workout.repository.ExerciseRepository;
import com.gymbross.workout.repository.WorkoutExerciseRepository;
import com.gymbross.workout.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

        private final WorkoutRepository workoutRepository;
        private final ExerciseRepository exerciseRepository;
        private final WorkoutExerciseRepository workoutExerciseRepository;
        private final com.gymbross.workout.repository.ActivityRepository activityRepository;

        @Override
        @Transactional
        public void run(String... args) throws Exception {
                // Clear existing data to ensure new plan is applied
                workoutExerciseRepository.deleteAll();
                workoutRepository.deleteAll();
                exerciseRepository.deleteAll();
                activityRepository.deleteAll();

                System.out.println("Seeding Workout Data...");

                createActivities(); // Add this call early or late. Placing it here.

                // --- Create Exercises ---

                // 1. Chest (Pectorals)
                Exercise benchPress = createExercise("Barbell Bench Press (Flat)", "Standard flat bench press...",
                                "video_url", "Chest");
                Exercise incBBPress = createExercise("Barbell Incline Bench Press", "Upper chest focus...", "video_url",
                                "Chest");
                Exercise decBBPress = createExercise("Barbell Decline Bench Press", "Lower chest focus...", "video_url",
                                "Chest");
                Exercise dbBenchPress = createExercise("Dumbbell Bench Press (Flat)",
                                "Dumbbell variation for range of motion...", "video_url", "Chest");
                Exercise dbIncPress = createExercise("Dumbbell Incline Press", "Upper chest with dumbbells...",
                                "video_url", "Chest");
                Exercise dbDecPress = createExercise("Dumbbell Decline Press", "Lower chest with dumbbells...",
                                "video_url", "Chest");
                Exercise dbFly = createExercise("Dumbbell Flyes (Flat)", "Isolation for chest width...", "video_url",
                                "Chest");
                Exercise dbIncFly = createExercise("Incline Dumbbell Flyes", "Upper chest isolation flyes...",
                                "video_url", "Chest");
                Exercise dbDecFly = createExercise("Decline Dumbbell Flyes", "Lower chest isolation flyes...",
                                "video_url", "Chest");
                Exercise pushups = createExercise("Push-Ups (Standard)", "Basic bodyweight chest move...", "video_url",
                                "Chest");
                Exercise weightedPushups = createExercise("Weighted Push-Ups", "Push-ups with added weight...",
                                "video_url", "Chest");
                Exercise decPushups = createExercise("Decline Push-Ups", "Feet elevated for upper chest...",
                                "video_url", "Chest");
                Exercise incPushups = createExercise("Incline Push-Ups", "Hands elevated for lower chest...",
                                "video_url", "Chest");
                Exercise diamondPushups = createExercise("Diamond Push-Ups", "Inner chest and tricep focus...",
                                "video_url", "Chest/Triceps");
                Exercise widePushups = createExercise("Wide-Grip Push-Ups", "Greater chest activation focus...",
                                "video_url", "Chest");
                Exercise chestDips = createExercise("Chest Dips (Bodyweight)", "leaning forward for chest focus...",
                                "video_url", "Chest/Triceps");
                Exercise weightedDips = createExercise("Weighted Chest Dips", "Dips with weighted belt...", "video_url",
                                "Chest/Triceps");
                Exercise cableCrossHigh = createExercise("Cable Crossovers (High to Low)",
                                "Targets lower chest pec line...", "video_url", "Chest");
                Exercise cableFlyLow = createExercise("Cable Flyes (Low to High)", "Targets upper chest pec line...",
                                "video_url", "Chest");
                Exercise cableFlyMid = createExercise("Cable Flyes (Middle/Standard)",
                                "Consistent tension across chest...", "video_url", "Chest");
                Exercise pecDeck = createExercise("Pec Deck Machine (Butterfly)", "Controlled chest contraction...",
                                "video_url", "Chest");
                Exercise machinePress = createExercise("Machine Chest Press (Seated)", "Stable mass builder...",
                                "video_url", "Chest");
                Exercise hammerInc = createExercise("Hammer Strength Incline Press", "Isolated upper chest press...",
                                "video_url", "Chest");
                Exercise hammerDec = createExercise("Hammer Strength Decline Press", "Isolated lower chest press...",
                                "video_url", "Chest");
                Exercise smithBench = createExercise("Smith Machine Bench Press", "Fixed path bench press...",
                                "video_url", "Chest");
                Exercise smithInc = createExercise("Smith Machine Incline Press", "Fixed path incline press...",
                                "video_url", "Chest");
                Exercise dbPullover = createExercise("Dumbbell Pullover", "Targets chest and lats...", "video_url",
                                "Chest/Back");
                Exercise floorPress = createExercise("Floor Press", "Limited range press for lockouts...", "video_url",
                                "Chest/Triceps");
                Exercise svendPress = createExercise("Svend Press", "Plate pinch for inner chest static...",
                                "video_url", "Chest");
                Exercise landminePress = createExercise("Landmine Chest Press",
                                "Great for upper chest/shoulder health...", "video_url", "Chest/Shoulders");

                // 2. Back (Lats, Traps, Rhomboids, Lower Back)
                Exercise deadlift = createExercise("Deadlift (Conventional)", "Kind of all exercises...", "video_url",
                                "Back/Legs");
                Exercise sumoDead = createExercise("Sumo Deadlift", "Deadlift with wider stance...", "video_url",
                                "Back/Legs");
                Exercise pullupWide = createExercise("Pull-Ups (Wide Grip)", "Great for V-taper...", "video_url",
                                "Back");
                Exercise chinup = createExercise("Chin-Ups", "Underhand grip for bicep involvement...", "video_url",
                                "Back/Biceps");
                Exercise pullupNeutral = createExercise("Neutral Grip Pull-Ups", "Easy on shoulders, great lats...",
                                "video_url", "Back");
                Exercise latPulldownWide = createExercise("Lat Pulldown (Wide Grip)", "Classic lat builder...",
                                "video_url", "Back");
                Exercise latPulldownReverse = createExercise("Lat Pulldown (Reverse Grip)", "Lower lat focus...",
                                "video_url", "Back");
                Exercise latPulldownVBar = createExercise("V-Bar Lat Pulldown", "Middle back and lat focus...",
                                "video_url", "Back");
                Exercise rowBB = createExercise("Bent-Over Barbell Row", "Core back builder...", "video_url", "Back");
                Exercise rowYates = createExercise("Yates Row", "More upright, underhand grip...", "video_url", "Back");
                Exercise rowPendlay = createExercise("Pendlay Row", "Explosive row from floor...", "video_url", "Back");
                Exercise rowDB = createExercise("One-Arm Dumbbell Row", "Unilateral back work...", "video_url", "Back");
                Exercise rowIncDB = createExercise("Chest-Supported Dumbbell Row", "No cheating bench row...",
                                "video_url", "Back");
                Exercise rowTBar = createExercise("T-Bar Row (Free weight)", "Old school mass builder...", "video_url",
                                "Back");
                Exercise rowTBarMach = createExercise("Machine T-Bar Row", "Chest supported for isolation...",
                                "video_url", "Back");
                Exercise rowCableV = createExercise("Seated Cable Row (V-Grip)", "Consistent cable tension rows...",
                                "video_url", "Back");
                Exercise rowCableWide = createExercise("Seated Cable Row (Wide Bar)", "Targets outer back...",
                                "video_url", "Back");
                Exercise facePulls = createExercise("Face Pulls", "Crucial for rear delts and posture...", "video_url",
                                "Back/Shoulders");
                Exercise straightArmPull = createExercise("Straight-Arm Cable Pulldown", "Isolation for lats...",
                                "video_url", "Back");
                Exercise pulloverBack = createExercise("Dumbbell Pullover (Back focus)",
                                "Lats isolation with dumbbell...", "video_url", "Back/Chest");
                Exercise invertedRow = createExercise("Inverted Rows", "Bodyweight rowing...", "video_url", "Back");
                Exercise hyperext = createExercise("Hyperextensions", "Lower back and glutes...", "video_url",
                                "Back/Glutes");
                Exercise weightedHyperext = createExercise("Weighted Hyperextensions", "Back extensions with plate...",
                                "video_url", "Back/Glutes");
                Exercise goodMornings = createExercise("Good Mornings", "Hinge for lower back...", "video_url",
                                "Back/Hamstrings");
                Exercise rackPulls = createExercise("Rack Pulls", "Deadlift lockout portion...", "video_url", "Back");
                Exercise latPullSingle = createExercise("Single-Arm Lat Pulldown", "Unilateral lat focus...",
                                "video_url", "Back");
                Exercise rowMeadows = createExercise("Meadows Row (Landmine)", "Unilateral landmine rowing...",
                                "video_url", "Back");
                Exercise rowKroc = createExercise("Kroc Rows", "Heavy, high-rep dumbbell rows...", "video_url", "Back");
                Exercise rowRenegade = createExercise("Renegade Rows", "Core stable rowing...", "video_url",
                                "Back/Core");
                Exercise supermanHold = createExercise("Superman (Bodyweight hold)", "Static back extension...",
                                "video_url", "Back");

                // Biceps
                Exercise bicepCurl = createExercise("Barbell Bicep Curls", "Curl bar up...", "video_url", "Biceps");
                Exercise hammerCurl = createExercise("Hammer Curls", "Neutral grip curl...", "video_url", "Biceps");
                Exercise preacherCurl = createExercise("Preacher Curls", "Elbows supported...", "video_url", "Biceps");
                Exercise concCurl = createExercise("Concentration Curls", "Elbow on knee...", "video_url", "Biceps");
                Exercise incDbCurl = createExercise("Incline DB Curls", "Seated incline curl...", "video_url",
                                "Biceps");
                Exercise ropeHammer = createExercise("Cable Rope Hammer Curl", "Cable hammer curl...", "video_url",
                                "Biceps");
                Exercise ezCurl = createExercise("EZ Bar Curl", "Ergonomic bar curl...", "video_url", "Biceps");

                // 3. Legs (Quads, Hamstrings, Glutes, Calves)
                Exercise squatBack = createExercise("Barbell Back Squat", "Fundamental leg builder...", "video_url",
                                "Legs");
                Exercise squatFront = createExercise("Front Squat", "Quad focus squat...", "video_url", "Legs");
                Exercise squatGoblet = createExercise("Goblet Squat", "Great for depth and form...", "video_url",
                                "Legs");
                Exercise squatOverhead = createExercise("Overhead Squat", "Mobility and stability...", "video_url",
                                "Legs");
                Exercise squatZercher = createExercise("Zercher Squat", "Bar in elbows squat...", "video_url", "Legs");
                Exercise legPress = createExercise("Leg Press", "Horizontal leg drive...", "video_url", "Legs");
                Exercise legPressWide = createExercise("Leg Press (Wide Stance)", "Inner thigh/glute focus...",
                                "video_url", "Legs");
                Exercise hackSquat = createExercise("Hack Squat Machine", "Fixed quad dominant squat...", "video_url",
                                "Legs");
                Exercise lungesDB = createExercise("Dumbbell Lunges", "Unilateral leg work...", "video_url", "Legs");
                Exercise lungesWalking = createExercise("Barbell Walking Lunges", "Progressive leg movement...",
                                "video_url", "Legs");
                Exercise reverseLunges = createExercise("Reverse Lunges", "Easier on knees lunges...", "video_url",
                                "Legs");
                Exercise bulgarianSquat = createExercise("Bulgarian Split Squats", "Unilateral king for glutes...",
                                "video_url", "Legs/Glutes");
                Exercise stepUps = createExercise("Step-Ups", "Step on bench with weights...", "video_url", "Legs");
                Exercise legExtension = createExercise("Leg Extensions", "Quad isolation move...", "video_url", "Legs");
                Exercise rdlBB = createExercise("Romanian Deadlift (Barbell)", "Hamstring and glute hinge...",
                                "video_url", "Legs/Hams");
                Exercise rdlDB = createExercise("Romanian Deadlift (Dumbbell)", "Hinge with dumbbells...", "video_url",
                                "Legs/Hams");
                Exercise stiffnessDead = createExercise("Stiff-Legged Deadlift", "Maximum hamstring stretch...",
                                "video_url", "Legs/Hams");
                Exercise legCurlLying = createExercise("Lying Leg Curls", "Hamstring isolation...", "video_url",
                                "Legs/Hams");
                Exercise legCurlSeated = createExercise("Seated Leg Curls", "Consistent tension hams...", "video_url",
                                "Legs/Hams");
                Exercise legCurlSingle = createExercise("Standing Single-Leg Curl", "Unilateral hamstring work...",
                                "video_url", "Legs/Hams");
                Exercise ghr = createExercise("Glute Ham Raise (GHR)", "Intense hamstring/glute move...", "video_url",
                                "Legs/Hams");
                Exercise hipThrust = createExercise("Hip Thrusts (Barbell)", "Primary glute builder...", "video_url",
                                "Legs/Glutes");
                Exercise gluteBridge = createExercise("Glute Bridges (Weighted)", "Floor glute isolation...",
                                "video_url", "Legs/Glutes");
                Exercise cablePullThrough = createExercise("Cable Pull-Throughs", "Posterior chain hinge...",
                                "video_url", "Legs/Hams");
                Exercise calfRaiseStanding = createExercise("Standing Calf Raise", "Primary calf builder...",
                                "video_url", "Legs/Calves");
                Exercise calfRaiseSeated = createExercise("Seated Calf Raise", "Soleus focus calves...", "video_url",
                                "Legs/Calves");
                Exercise calfRaiseDonkey = createExercise("Donkey Calf Raises", "Stretched calf work...", "video_url",
                                "Legs/Calves");
                Exercise calfRaisePress = createExercise("Leg Press Calf Raises", "Calf extensions on machine...",
                                "video_url", "Legs/Calves");
                Exercise sissySquat = createExercise("Sissy Squats", "Extreme quad stretch...", "video_url", "Legs");

                // 4. Shoulders (Deltoids)
                Exercise milPress = createExercise("Overhead Barbell Press", "Core shoulder builder...", "video_url",
                                "Shoulders");
                Exercise dbShoulderPress = createExercise("Seated Dumbbell Shoulder Press", "Isolated overhead work...",
                                "video_url", "Shoulders");
                Exercise arnoldPress = createExercise("Arnold Press", "Full rotation shoulder press...", "video_url",
                                "Shoulders");
                Exercise pushPress = createExercise("Push Press", "Explosive overhead press...", "video_url",
                                "Shoulders");
                Exercise landmineShoulder = createExercise("Landmine Shoulder Press", "Joint friendly pressing...",
                                "video_url", "Shoulders");
                Exercise latRaiseDB = createExercise("Dumbbell Lateral Raises", "Side delt mass builder...",
                                "video_url", "Shoulders");
                Exercise latRaiseCable = createExercise("Cable Lateral Raises", "Consistent tension side delts...",
                                "video_url", "Shoulders");
                Exercise latRaiseMach = createExercise("Machine Lateral Raises", "Locked in lateral raises...",
                                "video_url", "Shoulders");
                Exercise frontRaiseDB = createExercise("Dumbbell Front Raises", "Front delt focus...", "video_url",
                                "Shoulders");
                Exercise frontRaiseBB = createExercise("Barbell Front Raises", "Heavy front delt work...", "video_url",
                                "Shoulders");
                Exercise frontRaisePlate = createExercise("Plate Front Raises", "Standard shoulder raise...",
                                "video_url", "Shoulders");
                Exercise frontRaiseCable = createExercise("Cable Front Raises", "Front delt isolation...", "video_url",
                                "Shoulders");
                Exercise revFlyDB = createExercise("Bent-Over Dumbbell Reverse Flyes", "Rear delt priority...",
                                "video_url", "Shoulders");
                Exercise revPecDeck = createExercise("Reverse Pec Deck Machine", "Rear delt isolation...", "video_url",
                                "Shoulders");
                Exercise rearDeltCable = createExercise("Cable Rear Delt Flyes", "Constant tension rear delts...",
                                "video_url", "Shoulders");
                Exercise uprightRowBB = createExercise("Upright Rows (Barbell)", "Trap and side delt move...",
                                "video_url", "Shoulders/Traps");
                Exercise shrugBB = createExercise("Barbell Shrugs", "Primary trap builder...", "video_url",
                                "Shoulders/Traps");
                Exercise shrugDB = createExercise("Dumbbell Shrugs", "Unilateral trap work...", "video_url",
                                "Shoulders/Traps");
                Exercise smithShrug = createExercise("Smith Machine Shrugs", "Controlled trap work...", "video_url",
                                "Shoulders/Traps");
                Exercise cubanPress = createExercise("Cuban Press", "Rotator cuff and shoulder health...", "video_url",
                                "Shoulders");
                Exercise zPress = createExercise("Z-Press", "Seated floor overhead press...", "video_url",
                                "Shoulders/Core");
                Exercise cleanPress = createExercise("Clean and Press", "Full body explosive power...", "video_url",
                                "Shoulders/FullBody");
                Exercise kbPress = createExercise("Single-Arm Kettlebell Press", "Stable shoulder drive...",
                                "video_url", "Shoulders");
                Exercise yRaises = createExercise("Y-Raises (Incline Bench)", "Lower trap and rear delt...",
                                "video_url", "Shoulders");
                Exercise luRaise = createExercise("Lu Raises", "Full range lateral raise...", "video_url", "Shoulders");
                Exercise hsPushup = createExercise("Handstand Push-Ups", "Advanced bodyweight épaules...", "video_url",
                                "Shoulders");

                // 5. Arms (Triceps & Biceps)
                // Triceps
                Exercise closeGripBench = createExercise("Close-Grip Bench Press", "Tricep heavy pressing...",
                                "video_url", "Triceps");
                Exercise tricepDips = createExercise("Parallel Bar Dips", "Triceps focused dips...", "video_url",
                                "Triceps");
                Exercise benchDips = createExercise("Bench Dips", "Easy tricep dips...", "video_url", "Triceps");
                Exercise skullCrush = createExercise("Skullcrushers (EZ Bar)", "Isolation tricep crush...", "video_url",
                                "Triceps");
                Exercise ohExtDB = createExercise("Overhead Dumbbell Extension", "Tricep stretch move...", "video_url",
                                "Triceps");
                Exercise pushdownRope = createExercise("Cable Tricep Pushdowns (Rope)", "Spread for outer triceps...",
                                "video_url", "Triceps");
                Exercise pushdownBar = createExercise("Cable Tricep Pushdowns (Straight Bar)",
                                "Power tricep pushdown...", "video_url", "Triceps");
                Exercise pushdownV = createExercise("Cable Tricep Pushdowns (V-Bar)", "Comfortable grip pushdown...",
                                "video_url", "Triceps");
                Exercise pushdownSingle = createExercise("Single-Arm Cable Pushdowns", "Isolation unilateral tricep...",
                                "video_url", "Triceps");
                Exercise kickbacks = createExercise("Dumbbell Kickbacks", "End range tricep tension...", "video_url",
                                "Triceps");
                Exercise jmPress = createExercise("JM Press", "Bench press extension hybrid...", "video_url",
                                "Triceps");
                Exercise ohExtCable = createExercise("Overhead Cable Extension (Rope)",
                                "Consistent tension tricep stretch...", "video_url", "Triceps");

                // Biceps
                Exercise curlBB = createExercise("Barbell Curl", "Primary bicep mass builder...", "video_url",
                                "Biceps");
                Exercise curlEZ = createExercise("EZ Bar Curl", "Easier on wrists bicep curl...", "video_url",
                                "Biceps");
                Exercise curlDB = createExercise("Dumbbell Bicep Curls", "Standard alternating curls...", "video_url",
                                "Biceps");
                Exercise curlHammer = createExercise("Hammer Curls", "Brachialis and mass builder...", "video_url",
                                "Biceps/Forearms");
                Exercise curlInc = createExercise("Incline Dumbbell Curls", "Bicep stretch emphasis...", "video_url",
                                "Biceps");
                Exercise curlPreacher = createExercise("Preacher Curls", "Strict bicep isolation...", "video_url",
                                "Biceps");
                Exercise curlConc = createExercise("Concentration Curls", "Peak bicep contraction...", "video_url",
                                "Biceps");
                Exercise curlCable = createExercise("Cable Bicep Curls", "Constant tension curls...", "video_url",
                                "Biceps");
                Exercise curlBayesian = createExercise("Baynesian Curls", "Bicep stretch with cables...", "video_url",
                                "Biceps");
                Exercise curlSpider = createExercise("Spider Curls", "Anti-cheat bicep work...", "video_url", "Biceps");
                Exercise curlRev = createExercise("Reverse Curls", "Brachialis and forearm focus...", "video_url",
                                "Biceps/Forearms");
                Exercise curlZottman = createExercise("Zottman Curls", "Twist for full arm develop...", "video_url",
                                "Biceps/Forearms");
                Exercise curl21s = createExercise("21s (Barbell Variation)", "High volume pump curls...", "video_url",
                                "Biceps");
                Exercise curlChinupBicep = createExercise("Chin-Ups (Bicep focus)", "Bodyweight bicep builder...",
                                "video_url", "Biceps/Back");
                Exercise curlDrag = createExercise("Drag Curls", "Strict bicep curl variation...", "video_url",
                                "Biceps");
                Exercise curlHammerCross = createExercise("Cross-Body Hammer Curls", "Brachialis isolation...",
                                "video_url", "Biceps/Forearms");
                Exercise curlWaiter = createExercise("Waiter Curls", "Bicep peak emphasis...", "video_url", "Biceps");
                Exercise curlPlate = createExercise("Plate Curls", "Grip and bicep work...", "video_url",
                                "Biceps/Forearms");

                // 6. Abs & Core
                Exercise plank = createExercise("Plank", "Fundamental core stability...", "video_url", "Abs/Core");
                Exercise sidePlank = createExercise("Side Plank", "Oblique core stability...", "video_url", "Abs/Core");
                Exercise crunches = createExercise("Crunches", "Upper ab focus...", "video_url", "Abs");
                Exercise situps = createExercise("Sit-Ups", "Full ab work...", "video_url", "Abs");
                Exercise legRaiseHanging = createExercise("Hanging Leg Raises", "Lower ab builder...", "video_url",
                                "Abs");
                Exercise legRaiseCaptain = createExercise("Captains Chair Leg Raises", "Supported lower ab work...",
                                "video_url", "Abs");
                Exercise legRaiseLying = createExercise("Lying Leg Raises", "Lower ab floor move...", "video_url",
                                "Abs");
                Exercise bicycleCrunch = createExercise("Bicycle Crunches", "Oblique and ab combo...", "video_url",
                                "Abs/Obliques");
                Exercise russiantwist = createExercise("Russian Twists (Weighted)", "Oblique rotation work...",
                                "video_url", "Abs/Obliques");
                Exercise cableCrunch = createExercise("Cable Crunches (Kneeling)", "Heavy ab loading...", "video_url",
                                "Abs");
                Exercise woodchopHL = createExercise("Woodchoppers (High-to-Low)", "Diagonal oblique power...",
                                "video_url", "Abs/Obliques");
                Exercise woodchopLH = createExercise("Woodchoppers (Low-to-High)", "Diagonal lifting power...",
                                "video_url", "Abs/Obliques");
                Exercise abWheel = createExercise("Ab Wheel Rollouts", "Anti-extension core move...", "video_url",
                                "Abs/Core");
                Exercise vUps = createExercise("V-Ups", "Intense full ab contraction...", "video_url", "Abs");
                Exercise flutterKicks = createExercise("Flutter Kicks", "Lower ab endurance...", "video_url", "Abs");
                Exercise mountainClimber = createExercise("Mountain Climbers", "Core and cardio work...", "video_url",
                                "Abs/FullBody");
                Exercise revCrunch = createExercise("Reverse Crunches", "Lower ab isolation move...", "video_url",
                                "Abs");
                Exercise dragonFlag = createExercise("Dragon Flags", "Extreme core strength move...", "video_url",
                                "Abs/Core");
                Exercise lSit = createExercise("L-Sit (Hold)", "Static core power...", "video_url", "Abs/Core");
                Exercise pallofPress = createExercise("Pallof Press", "Anti-rotation stability...", "video_url",
                                "Abs/Core");
                Exercise decSitupWeighted = createExercise("Weighted Decline Sit-Ups", "Heavy ab builder...",
                                "video_url", "Abs");
                Exercise deadBug = createExercise("Dead Bugs", "Core coordination stability...", "video_url",
                                "Abs/Core");
                Exercise hollowHold = createExercise("Hollow Body Hold", "Gymnastic core hold...", "video_url",
                                "Abs/Core");
                Exercise toesToBar = createExercise("Toes-to-Bar", "Advanced ab skill move...", "video_url", "Abs");
                Exercise scissorKicks = createExercise("Scissor Kicks", "Ab and hip flexor work...", "video_url",
                                "Abs");
                Exercise swissCrunch = createExercise("Swiss Ball Crunches", "Increased range of motion...",
                                "video_url", "Abs");
                Exercise swissPike = createExercise("Swiss Ball Pike", "Core and shoulder stability...", "video_url",
                                "Abs/Core");
                Exercise vacuum = createExercise("Vacuum Pose", "Internal ab control...", "video_url", "Abs/Core");
                Exercise obliqueVup = createExercise("Oblique V-Ups", "Side ab isolation...", "video_url",
                                "Abs/Obliques");
                Exercise landmine180 = createExercise("Landmine 180s (Twists)", "Core rotation power...", "video_url",
                                "Abs/Obliques");

                // --- Create Workouts ---
                // Push Day (10 Chest + 10 Tricep = 20)
                Workout pushDay = createWorkout("Push Day - Advanced", "Focus on Chest and Triceps.", "ppl", "Hard",
                                500, "75 min", "/push_day.png", 8);
                link(pushDay, benchPress, 4, 10, 300);
                link(pushDay, incBBPress, 3, 12, 300);
                link(pushDay, decBBPress, 3, 12, 300);
                link(pushDay, dbBenchPress, 3, 10, 300);
                link(pushDay, dbIncPress, 3, 12, 300);
                link(pushDay, dbFly, 3, 15, 300);
                link(pushDay, pushups, 3, 20, 300);
                link(pushDay, chestDips, 3, 15, 300);
                link(pushDay, cableCrossHigh, 4, 15, 300);
                link(pushDay, pecDeck, 3, 15, 300);
                link(pushDay, closeGripBench, 4, 10, 300);
                link(pushDay, tricepDips, 3, 12, 300);
                link(pushDay, benchDips, 3, 15, 300);
                link(pushDay, skullCrush, 3, 12, 300);
                link(pushDay, ohExtDB, 3, 15, 300);
                link(pushDay, pushdownRope, 4, 12, 300);
                link(pushDay, pushdownBar, 3, 12, 300);
                link(pushDay, pushdownV, 3, 12, 300);
                link(pushDay, pushdownSingle, 3, 15, 300);
                link(pushDay, kickbacks, 3, 15, 300);

                // Pull Day (10 Back + 10 Bicep = 20)
                Workout pullDay = createWorkout("Pull Day - Advanced", "Focus on Back and Biceps.", "ppl", "Hard", 450,
                                "70 min", "/pull_day.png", 8);
                link(pullDay, deadlift, 3, 8, 300);
                link(pullDay, pullupWide, 3, 10, 300);
                link(pullDay, latPulldownWide, 3, 12, 300);
                link(pullDay, rowBB, 4, 10, 300);
                link(pullDay, rowDB, 3, 12, 300);
                link(pullDay, rowTBar, 3, 10, 300);
                link(pullDay, rowCableV, 3, 12, 300);
                link(pullDay, straightArmPull, 3, 15, 300);
                link(pullDay, chinup, 3, 8, 300);
                link(pullDay, facePulls, 4, 15, 300);
                link(pullDay, curlBB, 4, 10, 300);
                link(pullDay, curlEZ, 3, 12, 300);
                link(pullDay, curlDB, 3, 12, 300);
                link(pullDay, curlHammer, 3, 12, 300);
                link(pullDay, curlInc, 3, 12, 300);
                link(pullDay, curlPreacher, 3, 15, 300);
                link(pullDay, curlConc, 3, 15, 300);
                link(pullDay, curlCable, 3, 15, 300);
                link(pullDay, curlSpider, 3, 15, 300);
                link(pullDay, curlRev, 3, 15, 300);

                // Leg Day (10 Leg + 10 Shoulder = 20)
                Workout legDay = createWorkout("Leg Day - Power", "Focus on Legs and Shoulders.", "ppl", "V-Hard", 600,
                                "90 min", "/leg_day.png", 8);
                link(legDay, squatBack, 4, 8, 300);
                link(legDay, legPress, 4, 12, 300);
                link(legDay, hackSquat, 3, 10, 300);
                link(legDay, bulgarianSquat, 3, 12, 300);
                link(legDay, rdlBB, 4, 10, 300);
                link(legDay, legExtension, 3, 15, 300);
                link(legDay, legCurlLying, 3, 15, 300);
                link(legDay, calfRaiseStanding, 4, 20, 300);
                link(legDay, stepUps, 3, 12, 300);
                link(legDay, squatGoblet, 3, 15, 300);
                link(legDay, milPress, 4, 8, 300);
                link(legDay, dbShoulderPress, 3, 10, 300);
                link(legDay, arnoldPress, 3, 12, 300);
                link(legDay, latRaiseDB, 4, 15, 300);
                link(legDay, latRaiseCable, 3, 15, 300);
                link(legDay, frontRaiseDB, 3, 12, 300);
                link(legDay, revFlyDB, 4, 15, 300);
                link(legDay, shrugBB, 4, 15, 300);
                link(legDay, uprightRowBB, 3, 12, 300);
                link(legDay, pushPress, 3, 8, 300);

                Workout fullBody = createWorkout("Full Body - Foundation", "Perfect for beginners or consistency.",
                                "full_body", "Easy", 350, "45 min", "/full_body.png", 8);
                link(fullBody, squatGoblet, 3, 12, 300);
                link(fullBody, pushups, 3, 15, 300);
                link(fullBody, latPulldownWide, 3, 12, 300);
                link(fullBody, milPress, 3, 10, 300);
                link(fullBody, plank, 3, 0, 60);

                Workout hiitAbs = createWorkout("Core & HIIT Blast", "High intensity metabolic work.", "full_body",
                                "Medium", 400, "30 min", "/hiit_abs.png", 6);
                link(hiitAbs, mountainClimber, 4, 0, 45);
                link(hiitAbs, legRaiseHanging, 3, 15, 300);
                link(hiitAbs, bicycleCrunch, 3, 20, 300);
                link(hiitAbs, vUps, 3, 15, 300);
                link(hiitAbs, mountainClimber, 4, 15, 0); // burpees? wait, I didn't add burpees. I'll add them or swap.
                // Swap burpees for mountain climber variant or something added
                link(hiitAbs, flutterKicks, 4, 0, 30);

                // --- Single Muscle Workouts ---

                // Day 1: Chest (12 Exercises)
                Workout chestDay = createWorkout("Chest Day", "Ultimate Chest Volumizer", "single_muscle",
                                "Intermediate", 600, "1 Hr 15 Min", "/push_day.png", 10);
                link(chestDay, benchPress, 4, 10, 300);
                link(chestDay, machinePress, 3, 12, 180);
                link(chestDay, smithBench, 3, 10, 240);
                link(chestDay, dbFly, 4, 15, 180);
                link(chestDay, dbIncFly, 3, 15, 180);
                link(chestDay, pecDeck, 3, 15, 180);
                link(chestDay, cableFlyMid, 3, 15, 180);
                link(chestDay, chestDips, 3, 15, 180);
                link(chestDay, pushups, 3, 20, 120);
                link(chestDay, dbPullover, 3, 12, 180);

                // Day 2: Back (12 Exercises)
                Workout backDay = createWorkout("Back Day", "Back Thickness & Width", "single_muscle", "Intermediate",
                                700, "1 Hr 20 Min", "/pull_day.png", 10);
                link(backDay, deadlift, 4, 6, 360);
                link(backDay, pullupWide, 4, 10, 240);
                link(backDay, latPulldownWide, 4, 12, 180);
                link(backDay, latPulldownVBar, 3, 12, 180);
                link(backDay, rowBB, 4, 10, 240);
                link(backDay, rowTBar, 3, 10, 240);
                link(backDay, rowDB, 3, 12, 180);
                link(backDay, rowCableV, 3, 12, 180);
                link(backDay, straightArmPull, 3, 15, 120);
                link(backDay, facePulls, 4, 15, 120);
                link(backDay, hyperext, 3, 15, 120);
                link(backDay, chinup, 2, 10, 180);

                // Day 3: Shoulders (10 Exercises)
                Workout shoulderDay = createWorkout("Shoulder Day", "Boulder Shoulders", "single_muscle",
                                "Intermediate", 550, "1 Hr", "/push_day.png", 10);
                link(shoulderDay, milPress, 4, 8, 240);
                link(shoulderDay, dbShoulderPress, 4, 10, 240);
                link(shoulderDay, arnoldPress, 3, 12, 180);
                link(shoulderDay, latRaiseDB, 4, 15, 120);
                link(shoulderDay, latRaiseCable, 3, 15, 120);
                link(shoulderDay, frontRaiseDB, 3, 12, 120);
                link(shoulderDay, frontRaisePlate, 3, 12, 120);
                link(shoulderDay, revFlyDB, 4, 15, 120);
                link(shoulderDay, uprightRowBB, 3, 12, 180);
                link(shoulderDay, shrugBB, 4, 15, 120);

                // Day 4: Legs (12 Exercises)
                Workout singleLegDay = createWorkout("Leg Day", "Leg Annihilation", "single_muscle", "Advanced", 800,
                                "1 Hr 30 Min", "/leg_day.png", 10);
                link(singleLegDay, squatBack, 4, 8, 360);
                link(singleLegDay, squatFront, 3, 10, 240);
                link(singleLegDay, legPress, 4, 12, 240);
                link(singleLegDay, hackSquat, 3, 10, 240);
                link(singleLegDay, lungesDB, 3, 12, 180);
                link(singleLegDay, lungesWalking, 2, 20, 180);
                link(singleLegDay, squatGoblet, 3, 12, 180);
                link(singleLegDay, rdlBB, 4, 10, 240);
                link(singleLegDay, legCurlLying, 4, 15, 180);
                link(singleLegDay, legExtension, 4, 15, 180);
                link(singleLegDay, calfRaiseStanding, 4, 20, 120);
                link(singleLegDay, calfRaiseSeated, 3, 20, 120);

                // Day 5: Arms (14 Exercises)
                Workout armDay = createWorkout("Arm Day", "Sleeve Buster", "single_muscle", "Intermediate", 600,
                                "1 Hr 15 Min", "/pull_day.png", 10);
                // Biceps
                link(armDay, bicepCurl, 4, 10, 180);
                link(armDay, ezCurl, 3, 12, 180);
                link(armDay, hammerCurl, 3, 12, 180);
                link(armDay, incDbCurl, 3, 12, 180);
                link(armDay, preacherCurl, 3, 12, 180);
                link(armDay, ropeHammer, 3, 15, 120);
                link(armDay, concCurl, 3, 15, 120);
                // Triceps
                link(armDay, closeGripBench, 4, 10, 240);
                link(armDay, skullCrush, 3, 12, 180);
                link(armDay, pushdownRope, 4, 12, 120);
                link(armDay, ohExtDB, 3, 12, 180);
                link(armDay, pushdownRope, 3, 15, 120);
                link(armDay, tricepDips, 3, 15, 180); // Weighted if possible
                link(armDay, benchDips, 2, 15, 120);

                // --- Full Body Workouts ("full_body") ---

                // Full Body A (High Volume - Focus on Compound) ~25 Exercises
                Workout fullBodyA = createWorkout("Full Body Destroyer A", "Complete Body Annihilation", "full_body",
                                "Expert", 1200, "2 Hrs", "/pull_day.png", 15);
                // Chest
                link(fullBodyA, benchPress, 4, 10, 240);
                link(fullBodyA, incBBPress, 3, 12, 180);
                link(fullBodyA, dbFly, 3, 15, 120);
                link(fullBodyA, pushups, 3, 20, 120);
                // Back
                link(fullBodyA, deadlift, 3, 8, 300);
                link(fullBodyA, pullupWide, 3, 10, 180);
                link(fullBodyA, latPulldownWide, 3, 12, 180);
                link(fullBodyA, rowBB, 3, 10, 180);
                link(fullBodyA, rowCableV, 3, 12, 120);
                // Legs
                link(fullBodyA, squatBack, 4, 10, 300);
                link(fullBodyA, legPress, 3, 15, 240);
                link(fullBodyA, lungesDB, 3, 20, 180);
                link(fullBodyA, legExtension, 3, 15, 120);
                link(fullBodyA, legCurlLying, 3, 15, 120);
                // Shoulders
                link(fullBodyA, milPress, 4, 10, 180);
                link(fullBodyA, latRaiseDB, 3, 15, 120);
                link(fullBodyA, facePulls, 3, 15, 120);
                link(fullBodyA, shrugBB, 3, 15, 120);
                // Arms
                link(fullBodyA, bicepCurl, 3, 12, 120);
                link(fullBodyA, hammerCurl, 3, 12, 120);
                link(fullBodyA, pushdownRope, 3, 15, 120);
                link(fullBodyA, skullCrush, 3, 12, 120);
                link(fullBodyA, tricepDips, 3, 15, 120);

                // Full Body B (High Volume - Focus on Isolation/Machines) ~25 Exercises
                Workout fullBodyB = createWorkout("Full Body Destroyer B", "Machine & Isolation Focus", "full_body",
                                "Expert", 1100, "2 Hrs", "/push_day.png", 15);
                // Legs Start
                link(fullBodyB, hackSquat, 4, 10, 240);
                link(fullBodyB, squatGoblet, 3, 15, 180);
                link(fullBodyB, rdlBB, 4, 10, 240);
                link(fullBodyB, calfRaiseStanding, 4, 20, 120);
                // Chest
                link(fullBodyB, smithBench, 4, 10, 240);
                link(fullBodyB, machinePress, 3, 12, 180);
                link(fullBodyB, pecDeck, 3, 15, 120);
                link(fullBodyB, cableFlyMid, 3, 15, 120);
                // Back
                link(fullBodyB, rowTBar, 4, 10, 240);
                link(fullBodyB, latPulldownVBar, 3, 12, 180);
                link(fullBodyB, straightArmPull, 3, 15, 120);
                link(fullBodyB, hyperext, 3, 15, 120);
                link(fullBodyB, rowDB, 3, 12, 180);
                // Shoulders
                link(fullBodyB, dbShoulderPress, 4, 10, 180);
                link(fullBodyB, arnoldPress, 3, 12, 180);
                link(fullBodyB, latRaiseCable, 3, 15, 120);
                link(fullBodyB, uprightRowBB, 3, 12, 120);
                link(fullBodyB, revFlyDB, 3, 15, 120);
                // Arms
                link(fullBodyB, preacherCurl, 3, 12, 120);
                link(fullBodyB, concCurl, 3, 15, 120);
                link(fullBodyB, ropeHammer, 3, 15, 120);
                link(fullBodyB, ohExtDB, 3, 15, 120);
                link(fullBodyB, closeGripBench, 3, 10, 180);
                link(fullBodyB, benchDips, 3, 20, 120);

                // --- EXPLORE PROGRAMS ---

                // 1. Hypertrophy (Muscle Growth) - Uses standard gym exercises
                Workout hypertrophyProg = createWorkout("Hypertrophy Master", "Max Muscle Growth", "program",
                                "Advanced", 800, "1 Hr 30 Min", "/hypertrophy.png", 8);
                link(hypertrophyProg, benchPress, 4, 10, 240);
                link(hypertrophyProg, squatBack, 4, 10, 300);
                link(hypertrophyProg, deadlift, 3, 8, 300);
                link(hypertrophyProg, milPress, 4, 10, 240);
                link(hypertrophyProg, rowBB, 4, 10, 240);
                link(hypertrophyProg, incBBPress, 3, 12, 180);
                link(hypertrophyProg, legPress, 3, 15, 240);
                link(hypertrophyProg, lungesWalking, 3, 20, 180);
                link(hypertrophyProg, latPulldownWide, 3, 12, 180);
                link(hypertrophyProg, bicepCurl, 3, 12, 120);
                link(hypertrophyProg, pushdownRope, 3, 15, 120);
                link(hypertrophyProg, latRaiseDB, 4, 15, 120);

                activityRepository.save(Activity.builder()
                                .title("Hypertrophy Workout")
                                .time("1 Hr 30 Min")
                                .calories("800 cal")
                                .image("/hypertrophy.png")
                                .gradient("linear-gradient(135deg, #f87171, #fca5a5)")
                                .description("Focus on muscle hypertrophy (growth) with this scientifically designed program. Hits every muscle group with optimal volume.")
                                .benefits(List.of("Maximize Muscle Size", "Increase Strength", "Aesthetic Physique",
                                                "Metabolic Boost"))
                                .schedule(List.of("Flexible Schedule"))
                                .instructorName("Arnold S.")
                                .instructorRole("Bodybuilding Legend")
                                .instructorImage("/trainer1.png")
                                .linkedWorkoutId(hypertrophyProg.getId())
                                .category("PROGRAM")
                                .build());

                // 2. Women's Workout (Glute Focus)
                // Use existing definitions where possible

                Workout womensProg = createWorkout("Glute & Tone", "Booty Building & Toning", "program", "Intermediate",
                                600, "1 Hr", "/womens_workout.png", 8);
                link(womensProg, hipThrust, 4, 12, 240);
                link(womensProg, squatBack, 4, 12, 240);
                link(womensProg, rdlBB, 4, 12, 240);
                link(womensProg, bulgarianSquat, 3, 12, 180);
                link(womensProg, lungesWalking, 3, 20, 180);
                link(womensProg, cablePullThrough, 3, 15, 120); // Replacement for gluteKickback
                link(womensProg, squatGoblet, 3, 15, 120);
                link(womensProg, latPulldownWide, 3, 15, 120); // Tone upper
                link(womensProg, dbShoulderPress, 3, 15, 120);
                link(womensProg, plank, 3, 60, 60);

                activityRepository.save(Activity.builder()
                                .title("Women's Workouts")
                                .time("1 Hr")
                                .calories("600 cal")
                                .image("/womens_workout.png")
                                .gradient("linear-gradient(135deg, #fbbf24, #fcd34d)")
                                .description("Designed specifically for women's fitness goals, focusing on glute development, core strength, and overall toning.")
                                .benefits(List.of("Glute Growth", "Core Stability", "Toned Arms", "Fat Loss"))
                                .schedule(List.of("Flexible Schedule"))
                                .instructorName("Kayla I.")
                                .instructorRole("Women's Fitness Coach")
                                .instructorImage("/trainer3.png")
                                .linkedWorkoutId(womensProg.getId())
                                .category("PROGRAM")
                                .build());

                // 3. Lose Weight (Fat Burn Wrapper) - Create NEW cardio exercises here since
                // variables aren't shared
                Exercise jumpingJack = createExercise("Jumping Jacks", "Cardio", "video_url", "Cardio");
                Exercise mtnClimber = createExercise("Mountain Climbers", "Cardio", "video_url", "Core");
                Exercise burpee = createExercise("Burpees", "Full body", "video_url", "Full Body");

                Workout weightLossProg = createWorkout("Rapid Fat Loss", "HIIT & Cardio Circuit", "program",
                                "Intermediate", 700, "45 Min", "/weight_loss.png", 8);
                link(weightLossProg, jumpingJack, 3, 50, 60);
                link(weightLossProg, burpee, 3, 15, 60);
                link(weightLossProg, mtnClimber, 3, 40, 60);
                link(weightLossProg, squatGoblet, 3, 20, 60); // High rep bodyweight/light weight
                link(weightLossProg, pushups, 3, 15, 60);
                link(weightLossProg, lungesDB, 3, 20, 60);
                link(weightLossProg, plank, 3, 45, 60);

                activityRepository.save(Activity.builder()
                                .title("Lose Weight")
                                .time("45 Min")
                                .calories("700 cal")
                                .image("/weight_loss.png")
                                .gradient("linear-gradient(135deg, #34d399, #10b981)")
                                .description("High intensity interval training combined with compound movements to maximize calorie burn and metabolic rate.")
                                .benefits(List.of("Maximize Calorie Burn", "Boost Metabolism", "Save Time",
                                                "Full Body Tone"))
                                .schedule(List.of("Flexible Schedule"))
                                .instructorName("Greg P.")
                                .instructorRole("HIIT Instructor")
                                .instructorImage("/trainer2.png")
                                .linkedWorkoutId(weightLossProg.getId())
                                .category("PROGRAM")
                                .build());

                // 4. Definition (Shredded)
                Workout definitionProg = createWorkout("Shredded Physique", "Isolation & Definition", "program",
                                "Advanced", 500, "1 Hr 15 Min", "/definition.png", 8);
                link(definitionProg, cableCrossHigh, 4, 15, 120); // Changed from cableFlyMid
                link(definitionProg, latRaiseDB, 4, 20, 120);
                link(definitionProg, legExtension, 4, 20, 120);
                link(definitionProg, legCurlLying, 4, 20, 120);
                link(definitionProg, concCurl, 4, 15, 120);
                link(definitionProg, pushdownRope, 4, 15, 120);
                link(definitionProg, pecDeck, 4, 15, 120);
                link(definitionProg, calfRaiseStanding, 5, 20, 60);

                activityRepository.save(Activity.builder()
                                .title("Definition")
                                .time("1 Hr 15 Min")
                                .calories("500 cal")
                                .image("/definition.png")
                                .gradient("linear-gradient(135deg, #60a5fa, #3b82f6)")
                                .description("Carve out details with this isolation-heavy routine. Perfect for those looking to enhance muscle separation and definition.")
                                .benefits(List.of("Muscle Definition", "Vascularity", "Aesthetics", "Low Impact"))
                                .schedule(List.of("Flexible Schedule"))
                                .instructorName("Jeff S.")
                                .instructorRole("Aesthetics Coach")
                                .instructorImage("/trainer1.png")
                                .linkedWorkoutId(definitionProg.getId())
                                .category("PROGRAM")
                                .build());

                // 5. Home Workout (Bodyweight)
                Exercise bwSquat = createExercise("Bodyweight Squats", "No weight", "video_url", "Legs");
                Exercise bwLunge = createExercise("Bodyweight Lunges", "No weight", "video_url", "Legs");

                Workout homeProg = createWorkout("Home Bodyweight", "No Gym Required", "program", "Beginner", 400,
                                "45 Min", "/home_workout.png", 8);
                link(homeProg, pushups, 3, 20, 60);
                link(homeProg, bwSquat, 3, 25, 60);
                link(homeProg, bwLunge, 3, 20, 60);
                link(homeProg, plank, 3, 60, 60);
                link(homeProg, burpee, 3, 10, 60);
                link(homeProg, jumpingJack, 3, 50, 60);
                link(homeProg, benchDips, 3, 15, 60); // Using chair

                activityRepository.save(Activity.builder()
                                .title("Home Workout")
                                .time("45 Min")
                                .calories("400 cal")
                                .image("/home_workout.png")
                                .gradient("linear-gradient(135deg, #818cf8, #6366f1)")
                                .description("Stay fit without leaving your house. This full-body routine uses only your bodyweight to build strength and endurance.")
                                .benefits(List.of("No Equipment", "Time Efficient", "Space Saving", "Full Body"))
                                .schedule(List.of("Flexible Schedule"))
                                .instructorName("Chris H.")
                                .instructorRole("Calisthenics Expert")
                                .instructorImage("/trainer4.png")
                                .linkedWorkoutId(homeProg.getId())
                                .category("PROGRAM")
                                .build());

                // 6. Strength Training (Powerlifting)
                Workout strengthProg = createWorkout("Powerlifting Basics", "Raw Strength Focus", "program", "Expert",
                                600, "1 Hr 30 Min", "/hypertrophy.png", 8);
                link(strengthProg, squatBack, 5, 5, 300);
                link(strengthProg, benchPress, 5, 5, 300);
                link(strengthProg, deadlift, 5, 5, 360);
                link(strengthProg, milPress, 5, 5, 240);
                link(strengthProg, rowBB, 5, 5, 240);

                activityRepository.save(Activity.builder()
                                .title("Strength Training")
                                .time("1 Hr 30 Min")
                                .calories("600 cal")
                                .image("/hypertrophy.png")
                                .gradient("linear-gradient(135deg, #a78bfa, #8b5cf6)")
                                .description("Focus on the 'Big 3' lifts to maximize raw power and strength. Low reps, heavy weight, and long rest periods.")
                                .benefits(List.of("Max Strength", "Bone Density", "CNS Adaptation", "Muscle Hardness"))
                                .schedule(List.of("Flexible Schedule"))
                                .instructorName("Eddie H.")
                                .instructorRole("Strongman")
                                .instructorImage("/trainer2.png")
                                .linkedWorkoutId(strengthProg.getId())
                                .category("PROGRAM")
                                .build());

                System.out.println("Seeding Complete.");
        }

        private void createActivities() {
                if (activityRepository.count() > 0)
                        return;

                // --- 1. ZUMBA ---
                Exercise z1 = createExercise("Zumba Warm-up", "Basic marching and arm swings", "video_url", "Cardio");
                Exercise z2 = createExercise("Salsa Step", "Basic salsa side-to-side", "video_url", "Cardio");
                Exercise z3 = createExercise("Merengue March", "Fast marching with hip action", "video_url", "Cardio");
                Exercise z4 = createExercise("Reggaeton Bounce", "Deep squat bounce", "video_url", "Legs");
                Exercise z5 = createExercise("Cumbia Sleep", "Side step with arm drag", "video_url", "Cardio");
                Exercise z6 = createExercise("Beto Shuffle", "Quick feet shuffle", "video_url", "Cardio");
                Exercise z7 = createExercise("Destroza", "Hip isolation movement", "video_url", "Core");
                Exercise z8 = createExercise("Quebradita", "Jump kick movement", "video_url", "Legs");
                Exercise z9 = createExercise("Soca Whine", "Hip rotation", "video_url", "Core");
                Exercise z10 = createExercise("Calypso Jump", "High energy jumping", "video_url", "Cardio");
                Exercise z11 = createExercise("Bhangra Arms", "High arms with leg lift", "video_url", "Shoulders");
                Exercise z12 = createExercise("Flamenco Tap", "Heel tapping prowess", "video_url", "Calves");
                Exercise z13 = createExercise("Tango Lunge", "Dramatic side lunge", "video_url", "Legs");
                Exercise z14 = createExercise("Samba Roll", "Body roll movement", "video_url", "Core");
                Exercise z15 = createExercise("Belly Dance Shimmy", "Fast shoulder shake", "video_url", "Core");
                Exercise z16 = createExercise("Cha-Cha-Cha", "Forward back step", "video_url", "Cardio");
                Exercise z17 = createExercise("Mambo Front", "Front step touch", "video_url", "Cardio");
                Exercise z18 = createExercise("Bachata Hip", "Subtle hip pop", "video_url", "Core");
                Exercise z19 = createExercise("Axe Sway", "Side sway with lunges", "video_url", "Legs");
                Exercise z20 = createExercise("Dembow Beat", "Hard hitting squat pulse", "video_url", "Legs");
                Exercise z21 = createExercise("Kizomba Slow", "Slow partner-style step", "video_url", "Cardio");
                Exercise z22 = createExercise("Jive Kick", "Fast kick out", "video_url", "Legs");
                Exercise z23 = createExercise("Swing Step", "Wide stance step", "video_url", "Cardio");
                Exercise z24 = createExercise("Cool Down Stretch", "Full body stretch", "video_url", "Recovery");
                Exercise z25 = createExercise("Deep Breath", "Inhale exhale flow", "video_url", "Recovery");

                Workout zumbaWorkout = createWorkout("Zumba High Energy Class", "Official Zumba Routine",
                                "activity_class", "Intermediate", 500, "1 Hr", "/zumba.png", 8);

                link(zumbaWorkout, z1, 1, 0, 180);
                link(zumbaWorkout, z2, 1, 0, 120);
                link(zumbaWorkout, z3, 1, 0, 120);
                link(zumbaWorkout, z4, 1, 0, 120);
                link(zumbaWorkout, z5, 1, 0, 120);
                link(zumbaWorkout, z6, 1, 0, 60);
                link(zumbaWorkout, z7, 1, 0, 120);
                link(zumbaWorkout, z8, 1, 0, 120);
                link(zumbaWorkout, z9, 1, 0, 120);
                link(zumbaWorkout, z10, 1, 0, 60);
                link(zumbaWorkout, z11, 1, 0, 120);
                link(zumbaWorkout, z12, 1, 0, 120);
                link(zumbaWorkout, z13, 1, 0, 120);
                link(zumbaWorkout, z14, 1, 0, 120);
                link(zumbaWorkout, z15, 1, 0, 60);
                link(zumbaWorkout, z16, 1, 0, 120);
                link(zumbaWorkout, z17, 1, 0, 120);
                link(zumbaWorkout, z18, 1, 0, 120);
                link(zumbaWorkout, z19, 1, 0, 120);
                link(zumbaWorkout, z20, 1, 0, 120);
                link(zumbaWorkout, z21, 1, 0, 120);
                link(zumbaWorkout, z22, 1, 0, 60);
                link(zumbaWorkout, z23, 1, 0, 120);
                link(zumbaWorkout, z24, 1, 0, 180);
                link(zumbaWorkout, z25, 1, 0, 120);

                activityRepository.save(Activity.builder()
                                .title("Zumba")
                                .time("1 Hr")
                                .calories("400-600 cal")
                                .image("/zumba.png")
                                .gradient("linear-gradient(135deg, #f093fb, #f5576c)")
                                .description("Zumba is a fitness program that involves cardio and Latin-inspired dance. It was founded by Colombian dancer and choreographer Beto Pérez in 2001. It is a fun, high-energy workout that feels more like a party than exercise.")
                                .benefits(List.of("Full Body Workout", "Boosts Heart Health", "Improves Coordination",
                                                "Mood Booster"))
                                .schedule(List.of("Mon - 6:00 PM", "Wed - 7:00 PM", "Fri - 6:00 PM"))
                                .instructorName("Sarah Jenkins")
                                .instructorRole("Lead Zumba Instructor")
                                .instructorImage("/trainer1.png")
                                .linkedWorkoutId(zumbaWorkout.getId())
                                .category("CLASS")
                                .build());

                // --- 2. Cardio Blast ---
                Exercise c1 = createExercise("Jumping Jacks", "Classic cardio move", "video_url", "Cardio");
                Exercise c2 = createExercise("High Knees", "Run in place high knees", "video_url", "Cardio");
                Exercise c3 = createExercise("Burpees", "Full body explosive move", "video_url", "Full Body");
                Exercise c4 = createExercise("Mountain Climbers", "Knees to chest in plank", "video_url", "Core");
                Exercise c5 = createExercise("Squat Jumps", "Explosive squats", "video_url", "Legs");
                Exercise c6 = createExercise("Lunge Jumps", "Alternating jumping lunges", "video_url", "Legs");
                Exercise c7 = createExercise("Butt Kicks", "Heels to glutes jogging", "video_url", "Cardio");
                Exercise c8 = createExercise("Skaters", "Side to side hops", "video_url", "Legs");
                Exercise c9 = createExercise("Plank Jacks", "Jumping jack legs in plank", "video_url", "Core");
                Exercise c10 = createExercise("Box Jumps", "Jump onto box (or imaginary)", "video_url", "Legs");
                Exercise c11 = createExercise("Tuck Jumps", "Knees to chest jump", "video_url", "Core");
                Exercise c12 = createExercise("Fast Feet", "Rapid shallow running", "video_url", "Cardio");
                Exercise c13 = createExercise("Lateral Shuffles", "Side to side shuffle", "video_url", "Cardio");
                Exercise c14 = createExercise("Star Jumps", "Explosive jack in air", "video_url", "Full Body");
                Exercise c15 = createExercise("Inchworms", "Walk out to plank and back", "video_url", "Core");
                Exercise c16 = createExercise("Bear Crawls", "Crawl on fours", "video_url", "Full Body");
                Exercise c17 = createExercise("Crab Walk", "Reverse crawl", "video_url", "Full Body");
                Exercise c18 = createExercise("Frog Jumps", "Touch floor and jump", "video_url", "Legs");
                Exercise c19 = createExercise("Kickboxing Hooks", "Shadow boxing hooks", "video_url", "Upper Body");
                Exercise c20 = createExercise("Uppercuts", "Shadow boxing uppercuts", "video_url", "Upper Body");
                Exercise c21 = createExercise("Speed Skaters", "Fast low skaters", "video_url", "Legs");
                Exercise c22 = createExercise("Heisman Shuffle", "Side step knee drive", "video_url", "Cardio");
                Exercise c23 = createExercise("Switch Kicks", "Alternating front kicks", "video_url", "Cardio");
                Exercise c24 = createExercise("Sprint in Place", "Max effort sprint", "video_url", "Cardio");
                Exercise c25 = createExercise("Cool Down Walk", "Slow walking", "video_url", "Recovery");

                Workout cardioWorkout = createWorkout("Cardio Blast Intensity", "HIIT Cardio Session", "activity_class",
                                "Advanced", 700, "45 Min", "/cardio.png", 8);

                link(cardioWorkout, c1, 1, 0, 60);
                link(cardioWorkout, c2, 1, 0, 45);
                link(cardioWorkout, c3, 1, 0, 45);
                link(cardioWorkout, c4, 1, 0, 45);
                link(cardioWorkout, c5, 1, 0, 45);
                link(cardioWorkout, c6, 1, 0, 45);
                link(cardioWorkout, c7, 1, 0, 60);
                link(cardioWorkout, c8, 1, 0, 45);
                link(cardioWorkout, c9, 1, 0, 45);
                link(cardioWorkout, c10, 1, 0, 45);
                link(cardioWorkout, c11, 1, 0, 30);
                link(cardioWorkout, c12, 1, 0, 60);
                link(cardioWorkout, c13, 1, 0, 60);
                link(cardioWorkout, c14, 1, 0, 30);
                link(cardioWorkout, c15, 1, 0, 60);
                link(cardioWorkout, c16, 1, 0, 60);
                link(cardioWorkout, c17, 1, 0, 60);
                link(cardioWorkout, c18, 1, 0, 45);
                link(cardioWorkout, c19, 1, 0, 60);
                link(cardioWorkout, c20, 1, 0, 60);
                link(cardioWorkout, c21, 1, 0, 45);
                link(cardioWorkout, c22, 1, 0, 45);
                link(cardioWorkout, c23, 1, 0, 45);
                link(cardioWorkout, c24, 1, 0, 30);
                link(cardioWorkout, c25, 1, 0, 180);

                activityRepository.save(Activity.builder()
                                .title("Cardio Blast")
                                .time("45 Min")
                                .calories("500 cal")
                                .image("/cardio.png")
                                .gradient("linear-gradient(135deg, #4facfe, #00f2fe)")
                                .description("High-intensity interval training (HIIT) focused on cardiovascular endurance. Expect running, jumping, and quick movements to get your heart rate up.")
                                .benefits(List.of("Burn Calories Fast", "Improve Stamina", "Heart Health",
                                                "No Equipment Needed"))
                                .schedule(List.of("Tue - 7:00 AM", "Thu - 7:00 AM", "Sat - 9:00 AM"))
                                .instructorName("Mike Ross")
                                .instructorRole("Cardio Specialist")
                                .instructorImage("/trainer2.png")
                                .linkedWorkoutId(cardioWorkout.getId())
                                .category("CLASS")
                                .build());

                // --- 3. Power Yoga ---
                Exercise y1 = createExercise("Child's Pose", "Resting pose", "video_url", "Flexibility");
                Exercise y2 = createExercise("Cat-Cow", "Spine warmup", "video_url", "Flexibility");
                Exercise y3 = createExercise("Downward Dog", "Inverted V pose", "video_url", "Flexibility");
                Exercise y4 = createExercise("Ragdoll", "Forward fold relax", "video_url", "Flexibility");
                Exercise y5 = createExercise("Sun Salutation A", "Flow sequence", "video_url", "Full Body");
                Exercise y6 = createExercise("Sun Salutation B", "Flow sequence with chair", "video_url", "Full Body");
                Exercise y7 = createExercise("Warrior I", "Lunge with arms up", "video_url", "Legs");
                Exercise y8 = createExercise("Warrior II", "Side lunge arms out", "video_url", "Legs");
                Exercise y9 = createExercise("Reverse Warrior", "Side stretch", "video_url", "Core");
                Exercise y10 = createExercise("Triangle Pose", "Side bend", "video_url", "Legs");
                Exercise y11 = createExercise("Extended Side Angle", "Lunge reach", "video_url", "Core");
                Exercise y12 = createExercise("Chair Pose", "Squat hold", "video_url", "Legs");
                Exercise y13 = createExercise("Tree Pose", "Balance on one leg", "video_url", "Balance");
                Exercise y14 = createExercise("Eagle Pose", "Wrapped limbs balance", "video_url", "Balance");
                Exercise y15 = createExercise("Warrior III", "T-shape balance", "video_url", "Balance");
                Exercise y16 = createExercise("Half Moon", "Side balance", "video_url", "Balance");
                Exercise y17 = createExercise("Plank", "High pushup hold", "video_url", "Core");
                Exercise y18 = createExercise("Chaturanga", "Low pushup hold", "video_url", "nArms");
                Exercise y19 = createExercise("Upward Dog", "Backbend", "video_url", "Back");
                Exercise y20 = createExercise("Boat Pose", "V-sit abs", "video_url", "Core");
                Exercise y21 = createExercise("Bridge Pose", "Hip lift", "video_url", "Glutes");
                Exercise y22 = createExercise("Wheel Pose", "Full backbend", "video_url", "Back");
                Exercise y23 = createExercise("Pigeon Pose", "Hip opener", "video_url", "Hips");
                Exercise y24 = createExercise("Happy Baby", "Hip stretch", "video_url", "Hips");
                Exercise y25 = createExercise("Savasana", "Corpse pose rest", "video_url", "Relaxation");

                Workout yogaWorkout = createWorkout("Power Yoga Flow", "Vinyasa Strength & Flex", "activity_class",
                                "Intermediate", 300, "1 Hr", "/yoga.png", 8);

                link(yogaWorkout, y1, 1, 0, 120);
                link(yogaWorkout, y2, 1, 0, 60);
                link(yogaWorkout, y3, 1, 0, 60);
                link(yogaWorkout, y4, 1, 0, 60);
                link(yogaWorkout, y5, 3, 0, 180);
                link(yogaWorkout, y6, 3, 0, 180);
                link(yogaWorkout, y7, 1, 0, 60);
                link(yogaWorkout, y8, 1, 0, 60);
                link(yogaWorkout, y9, 1, 0, 45);
                link(yogaWorkout, y10, 1, 0, 60);
                link(yogaWorkout, y11, 1, 0, 60);
                link(yogaWorkout, y12, 1, 0, 60);
                link(yogaWorkout, y13, 1, 0, 60);
                link(yogaWorkout, y14, 1, 0, 60);
                link(yogaWorkout, y15, 1, 0, 45);
                link(yogaWorkout, y16, 1, 0, 45);
                link(yogaWorkout, y17, 1, 0, 60);
                link(yogaWorkout, y18, 1, 0, 30);
                link(yogaWorkout, y19, 1, 0, 30);
                link(yogaWorkout, y20, 1, 0, 60);
                link(yogaWorkout, y21, 1, 0, 60);
                link(yogaWorkout, y22, 1, 0, 45);
                link(yogaWorkout, y23, 1, 0, 120);
                link(yogaWorkout, y24, 1, 0, 60);
                link(yogaWorkout, y25, 1, 0, 300);

                activityRepository.save(Activity.builder()
                                .title("Power Yoga")
                                .time("1 Hr")
                                .calories("200-300 cal")
                                .image("/yoga.png")
                                .gradient("linear-gradient(135deg, #a8edea, #fed6e3)")
                                .description("A vigorous fitness-based approach to vinyasa-style yoga. Build strength, flexibility, and concentration through flowing sequences.")
                                .benefits(List.of("Flexibility", "Core Strength", "Stress Relief", "Mental Focus"))
                                .schedule(List.of("Mon - 8:00 AM", "Fri - 8:00 AM"))
                                .instructorName("Emma Stone")
                                .instructorRole("Yoga Master")
                                .instructorImage("/trainer3.png")
                                .linkedWorkoutId(yogaWorkout.getId())
                                .category("CLASS")
                                .build());

                // --- 4. CrossFit ---
                Exercise cf1 = createExercise("Air Squats", "Bodyweight squats", "video_url", "Legs");
                Exercise cf2 = createExercise("Pull-ups (Kipping)", "Dynamic pullups", "video_url", "Back");
                Exercise cf3 = createExercise("Push-ups", "Standard pushups", "video_url", "Chest");
                Exercise cf4 = createExercise("Sit-ups (AbMat)", "Full range sit-ups", "video_url", "Core");
                Exercise cf5 = createExercise("Double Unders", "Jump rope pass twice", "video_url", "Cardio");
                Exercise cf6 = createExercise("Box Jumps", "Explosive jump to box", "video_url", "Legs");
                Exercise cf7 = createExercise("Wall Balls", "Squat and throw ball", "video_url", "Full Body");
                Exercise cf8 = createExercise("Kettlebell Swings", "Hip hinge swing", "video_url", "Hips");
                Exercise cf9 = createExercise("Thrusters", "Squat to overhead press", "video_url", "Full Body");
                Exercise cf10 = createExercise("Burpees", "Chest to floor jump", "video_url", "Full Body");
                Exercise cf11 = createExercise("Toes to Bar", "Hanging leg raise to bar", "video_url", "Core");
                Exercise cf12 = createExercise("Deadlift", "Heavy lift from floor", "video_url", "Back/Legs");
                Exercise cf13 = createExercise("Clean", "Barbell to shoulders", "video_url", "Full Body");
                Exercise cf14 = createExercise("Snatch", "Barbell ground to overhead", "video_url", "Full Body");
                Exercise cf15 = createExercise("Overhead Squat", "Squat with bar overhead", "video_url", "Full Body");
                Exercise cf16 = createExercise("Handstand Push-ups", "Inverted press", "video_url", "Shoulders");
                Exercise cf17 = createExercise("Pistol Squats", "One legged squat", "video_url", "Legs");
                Exercise cf18 = createExercise("Rope Climbs", "Climb rope to ceiling", "video_url", "Back/Arms");
                Exercise cf19 = createExercise("Rowing", "Erg rower sprint", "video_url", "Cardio");
                Exercise cf20 = createExercise("Assault Bike", "Fan bike sprint", "video_url", "Cardio");
                Exercise cf21 = createExercise("Dumbbell Snatch", "One arm snatch", "video_url", "Full Body");
                Exercise cf22 = createExercise("Farmer's Carry", "Heavy walk", "video_url", "Grip");
                Exercise cf23 = createExercise("Lunges (Weighted)", "Walking lunge with weight", "video_url", "Legs");
                Exercise cf24 = createExercise("Muscle-ups", "Pull-up into dip", "video_url", "Upper Body");
                Exercise cf25 = createExercise("Recovery Walk", "Slow walk", "video_url", "Recovery");

                Workout crossFitWorkout = createWorkout("CrossFit WOD", "Workout of the Day: Murph-style",
                                "activity_class", "Expert", 800, "1 Hr", "/crossfit.png", 10);

                link(crossFitWorkout, cf19, 1, 0, 300); // 5 min row
                link(crossFitWorkout, cf1, 3, 20, 300);
                link(crossFitWorkout, cf3, 3, 15, 300);
                link(crossFitWorkout, cf2, 3, 10, 300);
                link(crossFitWorkout, cf4, 3, 20, 300);
                link(crossFitWorkout, cf20, 1, 0, 120); // Bike 2 min
                link(crossFitWorkout, cf9, 3, 15, 300);
                link(crossFitWorkout, cf2, 3, 10, 0); // Fran style
                link(crossFitWorkout, cf12, 3, 5, 300);
                link(crossFitWorkout, cf6, 3, 10, 300);
                link(crossFitWorkout, cf7, 3, 20, 300);
                link(crossFitWorkout, cf5, 3, 50, 300);
                link(crossFitWorkout, cf8, 3, 20, 300);
                link(crossFitWorkout, cf11, 3, 10, 300);
                link(crossFitWorkout, cf10, 3, 15, 300);
                link(crossFitWorkout, cf16, 3, 8, 300);
                link(crossFitWorkout, cf21, 3, 10, 300);
                link(crossFitWorkout, cf22, 1, 0, 60);
                link(crossFitWorkout, cf17, 3, 6, 300);
                link(crossFitWorkout, cf23, 3, 20, 300);
                link(crossFitWorkout, cf18, 2, 1, 300);
                link(crossFitWorkout, cf13, 3, 5, 300);
                link(crossFitWorkout, cf14, 3, 3, 300);
                link(crossFitWorkout, cf15, 3, 5, 300);
                link(crossFitWorkout, cf24, 2, 3, 300);
                link(crossFitWorkout, cf25, 1, 0, 180);

                activityRepository.save(Activity.builder()
                                .title("CrossFit")
                                .time("1 Hr")
                                .calories("600+ cal")
                                .image("/crossfit.png")
                                .gradient("linear-gradient(135deg, #c3cfe2, #c3cfe2)")
                                .description("Constantly varied functional movements performed at high intensity. Includes weightlifting, gymnastics, and metabolic conditioning.")
                                .benefits(List.of("Functional Strength", "High Intensity", "Community", "Endurance"))
                                .schedule(List.of("Daily - 5:00 PM"))
                                .instructorName("Alex Bolt")
                                .instructorRole("CrossFit Coach")
                                .instructorImage("/trainer4.png")
                                .linkedWorkoutId(crossFitWorkout.getId())
                                .category("CLASS")
                                .build());
        }

        private Exercise createExercise(String name, String desc, String video, String muscle) {
                Exercise ex = Exercise.builder()
                                .name(name)
                                .description(desc)
                                .videoUrl(video)
                                .muscleGroup(muscle)
                                .build();

                if (name.equals("Bench Press")) {
                        ex.setStepOneImage("/bench_press_setup.png");
                        ex.setStepOneDescription(
                                        "Lay on a flat bench. Grip the barbell with hands slightly wider than shoulder-width.");
                        ex.setStepTwoImage("/bench_press_execution.png");
                        ex.setStepTwoDescription("Lower the bar slowly to your mid-chest. Push back up explosively.");
                }

                return exerciseRepository.save(ex);
        }

        private Workout createWorkout(String title, String desc, String category, String diff, int cals, String dur,
                        String img, int mandatory) {
                return workoutRepository.save(Workout.builder()
                                .title(title)
                                .description(desc)
                                .category(category)
                                .difficulty(diff)
                                .calories(cals)
                                .duration(dur)
                                .imageUrl(img)
                                .mandatoryExercises(mandatory)
                                .build());
        }

        private void link(Workout w, Exercise e, int sets, int reps, int time) {
                WorkoutExercise we = WorkoutExercise.builder()
                                .workout(w)
                                .exercise(e)
                                .sets(sets)
                                .reps(reps)
                                .time(time)
                                .build();
                workoutExerciseRepository.save(we);

                if (w.getWorkoutExercises() == null) {
                        w.setWorkoutExercises(new java.util.ArrayList<>());
                }
                w.getWorkoutExercises().add(we);
        }
}
