import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Flame,
  Droplets,
  Target,
  Utensils,
  AlertCircle,
  Plus,
  Calculator,
  Dumbbell,
  Calendar,
  Layers,
  Apple,
  CheckCircle2,
  Circle,
  X,
  ChevronRight,
  Sparkles,
  Clock,
  Scale,
  Search,
  Check,
  Loader2,
  Sliders
} from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  getUserDashboard,
  logWater,
  getRecipes,
  logFoodItem,
  searchFoodsList,
  getAllFoodsList,
  getUserProfile
} from '../../lib/api/user';
import { getWorkouts, getExercises } from '../../lib/api/workouts';
import { OnboardingWizard } from '../../components/onboarding/OnboardingWizard';

interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  target: string;
  completed: boolean;
}

export const EXERCISES_CATALOG: Record<string, { label: string; exercises: ExerciseItem[] }> = {
  'PUSH_DAY': {
    label: 'Push Focus (Chest, Shoulders & Triceps)',
    exercises: [
      { id: 'ex-p1', name: 'Barbell Flat Bench Press', sets: 4, reps: '8-10 reps', weight: '70 kg', target: 'Chest', completed: false },
      { id: 'ex-p2', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12 reps', weight: '24 kg', target: 'Upper Chest', completed: false },
      { id: 'ex-p3', name: 'Standing Military Press', sets: 4, reps: '8 reps', weight: '45 kg', target: 'Shoulders', completed: false },
      { id: 'ex-p4', name: 'Cable Chest Flyes (Low-to-High)', sets: 3, reps: '12-15 reps', weight: '15 kg', target: 'Inner Chest', completed: false },
      { id: 'ex-p5', name: 'Tricep Rope Pushdowns', sets: 4, reps: '12-15 reps', weight: '25 kg', target: 'Triceps', completed: false },
      { id: 'ex-p6', name: 'Dumbbell Lateral Raises', sets: 4, reps: '15 reps', weight: '10 kg', target: 'Side Delts', completed: false },
      { id: 'ex-p7', name: 'Parallel Bar Chest Dips', sets: 3, reps: 'Failure', weight: 'Bodyweight', target: 'Lower Chest', completed: false },
      { id: 'ex-p8', name: 'Overhead Dumbbell Extension', sets: 3, reps: '12 reps', weight: '20 kg', target: 'Triceps', completed: false },
      { id: 'ex-p9', name: 'Seated Dumbbell Arnold Press', sets: 3, reps: '10 reps', weight: '18 kg', target: 'Front/Side Delts', completed: false },
      { id: 'ex-p10', name: 'Decline Pushups / Cable Kickbacks', sets: 3, reps: '15 reps', weight: 'Bodyweight', target: 'Triceps & Upper Chest', completed: false },
    ]
  },
  'PULL_DAY': {
    label: 'Pull Focus (Back & Biceps)',
    exercises: [
      { id: 'ex-pl1', name: 'Conventional Barbell Deadlift', sets: 4, reps: '5 reps', weight: '110 kg', target: 'Back & Posterior', completed: false },
      { id: 'ex-pl2', name: 'Lat Pulldown (Wide Grip)', sets: 4, reps: '10 reps', weight: '60 kg', target: 'Lats & Upper Back', completed: false },
      { id: 'ex-pl3', name: 'Bent-Over Barbell Row', sets: 3, reps: '8-10 reps', weight: '55 kg', target: 'Mid Back', completed: false },
      { id: 'ex-pl4', name: 'Seated Cable Rows', sets: 3, reps: '12 reps', weight: '50 kg', target: 'Rhomboids', completed: false },
      { id: 'ex-pl5', name: 'EZ-Bar Bicep Curls', sets: 4, reps: '10 reps', weight: '25 kg', target: 'Biceps', completed: false },
      { id: 'ex-pl6', name: 'Dumbbell Hammer Curls', sets: 3, reps: '12 reps', weight: '14 kg', target: 'Brachialis', completed: false },
      { id: 'ex-pl7', name: 'Face Pulls (High Cable)', sets: 4, reps: '15 reps', weight: '20 kg', target: 'Rear Delts', completed: false },
      { id: 'ex-pl8', name: 'Single-Arm Dumbbell Row', sets: 3, reps: '10 reps', weight: '26 kg', target: 'Lats', completed: false },
      { id: 'ex-pl9', name: 'Incline Dumbbell Bicep Curls', sets: 3, reps: '12 reps', weight: '12 kg', target: 'Biceps Long Head', completed: false },
      { id: 'ex-pl10', name: 'Barbell Shrugs & Hyperextensions', sets: 3, reps: '15 reps', weight: '60 kg', target: 'Traps & Lower Back', completed: false },
    ]
  },
  'LEG_DAY': {
    label: 'Leg Focus (Quads, Hamstrings & Calves)',
    exercises: [
      { id: 'ex-l1', name: 'Barbell Back Squat', sets: 4, reps: '8 reps', weight: '85 kg', target: 'Quads & Glutes', completed: false },
      { id: 'ex-l2', name: 'Romanian Deadlift (RDL)', sets: 4, reps: '10 reps', weight: '70 kg', target: 'Hamstrings', completed: false },
      { id: 'ex-l3', name: '45-Degree Leg Press', sets: 3, reps: '12 reps', weight: '140 kg', target: 'Quads', completed: false },
      { id: 'ex-l4', name: 'Lying Leg Curls', sets: 3, reps: '12 reps', weight: '35 kg', target: 'Hamstrings', completed: false },
      { id: 'ex-l5', name: 'Standing Calf Raises', sets: 4, reps: '15-20 reps', weight: '50 kg', target: 'Calves', completed: false },
      { id: 'ex-l6', name: 'Hanging Leg Raises', sets: 3, reps: '15 reps', weight: 'Bodyweight', target: 'Core / Abs', completed: false },
      { id: 'ex-l7', name: 'Dumbbell Bulgarian Split Squats', sets: 3, reps: '10 reps', weight: '16 kg', target: 'Glutes & Quads', completed: false },
      { id: 'ex-l8', name: 'Dumbbell Walking Lunges', sets: 3, reps: '12 reps', weight: '14 kg', target: 'Quads & Glutes', completed: false },
      { id: 'ex-l9', name: 'Seated Leg Extensions', sets: 3, reps: '12 reps', weight: '45 kg', target: 'Quads Isolation', completed: false },
      { id: 'ex-l10', name: 'Ab Roller Wheels & Planks', sets: 4, reps: '1 min', weight: 'Bodyweight', target: 'Core Stability', completed: false },
    ]
  },
  'UPPER_BODY': {
    label: 'Upper Body Focus',
    exercises: [
      { id: 'ex-u1', name: 'Incline Barbell Bench Press', sets: 4, reps: '8 reps', weight: '65 kg', target: 'Chest', completed: false },
      { id: 'ex-u2', name: 'Wide Grip Pull-Ups', sets: 4, reps: '8-10 reps', weight: 'Bodyweight', target: 'Lats', completed: false },
      { id: 'ex-u3', name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '10 reps', weight: '20 kg', target: 'Shoulders', completed: false },
      { id: 'ex-u4', name: 'Incline Chest-Supported Row', sets: 3, reps: '10 reps', weight: '22 kg', target: 'Upper Back', completed: false },
      { id: 'ex-u5', name: 'Skullcrushers & Arm Superset', sets: 3, reps: '12 reps', weight: '15 kg', target: 'Arms', completed: false },
      { id: 'ex-u6', name: 'Standing Cable Chest Press', sets: 3, reps: '12 reps', weight: '20 kg', target: 'Chest', completed: false },
      { id: 'ex-u7', name: 'Reverse Cable Flyes', sets: 3, reps: '15 reps', weight: '10 kg', target: 'Rear Delts', completed: false },
      { id: 'ex-u8', name: 'Preacher Bicep Curls', sets: 3, reps: '10 reps', weight: '18 kg', target: 'Biceps', completed: false },
      { id: 'ex-u9', name: 'Overhead Cable Tricep Extension', sets: 3, reps: '12 reps', weight: '22 kg', target: 'Triceps', completed: false },
      { id: 'ex-u10', name: 'Dumbbell Shrugs & Lateral Raises', sets: 3, reps: '15 reps', weight: '14 kg', target: 'Traps & Delts', completed: false },
    ]
  },
  'LOWER_BODY': {
    label: 'Lower Body Focus',
    exercises: [
      { id: 'ex-lw1', name: 'Front Squat', sets: 4, reps: '8 reps', weight: '60 kg', target: 'Quads & Core', completed: false },
      { id: 'ex-lw2', name: 'Dumbbell Bulgarian Split Squats', sets: 3, reps: '10 reps', weight: '16 kg', target: 'Glutes & Quads', completed: false },
      { id: 'ex-lw3', name: 'Seated Leg Extensions', sets: 3, reps: '12 reps', weight: '45 kg', target: 'Quads', completed: false },
      { id: 'ex-lw4', name: 'Seated Hamstring Curls', sets: 3, reps: '12 reps', weight: '40 kg', target: 'Hamstrings', completed: false },
      { id: 'ex-lw5', name: 'Weighted Declined Ab Crunches', sets: 4, reps: '15 reps', weight: '10 kg', target: 'Core', completed: false },
      { id: 'ex-lw6', name: 'Barbell Hip Thrusts', sets: 4, reps: '10 reps', weight: '90 kg', target: 'Glutes', completed: false },
      { id: 'ex-lw7', name: 'Standing Calf Raises', sets: 4, reps: '15-20 reps', weight: '50 kg', target: 'Calves', completed: false },
      { id: 'ex-lw8', name: 'Goblet Squats', sets: 3, reps: '12 reps', weight: '24 kg', target: 'Quads', completed: false },
      { id: 'ex-lw9', name: 'Standing Cable Hip Abduction', sets: 3, reps: '15 reps', weight: '15 kg', target: 'Glute Medius', completed: false },
      { id: 'ex-lw10', name: 'Hanging Knee Raises', sets: 3, reps: '15 reps', weight: 'Bodyweight', target: 'Abs', completed: false },
    ]
  },
  'FULL_BODY': {
    label: 'Full Body Conditioning Focus',
    exercises: [
      { id: 'ex-f1', name: 'Heavy Kettlebell Swings', sets: 4, reps: '20 reps', weight: '20 kg', target: 'Full Body', completed: false },
      { id: 'ex-f2', name: 'Dumbbell Thrusters', sets: 4, reps: '12 reps', weight: '14 kg', target: 'Full Body / Cardio', completed: false },
      { id: 'ex-f3', name: 'Gymnastic Ring Dips / Pushups', sets: 4, reps: '15 reps', weight: 'Bodyweight', target: 'Upper Body', completed: false },
      { id: 'ex-f4', name: 'Plyometric Box Jumps', sets: 3, reps: '12 reps', weight: '24 Inch Box', target: 'Explosive Legs', completed: false },
      { id: 'ex-f5', name: 'Battle Rope Slams & Climbers', sets: 4, reps: '45 sec', weight: 'High Intensity', target: 'Conditioning', completed: false },
      { id: 'ex-f6', name: "Heavy Farmer's Carries", sets: 4, reps: '50 meters', weight: '28 kg per hand', target: 'Grip & Core', completed: false },
      { id: 'ex-f7', name: 'Burpees to Pull-Up', sets: 3, reps: '10 reps', weight: 'Bodyweight', target: 'Full Body', completed: false },
      { id: 'ex-f8', name: 'Medicine Ball Slams', sets: 4, reps: '15 reps', weight: '10 kg', target: 'Power', completed: false },
      { id: 'ex-f9', name: 'Medicine Ball Wall Balls', sets: 4, reps: '15 reps', weight: '8 kg', target: 'Cardio & Legs', completed: false },
      { id: 'ex-f10', name: 'Rowing Ergometer Sprint', sets: 4, reps: '500 meters', weight: 'Resistance 8', target: 'Stamina', completed: false },
    ]
  },
  'REST_DAY': {
    label: 'Rest & Active Recovery',
    exercises: [
      { id: 'ex-r1', name: 'Full Body Dynamic Stretching', sets: 1, reps: '15 mins', weight: 'Mobility', target: 'Flexibility', completed: false },
      { id: 'ex-r2', name: 'Foam Rolling (Legs, Back & Glutes)', sets: 1, reps: '15 mins', weight: 'Self Myofascial', target: 'Recovery', completed: false },
      { id: 'ex-r3', name: 'Low Intensity Treadmill Walk', sets: 1, reps: '30 mins', weight: 'Incline 5%', target: 'Zone 2 Cardio', completed: false },
    ]
  }
};

export const PROGRAM_SPLITS_CONFIG: Record<string, {
  key: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  focusKeys: string[];
}> = {
  'PPL': {
    key: 'PPL',
    title: 'Push / Pull / Legs (PPL) Program',
    subtitle: 'Chest, Back, Legs & Core Cycle',
    badge: 'Most Popular 6-Day Split',
    description: 'Periodized 6-day split ensuring 48h (2-day) muscle recovery between Push, Pull, and Leg sessions.',
    focusKeys: ['PUSH_DAY', 'PULL_DAY', 'LEG_DAY']
  },
  'UPPER_LOWER': {
    key: 'UPPER_LOWER',
    title: 'Upper / Lower Body Split',
    subtitle: 'Balanced Upper & Lower Frequency',
    badge: 'Optimal 4-5 Day Split',
    description: 'High-frequency split targeting upper body and lower body on alternating days for max power & hypertrophy.',
    focusKeys: ['UPPER_BODY', 'LOWER_BODY']
  },
  'FULL_BODY_PROGRAM': {
    key: 'FULL_BODY_PROGRAM',
    title: 'Full Body Conditioning Program',
    subtitle: '3-Day High Intensity Frequency',
    badge: '3-Day Conditioning',
    description: 'Full body resistance and cardiovascular conditioning protocol with mandatory alternate day rest intervals.',
    focusKeys: ['FULL_BODY']
  },
  'REST_PROGRAM': {
    key: 'REST_PROGRAM',
    title: 'Rest & Active Recovery Plan',
    subtitle: 'Mobility, Flexibility & Foam Rolling',
    badge: 'Deload & Recovery',
    description: 'Low intensity mobility, foam rolling, and cardio protocol for recovery and joint health.',
    focusKeys: ['REST_DAY']
  }
};

export const WORKOUT_SPLITS_DATA = EXERCISES_CATALOG;

export function getTodayWorkoutFocus(programKey: string): {
  focusKey: string;
  focusTitle: string;
  dayName: string;
  recoveryNote: string;
} {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const dayIndex = now.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const dayName = days[dayIndex];

  if (programKey === 'PPL' || programKey === 'PUSH_DAY' || programKey === 'PULL_DAY' || programKey === 'LEG_DAY') {
    if (dayIndex === 1) return { focusKey: 'PUSH_DAY', focusTitle: 'Push Day (Chest, Shoulders & Triceps)', dayName, recoveryNote: 'Day 1: Upper Body Push' };
    if (dayIndex === 2) return { focusKey: 'PULL_DAY', focusTitle: 'Pull Day (Back & Biceps)', dayName, recoveryNote: 'Day 2: Upper Body Pull (48h Push Recovery)' };
    if (dayIndex === 3) return { focusKey: 'LEG_DAY', focusTitle: 'Leg Day (Quads, Hamstrings & Calves)', dayName, recoveryNote: 'Day 3: Lower Body (48h Pull Recovery)' };
    if (dayIndex === 4) return { focusKey: 'PUSH_DAY', focusTitle: 'Push Day (Chest, Shoulders & Triceps)', dayName, recoveryNote: 'Day 4: Push Focus (48h Rest Gap Completed)' };
    if (dayIndex === 5) return { focusKey: 'PULL_DAY', focusTitle: 'Pull Day (Back & Biceps)', dayName, recoveryNote: 'Day 5: Pull Focus (48h Rest Gap Completed)' };
    if (dayIndex === 6) return { focusKey: 'LEG_DAY', focusTitle: 'Leg Day (Quads, Hamstrings & Calves)', dayName, recoveryNote: 'Day 6: Legs Focus (48h Rest Gap Completed)' };
    return { focusKey: 'REST_DAY', focusTitle: 'Rest & Active Recovery', dayName, recoveryNote: 'Sunday: Full Muscle Recovery' };
  }

  if (programKey === 'UPPER_LOWER' || programKey === 'UPPER_BODY' || programKey === 'LOWER_BODY') {
    if (dayIndex === 1) return { focusKey: 'UPPER_BODY', focusTitle: 'Upper Body (Chest, Back & Arms)', dayName, recoveryNote: 'Day 1: Upper Body Strength' };
    if (dayIndex === 2) return { focusKey: 'LOWER_BODY', focusTitle: 'Lower Body (Quads, Hams & Glutes)', dayName, recoveryNote: 'Day 2: Lower Body Strength' };
    if (dayIndex === 3) return { focusKey: 'REST_DAY', focusTitle: 'Mid-Week Core & Recovery', dayName, recoveryNote: 'Day 3: Mobility & Muscle Repair' };
    if (dayIndex === 4) return { focusKey: 'UPPER_BODY', focusTitle: 'Upper Body Hypertrophy Focus', dayName, recoveryNote: 'Day 4: Upper Body (48h Rest Completed)' };
    if (dayIndex === 5) return { focusKey: 'LOWER_BODY', focusTitle: 'Lower Body Hypertrophy Focus', dayName, recoveryNote: 'Day 5: Lower Body (48h Rest Completed)' };
    if (dayIndex === 6) return { focusKey: 'FULL_BODY', focusTitle: 'Full Body & Core Conditioning', dayName, recoveryNote: 'Day 6: Athletic Conditioning' };
    return { focusKey: 'REST_DAY', focusTitle: 'Rest & Active Recovery', dayName, recoveryNote: 'Sunday: Complete System Recovery' };
  }

  if (programKey === 'FULL_BODY_PROGRAM' || programKey === 'FULL_BODY') {
    if (dayIndex === 1 || dayIndex === 3 || dayIndex === 5) {
      return { focusKey: 'FULL_BODY', focusTitle: 'Full Body High Intensity Session', dayName, recoveryNote: 'Full Body Protocol (Alternating Day Rest)' };
    }
    return { focusKey: 'REST_DAY', focusTitle: 'Active Recovery & Mobility', dayName, recoveryNote: '48h Inter-session Rest Interval' };
  }

  return { focusKey: 'REST_DAY', focusTitle: 'Rest & Active Recovery', dayName, recoveryNote: 'Rest & Regeneration' };
}

export interface WaterLogEntry {
  id: string;
  time: string;
  amountLiters: number;
  label: string;
  type: 'bottle' | 'glass';
}

export const MemberDashboard: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ triggerAnnouncement: (msg: string) => void }>();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWaterAdding, setIsWaterAdding] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(false);

  // Modals state
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isBmiModalOpen, setIsBmiModalOpen] = useState(false);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isRecipesModalOpen, setIsRecipesModalOpen] = useState(false);

  // BMI Calculator State
  const [heightCm, setHeightCm] = useState<string>('175');
  const [weightKg, setWeightKg] = useState<string>('72');
  const [calculatedBmi, setCalculatedBmi] = useState<{ score: number; label: string; color: string } | null>(null);

  // Food Log State & Live Backend Food Search
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [availableFoods, setAvailableFoods] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any | null>(null);
  const [foodQuantity, setFoodQuantity] = useState<string>('1');
  const [mealType, setMealType] = useState<string>('Lunch');
  const [isSearchingFood, setIsSearchingFood] = useState(false);
  const [isLoggingFood, setIsLoggingFood] = useState(false);

  // Today's Workout Exercises state & Selected Program
  const [selectedWorkoutProgram, setSelectedWorkoutProgram] = useState<string>('');
  const [todayFocusInfo, setTodayFocusInfo] = useState<{ focusKey: string; focusTitle: string; dayName: string; recoveryNote: string }>({
    focusKey: 'REST_DAY',
    focusTitle: 'Rest & Active Recovery',
    dayName: 'Today',
    recoveryNote: ''
  });
  const [todayExercises, setTodayExercises] = useState<ExerciseItem[]>([]);

  useEffect(() => {
    const syncSavedSplit = () => {
      const savedProgramKey = localStorage.getItem('selectedGymOSProgramKey') || localStorage.getItem('selectedGymOSWorkoutSplit') || '';
      if (savedProgramKey) {
        const { focusKey, focusTitle, dayName, recoveryNote } = getTodayWorkoutFocus(savedProgramKey);
        setSelectedWorkoutProgram(savedProgramKey);
        setTodayFocusInfo({ focusKey, focusTitle, dayName, recoveryNote });

        // Load custom exercise selections if available
        const customKey = `selectedGymOSCustomExercises_${focusKey}`;
        const savedCustomJson = localStorage.getItem(customKey);
        let selectedExs: ExerciseItem[] = [];

        if (savedCustomJson) {
          try {
            const savedIds: string[] = JSON.parse(savedCustomJson);
            const catalog = EXERCISES_CATALOG[focusKey]?.exercises || [];
            selectedExs = catalog.filter(ex => savedIds.includes(ex.id));
          } catch (e) {
            console.error(e);
          }
        }

        if (!selectedExs || selectedExs.length === 0) {
          selectedExs = EXERCISES_CATALOG[focusKey]?.exercises || [];
        }

        setTodayExercises(selectedExs);
      }
    };
    syncSavedSplit();
    window.addEventListener('focus', syncSavedSplit);
    return () => window.removeEventListener('focus', syncSavedSplit);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch User Profile & Dashboard from Backend API (GET /api/user/dashboard, GET /api/user/profile)
      const [dashRes, profileRes, recRes, workoutsData, exercisesData] = await Promise.all([
        getUserDashboard().catch(() => null),
        getUserProfile().catch(() => null),
        getRecipes().catch(() => ({ data: { content: [] } })),
        getWorkouts().catch(() => []),
        getExercises().catch(() => [])
      ]);

      const realData = dashRes?.data || dashRes;
      const profileData = profileRes?.data || profileRes;

      const fallbackDashboard = {
        today: {
          workoutDay: 'Push Day',
          workoutPlan: 'Push Pull Legs',
          date: new Date().toLocaleDateString('en-GB')
        },
        macros: {
          carbs: { current: 0, target: 0 },
          protein: { current: 0, target: 0 },
          fat: { current: 0, target: 0 }
        },
        calories: { current: 0, target: 0 },
        activity: {
          water: { current: 0, target: 0, unit: 'L' }
        },
        biometrics: { height: 0, weight: 0 }
      };

      const finalDash = realData || fallbackDashboard;
      setDashboardData(finalDash);

      // Check if user completed onboarding or missing biometrics
      const completed = profileData?.isOnboardingCompleted === true || (finalDash?.biometrics?.height > 0 && finalDash?.biometrics?.weight > 0);
      setIsOnboardingCompleted(Boolean(completed));

      if (!completed) {
        setIsOnboardingModalOpen(true);
      }

      if (finalDash?.biometrics?.height && finalDash.biometrics.height > 0) {
        setHeightCm(String(finalDash.biometrics.height));
      }
      if (finalDash?.biometrics?.weight && finalDash.biometrics.weight > 0) {
        setWeightKg(String(finalDash.biometrics.weight));
      }

      // 2. Process Recipes from Backend API (GET /api/v1/recipes)
      const recipeList = recRes?.data?.content || recRes?.content || recRes?.data || recRes || [];
      if (Array.isArray(recipeList) && recipeList.length > 0) {
        setRecipes(recipeList.slice(0, 4));
      } else {
        setRecipes([
          { id: 'r1', recipeName: 'Grilled Chicken & Quinoa Bowl', category: 'High Protein', calories: 520, protein: 48 },
          { id: 'r2', recipeName: 'Avocado Egg White Toast', category: 'Breakfast', calories: 340, protein: 22 },
          { id: 'r3', recipeName: 'Salmon & Roasted Asparagus', category: 'Keto Friendly', calories: 480, protein: 42 },
          { id: 'r4', recipeName: 'Greek Yogurt Protein Smoothie', category: 'Post Workout', calories: 290, protein: 30 }
        ]);
      }

      // Note: todayExercises are now correctly populated by syncSavedSplit 
      // based on the selected program and the current day's focus (e.g., REST_DAY).
    } catch (err: any) {
      triggerAnnouncement(`Failed to load dashboard: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const [waterLogs, setWaterLogs] = useState<WaterLogEntry[]>(() => {
    const dateKey = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`gymOSWaterLogs_${dateKey}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Pending Water Draft State for Modal (until Save is clicked)
  const [draftBottles, setDraftBottles] = useState<number>(0);
  const [draftGlasses, setDraftGlasses] = useState<number>(0);

  const handleOpenWaterModal = () => {
    const currentLiters = dashboardData?.activity?.water?.current || waterLogs.reduce((acc, curr) => acc + curr.amountLiters, 0);
    const bCount = Math.min(4, Math.floor(currentLiters / 1.0));
    const rem = Math.max(0, currentLiters - bCount * 1.0);
    const gCount = Math.min(5, Math.floor(rem / 0.25));

    setDraftBottles(bCount);
    setDraftGlasses(gCount);
    setIsWaterModalOpen(true);
  };

  const toggleDraftBottle = (bNum: number) => {
    setDraftBottles(prev => (prev === bNum ? bNum - 1 : bNum));
  };

  const toggleDraftGlass = (gNum: number) => {
    setDraftGlasses(prev => (prev === gNum ? gNum - 1 : gNum));
  };

  const handleSaveWaterDraft = async () => {
    const targetLiters = parseFloat(((draftBottles * 1.0) + (draftGlasses * 0.25)).toFixed(2));

    setIsWaterAdding(true);
    try {
      if (targetLiters > 0) {
        await logWater(targetLiters);
      }

      const dateKey = getTodayDateString();
      const newEntry: WaterLogEntry = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amountLiters: targetLiters,
        label: `${draftBottles} Bottle(s) (1L) + ${draftGlasses} Glass(es) (250ml)`,
        type: draftBottles > 0 ? 'bottle' : 'glass'
      };

      const updatedLogs = [newEntry, ...waterLogs];
      setWaterLogs(updatedLogs);
      localStorage.setItem(`gymOSWaterLogs_${dateKey}`, JSON.stringify(updatedLogs));

      triggerAnnouncement(`Saved hydration log: ${targetLiters.toFixed(2)} Liters!`);

      const updatedDash = await getUserDashboard().catch(() => null);
      if (updatedDash) {
        setDashboardData(updatedDash.data || updatedDash);
      } else {
        setDashboardData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            activity: {
              ...prev.activity,
              water: {
                ...prev.activity?.water,
                current: parseFloat(targetLiters.toFixed(2))
              }
            }
          };
        });
      }
      setIsWaterModalOpen(false);
    } catch (err: any) {
      triggerAnnouncement(`Failed to save water log: ${err.message}`);
    } finally {
      setIsWaterAdding(false);
    }
  };

  const handleClearWaterLogs = () => {
    const dateKey = getTodayDateString();
    setWaterLogs([]);
    localStorage.removeItem(`gymOSWaterLogs_${dateKey}`);
    setDraftBottles(0);
    setDraftGlasses(0);
    triggerAnnouncement(`Today's water intake history has been reset for a fresh start!`);
  };

  // Real Food Search API Call (POST /api/user/food/search or GET /api/user/food/list)
  const loadFoodsFromBackend = async (query?: string) => {
    setIsSearchingFood(true);
    try {
      if (query && query.trim().length > 1) {
        const res = await searchFoodsList(query.trim());
        const list = res?.data || res || [];
        setAvailableFoods(Array.isArray(list) ? list : []);
      } else {
        const res = await getAllFoodsList();
        const list = res?.data || res || [];
        setAvailableFoods(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Failed to load foods from backend', err);
    } finally {
      setIsSearchingFood(false);
    }
  };

  const handleOpenFoodModal = () => {
    setIsFoodModalOpen(true);
    loadFoodsFromBackend();
  };

  // Real API Call: Log Food Item (POST /api/user/food/log)
  const handleAddFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingFood(true);

    try {
      if (selectedFood?.id) {
        await logFoodItem(selectedFood.id, parseFloat(foodQuantity) || 1.0, mealType);
        triggerAnnouncement(`Logged ${selectedFood.foodName || 'Food'} to your backend meal log!`);
      } else {
        triggerAnnouncement(`Logged meal entry (${foodSearchQuery || 'Meal'})`);
      }

      // Re-fetch backend dashboard stats
      const updatedDash = await getUserDashboard().catch(() => null);
      if (updatedDash) {
        setDashboardData(updatedDash.data || updatedDash);
      }
      setIsFoodModalOpen(false);
      setSelectedFood(null);
      setFoodSearchQuery('');
    } catch (err: any) {
      triggerAnnouncement(`Failed to log food: ${err.message}`);
    } finally {
      setIsLoggingFood(false);
    }
  };

  const toggleExerciseComplete = (id: string) => {
    setTodayExercises(prev =>
      prev.map(ex => (ex.id === id ? { ...ex, completed: !ex.completed } : ex))
    );
  };

  const calculateBmiScore = () => {
    const hM = parseFloat(heightCm) / 100;
    const wKg = parseFloat(weightKg);
    if (!hM || !wKg || hM <= 0 || wKg <= 0) return;

    const bmi = parseFloat((wKg / (hM * hM)).toFixed(1));
    let label = 'Healthy Weight';
    let color = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';

    if (bmi < 18.5) {
      label = 'Underweight';
      color = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    } else if (bmi >= 25 && bmi < 29.9) {
      label = 'Overweight';
      color = 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    } else if (bmi >= 30) {
      label = 'Obese';
      color = 'text-red-500 bg-red-500/10 border-red-500/30';
    }

    setCalculatedBmi({ score: bmi, label, color });
    triggerAnnouncement(`Calculated BMI: ${bmi} (${label})`);
  };

  // Formatted date string DD/MM/YYYY
  const formattedTodayDate = useMemo(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { today, macros, calories, activity } = dashboardData || {};

  const carbCurr = macros?.carbs?.current ?? 185;
  const carbTarg = macros?.carbs?.target ?? 250;
  const protCurr = macros?.protein?.current ?? 140;
  const protTarg = macros?.protein?.target ?? 180;
  const fatCurr = macros?.fat?.current ?? 55;
  const fatTarg = macros?.fat?.target ?? 70;
  const waterCurr = activity?.water?.current ?? 2.25;
  const waterTarg = activity?.water?.target ?? 3.5;

  // Percentages for Concentric Rings
  const carbPct = Math.min((carbCurr / (carbTarg || 1)) * 100, 100);
  const protPct = Math.min((protCurr / (protTarg || 1)) * 100, 100);
  const fatPct = Math.min((fatCurr / (fatTarg || 1)) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Member Onboarding & Fitness Setup Banner (Hidden once onboarding is completed) */}
      {!isOnboardingCompleted && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-white dark:from-blue-900/60 dark:via-indigo-900/40 dark:to-zinc-900 border border-blue-200 dark:border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Member Fitness Profile & Nutrition Setup
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Complete the 4-step onboarding wizard to compute your custom calorie, macro & mineral chart.</p>
            </div>
          </div>
          <button
            onClick={() => setIsOnboardingModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5 shrink-0"
          >
            <Sliders className="w-4 h-4" /> Launch 4-Step Onboarding Setup
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP SECTION: 2 COLUMNS (Left: Concentric Rings & Stats, Right: Today's Workout) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT CARD: Concentric Gauge, Macro Specs, Action Buttons & Workout CTA   */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Daily Intake & Progress
            </h2>
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md">
              {calories?.current ?? 1980} / {calories?.target ?? 2400} Kcal
            </span>
          </div>

          {/* Concentric Gauge + Macro Breakdown Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            
            {/* 3 Concentric Animated Radial Rings */}
            <div className="sm:col-span-6 flex items-center justify-center relative">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  {/* Outer Ring: Carbs (Cyan) */}
                  <circle cx="100" cy="100" r="75" fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="10" />
                  <circle
                    cx="100" cy="100" r="75"
                    fill="none"
                    className="stroke-cyan-500 transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={471}
                    strokeDashoffset={471 - (471 * carbPct) / 100}
                    strokeLinecap="round"
                  />

                  {/* Middle Ring: Protein (Emerald) */}
                  <circle cx="100" cy="100" r="56" fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="10" />
                  <circle
                    cx="100" cy="100" r="56"
                    fill="none"
                    className="stroke-emerald-500 transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={351}
                    strokeDashoffset={351 - (351 * protPct) / 100}
                    strokeLinecap="round"
                  />

                  {/* Inner Ring: Fats (Amber) */}
                  <circle cx="100" cy="100" r="37" fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="10" />
                  <circle
                    cx="100" cy="100" r="37"
                    fill="none"
                    className="stroke-amber-500 transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={232}
                    strokeDashoffset={232 - (232 * fatPct) / 100}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Content Inside Gauge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Flame className="w-6 h-6 text-orange-400 mb-0.5 animate-pulse" />
                  <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">{calories?.current ?? 1980}</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Target {calories?.target ?? 2400}</span>
                </div>
              </div>
            </div>

            {/* Macro & Hydration Specs */}
            <div className="sm:col-span-6 space-y-3 text-sm">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-50 dark:bg-zinc-950/60 border border-cyan-200 dark:border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                  <span className="text-cyan-700 dark:text-cyan-400 font-semibold">Carbs:</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-cyan-900 dark:text-zinc-200 font-bold">{carbCurr}g / {carbTarg}g</span>
                  <span className="block text-[10px] text-cyan-600 dark:text-zinc-400 font-mono">{carbCurr * 4} / {carbTarg * 4} Kcal</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-zinc-950/60 border border-emerald-200 dark:border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Protein:</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-emerald-900 dark:text-zinc-200 font-bold">{protCurr}g / {protTarg}g</span>
                  <span className="block text-[10px] text-emerald-600 dark:text-zinc-400 font-mono">{protCurr * 4} / {protTarg * 4} Kcal</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 dark:bg-zinc-950/60 border border-amber-200 dark:border-amber-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="text-amber-700 dark:text-amber-400 font-semibold">Fats:</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-amber-900 dark:text-zinc-200 font-bold">{fatCurr}g / {fatTarg}g</span>
                  <span className="block text-[10px] text-amber-600 dark:text-zinc-400 font-mono">{fatCurr * 9} / {fatTarg * 9} Kcal</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50 dark:bg-zinc-950/60 border border-blue-200 dark:border-blue-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                  <span className="text-blue-700 dark:text-blue-400 font-semibold">Total Water:</span>
                </div>
                <span className="font-mono text-blue-900 dark:text-zinc-200 font-bold">{waterCurr}L / {waterTarg}L</span>
              </div>
            </div>

          </div>

          {/* Action Buttons: Add Water & Add Food */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleOpenWaterModal}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-cyan-200 dark:border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300 font-bold hover:bg-cyan-100 dark:hover:bg-cyan-950/50 hover:border-cyan-300 dark:hover:border-cyan-400 transition shadow-lg shadow-cyan-950/10 dark:shadow-cyan-950/30 text-xs sm:text-sm"
            >
              <Droplets className="w-4 h-4 text-cyan-400" />
              Add Water
            </button>

            <button
              onClick={handleOpenFoodModal}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-emerald-200 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-950/50 hover:border-emerald-300 dark:hover:border-emerald-400 transition shadow-lg shadow-emerald-950/10 dark:shadow-emerald-950/30 text-xs sm:text-sm"
            >
              <Utensils className="w-4 h-4 text-emerald-400" />
              Add Food
            </button>
          </div>

          {/* Prominent Card / Button: Check Your Workout */}
          <button
            onClick={() => setIsWorkoutModalOpen(true)}
            className="w-full p-4 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-100 hover:from-blue-200 hover:to-indigo-200 dark:from-blue-900/40 dark:via-indigo-900/40 dark:to-blue-900/40 dark:hover:from-blue-900/60 dark:hover:to-indigo-900/60 text-blue-900 dark:text-white font-bold transition flex items-center justify-between group shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-200/50 dark:bg-blue-600/30 border border-blue-300 dark:border-blue-400/40 flex items-center justify-center text-blue-700 dark:text-blue-300 group-hover:scale-105 transition-transform">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-extrabold text-blue-900 dark:text-blue-100 block">Check Your Workout</span>
                <span className="text-xs text-blue-700 dark:text-blue-300 font-normal">View today's routine ({todayExercises.filter(e => e.completed).length}/{todayExercises.length} completed)</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-700 dark:text-blue-300 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT CARD: Today's Workout Schedule & Exercise List                   */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          
          {/* Header bar: Date (Left) & Active Workout Focus / Change Button (Right) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-3">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-semibold text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Date :- <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{formattedTodayDate} ({todayFocusInfo.dayName})</strong></span>
            </div>

            {selectedWorkoutProgram ? (
              <div className="flex items-center gap-2 text-right">
                <div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider block">Today's Focus ({todayFocusInfo.dayName})</span>
                  <span className="text-xs font-black text-cyan-400 font-mono">
                    {todayFocusInfo.focusTitle}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/workouts?tab=SELECT_WORKOUT')}
                  className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-700 text-[11px] font-bold transition shrink-0"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/workouts?tab=SELECT_WORKOUT')}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-blue-900/30"
              >
                <Sliders className="w-3.5 h-3.5" /> Select Your Program
              </button>
            )}
          </div>

          {/* List of Today's Exercises or Prompt to Select */}
          {selectedWorkoutProgram === '' ? (
            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-zinc-950/60 border border-dashed border-blue-200 dark:border-blue-500/30 text-center space-y-4 min-h-[260px] my-auto">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-950/50">
                <Dumbbell className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">No Workout Selected</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
                  Please select your workout routine split on the Workouts & Diets page to view and track today's routine.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/workouts?tab=SELECT_WORKOUT')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" /> Select Your Workout
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {todayExercises.map((ex, index) => (
                <div
                  key={ex.id}
                  onClick={() => toggleExerciseComplete(ex.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    ex.completed
                      ? 'bg-zinc-100 dark:bg-zinc-950/40 border-emerald-500/30 text-zinc-500 dark:text-zinc-400'
                      : 'bg-white dark:bg-zinc-950/80 border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      className="shrink-0 focus:outline-none"
                      aria-label={`Mark ${ex.name} as completed`}
                    >
                      {ex.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 hover:text-blue-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${ex.completed ? 'line-through text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {index + 1}. {ex.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5 font-mono">
                        <span>{ex.sets} Sets × {ex.reps}</span>
                        <span>•</span>
                        <span className="text-blue-400">{ex.weight}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                    ex.completed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400'
                      : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}>
                    {ex.target}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Progress: <strong className="text-zinc-900 dark:text-zinc-100">{todayExercises.filter(e => e.completed).length}</strong> of {todayExercises.length} Done</span>
            <button
              onClick={() => setIsWorkoutModalOpen(true)}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              Open Full Session <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: 5 QUICK ACTION CARDS (HORIZONTAL GRID)                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Check BMI */}
        <button
          onClick={() => setIsBmiModalOpen(true)}
          className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-850/80 transition-all text-center flex flex-col items-center justify-center space-y-3 group shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-blue-400 transition-colors">Check BMI</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Calculate body mass</p>
          </div>
        </button>

        {/* Card 2: Check Other Workout */}
        <button
          onClick={() => navigate('/workouts')}
          className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-850/80 transition-all text-center flex flex-col items-center justify-center space-y-3 group shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-emerald-400 transition-colors">Check Other Workout</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Explore workout plans</p>
          </div>
        </button>

        {/* Card 3: Check Activity */}
        <button
          onClick={() => navigate('/activities')}
          className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850/80 transition-all text-center flex flex-col items-center justify-center space-y-3 group shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-amber-400 transition-colors">Check Activity</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Group sessions & classes</p>
          </div>
        </button>

        {/* Card 4: Check Workout Splits */}
        <button
          onClick={() => navigate('/workouts')}
          className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-850/80 transition-all text-center flex flex-col items-center justify-center space-y-3 group shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-indigo-400 transition-colors">Check Workout Splits</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Preset split routines</p>
          </div>
        </button>

        {/* Card 5: Check Diets & Recipes */}
        <button
          onClick={() => setIsRecipesModalOpen(true)}
          className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-850/80 transition-all text-center flex flex-col items-center justify-center space-y-3 group shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-rose-400 transition-colors">Check Diets & Recipes</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Nutrition & healthy meals</p>
          </div>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* 4-STEP MEMBER ONBOARDING WIZARD MODAL                                     */}
      {/* ========================================================================= */}
      <OnboardingWizard
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onSuccess={fetchData}
        triggerAnnouncement={triggerAnnouncement}
      />

      {/* ========================================================================= */}
      {/* MODAL 1: CHECK BMI CALCULATOR                                              */}
      {/* ========================================================================= */}
      {isBmiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsBmiModalOpen(false)}>
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-400" /> BMI Calculator
              </h3>
              <button
                onClick={() => setIsBmiModalOpen(false)}
                className="p-1 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={e => setHeightCm(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 175"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 72"
                />
              </div>

              <button
                onClick={calculateBmiScore}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition"
              >
                Calculate BMI
              </button>

              {calculatedBmi && (
                <div className={`p-4 rounded-xl border text-center space-y-1 ${calculatedBmi.color}`}>
                  <span className="text-2xl font-black block font-mono">{calculatedBmi.score}</span>
                  <span className="text-xs font-extrabold uppercase tracking-wider block">{calculatedBmi.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: INTERACTIVE ANIMATED HYDRATION STATION (Bottles & Glasses)      */}
      {/* ========================================================================= */}
      {isWaterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsWaterModalOpen(false)}>
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-5" onClick={(e) => e.stopPropagation()}>
            
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
                  <Droplets className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    Interactive Hydration Station
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Click bottles (1L) or glasses (250ml) to log water intake</p>
                </div>
              </div>
              <button
                onClick={() => setIsWaterModalOpen(false)}
                className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Progress & Draft Summary */}
            {(() => {
              const draftLiters = (draftBottles * 1.0) + (draftGlasses * 0.25);
              const targetLiters = dashboardData?.activity?.water?.target || 3.5;
              const percent = Math.min(100, Math.round((draftLiters / targetLiters) * 100));

              return (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50 via-white to-blue-50 dark:from-cyan-950/60 dark:via-zinc-950 dark:to-blue-950/60 border border-cyan-200 dark:border-cyan-500/30 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-cyan-400" /> Pending Intake Selection:
                    </span>
                    <span className="text-cyan-400 font-mono text-sm font-black">
                      {draftLiters.toFixed(2)} L <span className="text-zinc-500 dark:text-zinc-400 font-normal">({(draftLiters * 1000).toLocaleString()} ml)</span> / {targetLiters} L
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-zinc-50 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 p-0.5 relative">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(6,182,212,0.8)] relative"
                      style={{ width: `${percent}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                    <span>{percent}% Goal Achieved</span>
                    <span>Remaining: {Math.max(0, targetLiters - draftLiters).toFixed(2)} L</span>
                  </div>
                </div>
              );
            })()}

            {/* ── SECTION 1: 4 WATER BOTTLES (1.0 LITER / 1000 ML EACH) ───────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  🍾 1.0 Liter Water Bottles (1,000 ml each)
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-semibold">Click to Fill or Empty</span>
              </div>

              <div className="grid grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800">
                {[1, 2, 3, 4].map((bNum) => {
                  const isFilled = bNum <= draftBottles;

                  return (
                    <button
                      key={bNum}
                      type="button"
                      disabled={isWaterAdding}
                      onClick={() => toggleDraftBottle(bNum)}
                      className={`group flex flex-col items-center p-3 rounded-2xl border transition-all relative overflow-hidden ${
                        isFilled
                          ? 'bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                          : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/40 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      {/* Bottle Vector Visual */}
                      <div className="relative w-12 h-28 border-2 border-cyan-400/40 rounded-b-2xl rounded-t-sm bg-white dark:bg-zinc-950 overflow-hidden flex flex-col justify-end p-0.5 shadow-inner">
                        {/* Bottle Cap */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-2 bg-cyan-500 rounded-t-sm shadow"></div>
                        
                        {/* Measurement ticks */}
                        <div className="absolute inset-y-2 left-1 flex flex-col justify-between text-[7px] text-cyan-400/40 font-mono z-10 select-none">
                          <span>1L</span>
                          <span>.5</span>
                        </div>

                        {/* Animated Liquid Fill */}
                        <div
                          className={`w-full bg-gradient-to-t from-cyan-600 via-sky-500 to-cyan-300 transition-all duration-700 ease-out rounded-b-xl relative ${
                            isFilled ? 'shadow-[0_0_15px_rgba(6,182,212,0.7)]' : ''
                          }`}
                          style={{ height: isFilled ? '100%' : '0%' }}
                        >
                          {/* Wave Ripple Animation */}
                          {isFilled && (
                            <>
                              <div className="absolute top-0 left-0 right-0 h-1.5 bg-cyan-100/70 animate-pulse rounded-t-full"></div>
                              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce"></div>
                            </>
                          )}
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 mt-2">Bottle #{bNum}</span>
                      <span className={`text-[10px] font-mono font-bold mt-0.5 ${isFilled ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-cyan-300'}`}>
                        {isFilled ? '✓ 1.0 Litre' : 'Click to Fill'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── SECTION 2: 5 WATER GLASSES (250 ML / 0.25 L EACH) ───────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  🥛 250 ml Water Glasses (5 Available)
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-semibold">Click to Fill or Empty</span>
              </div>

              <div className="grid grid-cols-5 gap-2 sm:gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800">
                {[1, 2, 3, 4, 5].map((gNum) => {
                  const isFilled = gNum <= draftGlasses;

                  return (
                    <button
                      key={gNum}
                      type="button"
                      disabled={isWaterAdding}
                      onClick={() => toggleDraftGlass(gNum)}
                      className={`group flex flex-col items-center p-2.5 rounded-2xl border transition-all relative overflow-hidden ${
                        isFilled
                          ? 'bg-blue-950/30 border-blue-500/60 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/40'
                          : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-blue-500/40 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      {/* Glass Vector Visual */}
                      <div className="relative w-10 h-20 border-2 border-blue-400/40 rounded-b-xl rounded-t-xs bg-white dark:bg-zinc-950 overflow-hidden flex flex-col justify-end p-0.5 shadow-inner">
                        {/* Glass Rim */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-300/40"></div>

                        {/* Animated Liquid Fill */}
                        <div
                          className={`w-full bg-gradient-to-t from-blue-600 via-cyan-400 to-sky-300 transition-all duration-500 ease-out rounded-b-lg relative ${
                            isFilled ? 'shadow-[0_0_12px_rgba(59,130,246,0.7)]' : ''
                          }`}
                          style={{ height: isFilled ? '100%' : '0%' }}
                        >
                          {/* Wave Ripple Animation */}
                          {isFilled && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-100/80 animate-pulse rounded-t-full"></div>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 mt-1.5">Glass #{gNum}</span>
                      <span className={`text-[9px] font-mono font-bold mt-0.5 ${isFilled ? 'text-blue-400' : 'text-zinc-500 group-hover:text-blue-300'}`}>
                        {isFilled ? '✓ 250ml' : 'Click to Fill'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selection Formula Banner */}
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/20 text-center text-xs font-mono text-cyan-300">
              Selected: <strong>{draftBottles} Bottle(s)</strong> ({draftBottles * 1000} ml) + <strong>{draftGlasses} Glass(es)</strong> ({draftGlasses * 250} ml) = <strong>{((draftBottles * 1.0) + (draftGlasses * 0.25)).toFixed(2)} Liters</strong>
            </div>

            {/* SAVE BUTTON & CANCEL */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsWaterModalOpen(false)}
                className="w-1/3 py-3 rounded-xl border border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isWaterAdding}
                onClick={handleSaveWaterDraft}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-950/50 transition flex items-center justify-center gap-2"
              >
                {isWaterAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving to Database...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Save Hydration Log
                  </>
                )}
              </button>
            </div>

            {/* ── SECTION 3: TODAY'S WATER INTAKE HISTORY LOG RECORD ──────────── */}
            <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" /> Today's Hydration Record ({formattedTodayDate})
                </span>
                {waterLogs.length > 0 && (
                  <button
                    onClick={handleClearWaterLogs}
                    className="text-[10px] text-red-400 hover:text-red-300 hover:underline font-mono"
                  >
                    Reset Today's Logs
                  </button>
                )}
              </div>

              {waterLogs.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 text-center text-xs text-zinc-500 italic">
                  No water logged yet today. Click any bottle or glass above to record your hydration!
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {waterLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{log.type === 'bottle' ? '🍼' : '🥛'}</span>
                        <div>
                          <span className="text-zinc-800 dark:text-zinc-200 font-bold block">{log.label}</span>
                          <span className="text-[10px] text-zinc-500">{log.time}</span>
                        </div>
                      </div>
                      <span className="text-cyan-400 font-bold">
                        +{log.amountLiters >= 1 ? `${log.amountLiters}L` : `${log.amountLiters * 1000}ml`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-zinc-500 text-center italic">
                * Records reset automatically at midnight for a fresh intake tracking on the next day.
              </p>
            </div>

            {isWaterAdding && (
              <div className="flex items-center justify-center text-xs text-cyan-400 gap-2 py-1">
                <Loader2 className="w-4 h-4 animate-spin" /> Recording hydration log to database...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD FOOD LOG (Real API Integration: POST /api/user/food/log)     */}
      {/* ========================================================================= */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsFoodModalOpen(false)}>
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-400" /> Log Food to Backend DB
              </h3>
              <button
                onClick={() => setIsFoodModalOpen(false)}
                className="p-1 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Food Search Bar */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={foodSearchQuery}
                  onChange={(e) => {
                    setFoodSearchQuery(e.target.value);
                    loadFoodsFromBackend(e.target.value);
                  }}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-9 pr-4 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="Search food database (e.g. Chicken, Rice, Oats, Eggs)..."
                />
              </div>

              {/* Food Items List from Backend API */}
              <div className="max-h-48 overflow-y-auto space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 bg-white dark:bg-zinc-950/60">
                {isSearchingFood ? (
                  <div className="p-4 text-center text-xs text-zinc-500 dark:text-zinc-400 flex justify-center items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading food database...
                  </div>
                ) : availableFoods.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    No foods found matching query. Type custom entry below.
                  </div>
                ) : (
                  availableFoods.map((item: any) => {
                    const isSelected = selectedFood?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedFood(item)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition ${
                          isSelected
                            ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                            : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-850'
                        }`}
                      >
                        <div>
                          <strong className="block text-zinc-900 dark:text-zinc-100">{item.foodName || item.name}</strong>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                            {item.calories} kcal • P: {item.protein || 0}g • C: {item.carbohydrates || item.carbs || 0}g • F: {item.fat || 0}g
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <form onSubmit={handleAddFoodSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Meal Category</label>
                  <select
                    value={mealType}
                    onChange={e => setMealType(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                    <option value="Post Workout">Post Workout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Quantity / Servings</label>
                  <input
                    type="number"
                    step="0.5"
                    value={foodQuantity}
                    onChange={e => setFoodQuantity(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    placeholder="1.0"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingFood}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoggingFood ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Food Log to Backend...
                  </>
                ) : (
                  'Log Food to Backend DB'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: FULL WORKOUT SESSION DETAILS                                     */}
      {/* ========================================================================= */}
      {isWorkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsWorkoutModalOpen(false)}>
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-blue-400" /> Today's Workout Session
              </h3>
              <button
                onClick={() => setIsWorkoutModalOpen(false)}
                className="p-1 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {todayExercises.map((ex, index) => (
                <div key={ex.id} className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{ex.name}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">{ex.sets} Sets × {ex.reps} • {ex.weight}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExerciseComplete(ex.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                      ex.completed ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-blue-600 text-white hover:bg-blue-500'
                    }`}
                  >
                    {ex.completed ? 'Completed' : 'Mark Done'}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                navigate('/workouts');
                setIsWorkoutModalOpen(false);
              }}
              className="w-full py-2.5 border border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold rounded-xl transition text-xs"
            >
              Open Full Workout Planner
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RECIPES & DIETS PREVIEW                                          */}
      {/* ========================================================================= */}
      {isRecipesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsRecipesModalOpen(false)}>
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-rose-400" /> Diets & Recommended Recipes
              </h3>
              <button
                onClick={() => setIsRecipesModalOpen(false)}
                className="p-1 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {recipes.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/30 transition space-y-2">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">{r.category || 'Healthy Recipe'}</span>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{r.recipeName || r.name}</h4>
                  <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                    <span>{r.calories || 0} kcal</span>
                    <span>{r.protein || 0}g Protein</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                navigate('/diets');
                setIsRecipesModalOpen(false);
              }}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition text-xs shadow-lg"
            >
              Go to Full Diet & Workout Service
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
