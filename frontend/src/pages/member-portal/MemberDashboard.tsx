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
  Sliders,
  Coffee,
  Sun,
  Cookie,
  Moon,
  Trash2,
  PlusCircle,
  RotateCcw
} from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  getUserDashboard,
  logWater,
  getRecipes,
  logFoodItem,
  getDailyLog,
  deleteFoodLog,
  searchFoodsList,
  getAllFoodsList,
  getUserProfile
} from '../../lib/api/user';
import { getWorkouts, getExercises } from '../../lib/api/workouts';
import { OnboardingWizard } from '../../components/onboarding/OnboardingWizard';
import { HydrationModal } from '../../components/member-portal/HydrationModal';
import { FoodLogModal, LoggedFoodPayload, ModalTab } from '../../components/member-portal/FoodLogModal';

export interface FoodLogDashboardEntry {
  id: string;
  foodName: string;
  mealType: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner' | string;
  portionName?: string;
  customGrams?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  time?: string;
}

interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  target: string;
  completed: boolean;
}

export const EXERCISES_CATALOG: Record<string, { label: string; exercises: ExerciseItem[] }> = {};

export const PROGRAM_SPLITS_CONFIG: Record<string, {
  key: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  focusKeys: string[];
}> = {};

export const WORKOUT_SPLITS_DATA = EXERCISES_CATALOG;

export function getTodayWorkoutFocus(programKey: string): {
  focusKey: string;
  focusTitle: string;
  dayName: string;
  recoveryNote: string;
} {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const dayIndex = now.getDay();
  const dayName = days[dayIndex];

  return {
    focusKey: 'DAILY_WORKOUT',
    focusTitle: `${dayName}'s Assigned Routine`,
    dayName,
    recoveryNote: `Today's workouts loaded directly from database.`
  };
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

  // Food Log State & Itemized Meals Tracking
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const [foodLogs, setFoodLogs] = useState<FoodLogDashboardEntry[]>(() => {
    const dateKey = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`gymOSFoodLogs_${dateKey}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [foodModalInitialMeal, setFoodModalInitialMeal] = useState<ModalTab>('Breakfast');
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
    const dateKey = getTodayDateString();
    try {
      // 1. Fetch User Profile, Dashboard & Daily Food Logs from Backend API (GET /api/user/dashboard, GET /api/user/daily-log)
      const [dashRes, profileRes, dailyLogRes, recRes, workoutsData, exercisesData] = await Promise.all([
        getUserDashboard().catch(() => null),
        getUserProfile().catch(() => null),
        getDailyLog(dateKey).catch(() => null),
        getRecipes().catch(() => ({ data: { content: [] } })),
        getWorkouts().catch(() => []),
        getExercises().catch(() => [])
      ]);

      const realData = dashRes?.data || dashRes;
      const profileData = profileRes?.data || profileRes;
      const dailyLogData = dailyLogRes?.data || dailyLogRes;

      const fallbackDashboard = {
        today: {
          workoutDay: 'Push Day',
          workoutPlan: 'Push Pull Legs',
          date: new Date().toLocaleDateString('en-GB')
        },
        macros: {
          carbs: { current: 0, target: 250 },
          protein: { current: 0, target: 180 },
          fat: { current: 0, target: 70 }
        },
        calories: { current: 0, target: 2400 },
        activity: {
          water: { current: 0, target: 3.5, unit: 'L' }
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

      // Sync backend food logs into local state if available
      if (dailyLogData && Array.isArray(dailyLogData.foodLogs) && dailyLogData.foodLogs.length > 0) {
        const syncedLogs: FoodLogDashboardEntry[] = dailyLogData.foodLogs.map((item: any) => ({
          id: String(item.id || Date.now() + Math.random()),
          foodName: item.foodName || item.description || 'Food Item',
          mealType: item.mealType || 'Breakfast',
          portionName: item.portionName || `${item.quantity || 1} serving(s)`,
          customGrams: item.customGrams || (item.quantity ? Math.round(item.quantity * 100) : 100),
          calories: Math.round(item.calories || 0),
          protein: parseFloat((item.protein || 0).toFixed(1)),
          carbs: parseFloat((item.carbs || 0).toFixed(1)),
          fat: parseFloat((item.fat || 0).toFixed(1))
        }));
        setFoodLogs(syncedLogs);
        localStorage.setItem(`gymOSFoodLogs_${dateKey}`, JSON.stringify(syncedLogs));
      }

      const recipeList = recRes?.data?.content || recRes?.data || (Array.isArray(recRes) ? recRes : []);
      if (Array.isArray(recipeList) && recipeList.length > 0) {
        setRecipes(recipeList.slice(0, 4));
      }

      // Sync backend exercises into today's workout routine
      if (Array.isArray(exercisesData) && exercisesData.length > 0) {
        const savedProgramKey = localStorage.getItem('selectedGymOSProgramKey') || localStorage.getItem('selectedGymOSWorkoutSplit') || 'PPL';
        const { focusKey } = getTodayWorkoutFocus(savedProgramKey);
        const mappedExs: ExerciseItem[] = exercisesData.map((ex: any, idx: number) => ({
          id: String(ex.id || `db-ex-${idx}`),
          name: ex.name || 'Exercise',
          sets: ex.recommendedSets || 4,
          reps: ex.recommendedReps || '8-12 reps',
          weight: ex.equipment ? `${ex.equipment}` : 'Bodyweight',
          target: ex.muscleGroup || focusKey,
          completed: false
        }));
        if (mappedExs.length > 0) {
          setTodayExercises(prev => (prev.length === 0 ? mappedExs.slice(0, 10) : prev));
        }
      } else {
        setRecipes([
          { id: 'r1', recipeName: 'Grilled Chicken & Quinoa Bowl', category: 'High Protein', calories: 520, protein: 48 },
          { id: 'r2', recipeName: 'Avocado Egg White Toast', category: 'Breakfast', calories: 340, protein: 22 },
          { id: 'r3', recipeName: 'Salmon & Roasted Asparagus', category: 'Keto Friendly', calories: 480, protein: 42 },
          { id: 'r4', recipeName: 'Greek Yogurt Protein Smoothie', category: 'Post Workout', calories: 290, protein: 30 }
        ]);
      }
    } catch (err: any) {
      triggerAnnouncement(`Failed to load dashboard: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
    setIsWaterModalOpen(true);
  };

  const handleSaveWaterDraft = async (targetLiters: number, bottles: number, glasses: number) => {
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
        label: `${bottles} Bottle(s) (1L) + ${glasses} Glass(es) (250ml)`,
        type: bottles > 0 ? 'bottle' : 'glass'
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
    triggerAnnouncement(`Today's water intake history has been reset for a fresh start!`);
  };

  const handleOpenFoodModal = (meal: ModalTab = 'Breakfast') => {
    setFoodModalInitialMeal(meal);
    setIsFoodModalOpen(true);
  };

  // Real API Call: Log Food Item (POST /api/user/food/log) with complete payload
  const handleLogFoodItem = async (payload: LoggedFoodPayload) => {
    setIsLoggingFood(true);
    const dateKey = payload.date || getTodayDateString();

    // 1. Create optimistic entry for instant zero-latency UI update
    const optimisticEntry: FoodLogDashboardEntry = {
      id: String(Date.now()),
      foodName: payload.foodName,
      mealType: payload.mealType || 'Breakfast',
      portionName: payload.servingUnit || `${payload.customGrams || 100}g`,
      customGrams: payload.customGrams,
      calories: Math.round(payload.calories),
      protein: parseFloat(payload.protein.toFixed(1)),
      carbs: parseFloat(payload.carbs.toFixed(1)),
      fat: parseFloat(payload.fat.toFixed(1)),
      fiber: payload.fiber ? parseFloat(payload.fiber.toFixed(1)) : undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedList = [optimisticEntry, ...foodLogs];
    setFoodLogs(updatedList);
    localStorage.setItem(`gymOSFoodLogs_${dateKey}`, JSON.stringify(updatedList));

    try {
      // 2. Call backend API to persist in database
      await logFoodItem(payload);
      triggerAnnouncement(`Logged ${payload.foodName} (${Math.round(payload.calories)} kcal) to ${payload.mealType}!`);

      // 3. Re-sync backend dashboard and daily log
      const [updatedDash, updatedLogs] = await Promise.all([
        getUserDashboard().catch(() => null),
        getDailyLog(dateKey).catch(() => null)
      ]);

      if (updatedDash) {
        setDashboardData(updatedDash.data || updatedDash);
      }
      if (updatedLogs?.data?.foodLogs && Array.isArray(updatedLogs.data.foodLogs)) {
        const synced: FoodLogDashboardEntry[] = updatedLogs.data.foodLogs.map((item: any) => ({
          id: String(item.id),
          foodName: item.foodName || 'Food Item',
          mealType: item.mealType || 'Breakfast',
          portionName: item.portionName,
          customGrams: item.customGrams || (item.quantity ? Math.round(item.quantity * 100) : 100),
          calories: Math.round(item.calories || 0),
          protein: parseFloat((item.protein || 0).toFixed(1)),
          carbs: parseFloat((item.carbs || 0).toFixed(1)),
          fat: parseFloat((item.fat || 0).toFixed(1))
        }));
        setFoodLogs(synced);
        localStorage.setItem(`gymOSFoodLogs_${dateKey}`, JSON.stringify(synced));
      }

      setIsFoodModalOpen(false);
    } catch (err: any) {
      triggerAnnouncement(`Food logged to your dashboard! Backend sync notice: ${err.message}`);
      setIsFoodModalOpen(false);
    } finally {
      setIsLoggingFood(false);
    }
  };

  const handleDeleteFoodLog = async (id: string, foodName: string) => {
    const dateKey = getTodayDateString();
    const updated = foodLogs.filter(f => f.id !== id);
    setFoodLogs(updated);
    localStorage.setItem(`gymOSFoodLogs_${dateKey}`, JSON.stringify(updated));
    triggerAnnouncement(`Removed ${foodName} from today's logged meals.`);

    try {
      await deleteFoodLog(id);
      const updatedDash = await getUserDashboard().catch(() => null);
      if (updatedDash) {
        setDashboardData(updatedDash.data || updatedDash);
      }
    } catch (e) {
      console.warn('Backend delete error (logged locally):', e);
    }
  };

  const handleClearFoodLogs = () => {
    const dateKey = getTodayDateString();
    setFoodLogs([]);
    localStorage.removeItem(`gymOSFoodLogs_${dateKey}`);
    triggerAnnouncement(`Today's meal logs have been reset.`);
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

  const { today, macros, calories, activity } = dashboardData || {};

  // Compute live accurate totals from foodLogs + backend
  const totalCaloriesLogged = useMemo(() => {
    const localSum = foodLogs.reduce((sum, item) => sum + (item.calories || 0), 0);
    const backendVal = calories?.current || 0;
    return Math.max(localSum, backendVal);
  }, [foodLogs, calories]);

  const targetCaloriesVal = calories?.target && calories.target > 0 ? calories.target : 2400;

  const totalCarbsLogged = useMemo(() => {
    const localSum = parseFloat(foodLogs.reduce((sum, item) => sum + (item.carbs || 0), 0).toFixed(1));
    const backendVal = macros?.carbs?.current || 0;
    return Math.max(localSum, backendVal);
  }, [foodLogs, macros]);
  const targetCarbsVal = macros?.carbs?.target && macros.carbs.target > 0 ? macros.carbs.target : 250;

  const totalProteinLogged = useMemo(() => {
    const localSum = parseFloat(foodLogs.reduce((sum, item) => sum + (item.protein || 0), 0).toFixed(1));
    const backendVal = macros?.protein?.current || 0;
    return Math.max(localSum, backendVal);
  }, [foodLogs, macros]);
  const targetProteinVal = macros?.protein?.target && macros.protein.target > 0 ? macros.protein.target : 180;

  const totalFatLogged = useMemo(() => {
    const localSum = parseFloat(foodLogs.reduce((sum, item) => sum + (item.fat || 0), 0).toFixed(1));
    const backendVal = macros?.fat?.current || 0;
    return Math.max(localSum, backendVal);
  }, [foodLogs, macros]);
  const targetFatVal = macros?.fat?.target && macros.fat.target > 0 ? macros.fat.target : 70;

  const waterCurr = activity?.water?.current ?? 2.25;
  const waterTarg = activity?.water?.target ?? 3.5;

  // Percentages for Concentric Rings
  const carbPct = Math.min((totalCarbsLogged / (targetCarbsVal || 1)) * 100, 100);
  const protPct = Math.min((totalProteinLogged / (targetProteinVal || 1)) * 100, 100);
  const fatPct = Math.min((totalFatLogged / (targetFatVal || 1)) * 100, 100);

  // Helper to render each meal category card (Breakfast, Lunch, Snacks, Dinner)
  const renderMealCard = (
    mealName: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner',
    icon: React.ReactNode,
    gradientTheme: string,
    accentColor: string
  ) => {
    const mealItems = foodLogs.filter(
      item => (item.mealType || '').toLowerCase() === mealName.toLowerCase()
    );
    const mealCalories = mealItems.reduce((sum, item) => sum + (item.calories || 0), 0);
    const mealProtein = parseFloat(mealItems.reduce((sum, item) => sum + (item.protein || 0), 0).toFixed(1));
    const mealCarbs = parseFloat(mealItems.reduce((sum, item) => sum + (item.carbs || 0), 0).toFixed(1));
    const mealFat = parseFloat(mealItems.reduce((sum, item) => sum + (item.fat || 0), 0).toFixed(1));

    return (
      <div className={`p-3 sm:p-4 rounded-2xl border bg-gradient-to-b ${gradientTheme} flex flex-col justify-between space-y-2 sm:space-y-3 shadow-xs hover:shadow-md transition`}>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-zinc-200/70 dark:border-zinc-800/70 pb-2 sm:pb-2.5 gap-1">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="p-1 sm:p-1.5 rounded-lg bg-white dark:bg-zinc-800 shadow-xs border border-zinc-200 dark:border-zinc-700 shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-[11px] sm:text-xs font-extrabold text-zinc-900 dark:text-zinc-100 truncate">{mealName}</h3>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 block truncate">
                {mealCalories} kcal
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenFoodModal(mealName)}
            className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-[9px] sm:text-[10px] font-bold transition flex items-center gap-0.5 sm:gap-1 shadow-xs shrink-0"
            title={`Add food item to ${mealName}`}
          >
            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>Add</span>
          </button>
        </div>

        {/* Meal Items List */}
        <div className="space-y-1.5 sm:space-y-2 min-h-[55px] sm:min-h-[90px] max-h-[140px] sm:max-h-[190px] overflow-y-auto pr-0.5 sm:pr-1">
          {mealItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-2 sm:py-4 text-center text-zinc-400 space-y-0.5 sm:space-y-1">
              <Apple className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[1.5] text-zinc-300 dark:text-zinc-600" />
              <p className="text-[9px] sm:text-[11px] text-zinc-400 dark:text-zinc-500">No food logged</p>
              <button
                type="button"
                onClick={() => handleOpenFoodModal(mealName)}
                className={`text-[9px] sm:text-[10px] ${accentColor} font-bold hover:underline`}
              >
                + Log
              </button>
            </div>
          ) : (
            mealItems.map((item) => (
              <div
                key={item.id}
                className="p-1.5 sm:p-2.5 rounded-xl bg-white/95 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition flex items-center justify-between gap-1.5 shadow-xs group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate" title={item.foodName}>
                      {item.foodName}
                    </h4>
                    <span className="text-[10px] sm:text-[11px] font-black font-mono text-orange-600 dark:text-orange-400 shrink-0 ml-0.5">
                      {item.calories}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-300 truncate max-w-[55px] sm:max-w-none">{item.portionName || `${item.customGrams || 100}g`}</span>
                    <span className="text-[8px] sm:text-[9px] text-zinc-400 dark:text-zinc-500 shrink-0">
                      P:{item.protein} C:{item.carbs} F:{item.fat}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteFoodLog(item.id, item.foodName)}
                  className="p-0.5 sm:p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-70 group-hover:opacity-100 transition shrink-0"
                  title="Remove from meal log"
                >
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Meal Macro Subtotal Footer */}
        {mealItems.length > 0 && (
          <div className="pt-1.5 sm:pt-2 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between text-[8px] sm:text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold hidden sm:inline">Subtotal:</span>
            <div className="flex items-center gap-1 sm:gap-1.5 font-bold justify-between sm:justify-end w-full sm:w-auto">
              <span className="text-emerald-600 dark:text-emerald-400">P:{mealProtein}g</span>
              <span className="text-cyan-600 dark:text-cyan-400">C:{mealCarbs}g</span>
              <span className="text-amber-600 dark:text-amber-400">F:{mealFat}g</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      
      {/* Member Onboarding & Fitness Setup Banner (Hidden once onboarding is completed) */}
      {!isOnboardingCompleted && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-white dark:from-blue-900/60 dark:via-indigo-900/40 dark:to-zinc-900 border border-blue-200 dark:border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Member Fitness Profile & Nutrition Setup
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Complete the 4-step onboarding wizard to compute your custom calorie, macro & mineral chart.</p>
            </div>
          </div>
          <button
            onClick={() => setIsOnboardingModalOpen(true)}
            className="w-full sm:w-auto px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Launch 4-Step Onboarding Setup
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP SECTION: 2 COLUMNS (Left: Concentric Rings & Stats, Right: Today's Workout) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT CARD: Concentric Gauge, Macro Specs, Action Buttons & Workout CTA   */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 lg:p-7 shadow-2xl flex flex-col justify-between space-y-4 sm:space-y-6 relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3 sm:pb-4 gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shadow-sm shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base lg:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                  Daily Intake & Progress
                </h2>
                <span className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 block truncate">
                  Real-time Caloric & Macronutrient Balance
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] sm:text-xs font-mono font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-500/30 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-sm">
                {totalCaloriesLogged} / {targetCaloriesVal} Kcal
              </span>
            </div>
          </div>

          {/* Concentric Gauge + Macro Breakdown Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center">
            
            {/* 3 Concentric Animated Radial Rings */}
            <div className="sm:col-span-5 flex items-center justify-center relative">
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 lg:w-52 lg:h-52 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  {/* Outer Ring: Carbs (Cyan) */}
                  <circle cx="100" cy="100" r="80" fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="11" />
                  <circle
                    cx="100" cy="100" r="80"
                    fill="none"
                    className="stroke-cyan-500 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                    strokeWidth="11"
                    strokeDasharray={502.6}
                    strokeDashoffset={502.6 - (502.6 * carbPct) / 100}
                    strokeLinecap="round"
                  />

                  {/* Middle Ring: Protein (Emerald) */}
                  <circle cx="100" cy="100" r="60" fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="11" />
                  <circle
                    cx="100" cy="100" r="60"
                    fill="none"
                    className="stroke-emerald-500 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    strokeWidth="11"
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * protPct) / 100}
                    strokeLinecap="round"
                  />

                  {/* Inner Ring: Fats (Amber) */}
                  <circle cx="100" cy="100" r="40" fill="none" className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="11" />
                  <circle
                    cx="100" cy="100" r="40"
                    fill="none"
                    className="stroke-amber-500 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    strokeWidth="11"
                    strokeDasharray={251.3}
                    strokeDashoffset={251.3 - (251.3 * fatPct) / 100}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Content Inside Gauge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Flame className="w-5 h-5 sm:w-7 sm:h-7 text-orange-500 mb-0.5 animate-pulse" />
                  <span className="text-xl sm:text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">{totalCaloriesLogged}</span>
                  <span className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Target {targetCaloriesVal}</span>
                </div>
              </div>
            </div>

            {/* Macro & Hydration Specs Cards with Mini Progress Bars (2x2 on Mobile, 1-col on Desktop) */}
            <div className="sm:col-span-7 grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-2.5 text-xs">
              
              {/* Carbs Card */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-50/70 dark:bg-zinc-950/60 border border-cyan-200/80 dark:border-cyan-500/20 space-y-1 sm:space-y-1.5 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.8)] shrink-0"></span>
                    <span className="text-[11px] sm:text-xs text-cyan-800 dark:text-cyan-300 font-bold truncate">Carbs</span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-zinc-900 dark:text-zinc-100 font-extrabold truncate">
                    {totalCarbsLogged}g <span className="text-zinc-400 font-normal">/{targetCarbsVal}g</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-cyan-200/50 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (totalCarbsLogged / (targetCarbsVal || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Protein Card */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/70 dark:bg-zinc-950/60 border border-emerald-200/80 dark:border-emerald-500/20 space-y-1 sm:space-y-1.5 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] shrink-0"></span>
                    <span className="text-[11px] sm:text-xs text-emerald-800 dark:text-emerald-300 font-bold truncate">Protein</span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-zinc-900 dark:text-zinc-100 font-extrabold truncate">
                    {totalProteinLogged}g <span className="text-zinc-400 font-normal">/{targetProteinVal}g</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-emerald-200/50 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (totalProteinLogged / (targetProteinVal || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Fats Card */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50/70 dark:bg-zinc-950/60 border border-amber-200/80 dark:border-amber-500/20 space-y-1 sm:space-y-1.5 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)] shrink-0"></span>
                    <span className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300 font-bold truncate">Fats</span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-zinc-900 dark:text-zinc-100 font-extrabold truncate">
                    {totalFatLogged}g <span className="text-zinc-400 font-normal">/{targetFatVal}g</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-amber-200/50 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (totalFatLogged / (targetFatVal || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Total Water Card */}
              <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50/70 dark:bg-zinc-950/60 border border-blue-200/80 dark:border-blue-500/20 space-y-1 sm:space-y-1.5 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)] shrink-0"></span>
                    <span className="text-[11px] sm:text-xs text-blue-800 dark:text-blue-300 font-bold truncate">Water</span>
                  </div>
                  <span className="font-mono text-[10px] sm:text-xs text-zinc-900 dark:text-zinc-100 font-extrabold truncate">
                    {waterCurr}L <span className="text-zinc-400 font-normal">/{waterTarg}L</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-blue-200/50 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (waterCurr / (waterTarg || 3.5)) * 100)}%` }}
                  />
                </div>
              </div>

            </div>

          </div>

          {/* Action Buttons: Add Water & Add Food */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            <button
              onClick={handleOpenWaterModal}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-cyan-300 dark:border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-700 dark:text-cyan-300 font-extrabold transition shadow-md sm:shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/15 text-xs sm:text-sm"
            >
              <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500 animate-pulse" />
              Add Water
            </button>

            <button
              onClick={() => handleOpenFoodModal('Breakfast')}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-emerald-300 dark:border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold transition shadow-md sm:shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/15 text-xs sm:text-sm"
            >
              <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
              Add Food
            </button>
          </div>

          {/* Prominent Card / Button: Check Your Workout */}
          <button
            onClick={() => setIsWorkoutModalOpen(true)}
            className="w-full p-3 sm:p-4 rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-100 hover:from-blue-200 hover:to-indigo-200 dark:from-blue-900/40 dark:via-indigo-900/40 dark:to-blue-900/40 dark:hover:from-blue-900/60 dark:hover:to-indigo-900/60 text-blue-900 dark:text-white font-bold transition flex items-center justify-between group shadow-lg sm:shadow-xl"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-200/50 dark:bg-blue-600/30 border border-blue-300 dark:border-blue-400/40 flex items-center justify-center text-blue-700 dark:text-blue-300 group-hover:scale-105 transition-transform shrink-0">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-left min-w-0">
                <span className="text-xs sm:text-sm font-extrabold text-blue-900 dark:text-blue-100 block truncate">Check Your Workout</span>
                <span className="text-[11px] sm:text-xs text-blue-700 dark:text-blue-300 font-normal block truncate">View today's routine ({todayExercises.filter(e => e.completed).length}/{todayExercises.length} completed)</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 dark:text-blue-300 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>

        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT CARD: Today's Workout Schedule & Exercise List                   */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between space-y-3 sm:space-y-4">
          
          {/* Header bar: Date (Left) & Active Workout Focus / Change Button (Right) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-semibold text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Date :- <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{formattedTodayDate} ({todayFocusInfo.dayName})</strong></span>
            </div>

            {selectedWorkoutProgram ? (
              <div className="flex items-center justify-between sm:justify-end gap-2 text-left sm:text-right">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider block">Today's Focus ({todayFocusInfo.dayName})</span>
                  <span className="text-[11px] sm:text-xs font-black text-cyan-400 font-mono">
                    {todayFocusInfo.focusTitle}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/workouts?tab=SELECT_WORKOUT')}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-700 text-[10px] sm:text-[11px] font-bold transition shrink-0"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/workouts?tab=SELECT_WORKOUT')}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/30"
              >
                <Sliders className="w-3.5 h-3.5" /> Select Your Program
              </button>
            )}
          </div>

          {/* List of Today's Exercises or Prompt to Select */}
          {selectedWorkoutProgram === '' ? (
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-950/60 border border-dashed border-blue-200 dark:border-blue-500/30 text-center space-y-3 sm:space-y-4 min-h-[220px] sm:min-h-[260px] my-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-950/50">
                <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">No Workout Selected</h4>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
                  Please select your workout routine split on the Workouts & Diets page to view and track today's routine.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/workouts?tab=SELECT_WORKOUT')}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition flex items-center gap-2"
              >
                <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Select Your Workout
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] sm:max-h-[360px] overflow-y-auto pr-1">
              {todayExercises.map((ex, index) => (
                <div
                  key={ex.id}
                  onClick={() => toggleExerciseComplete(ex.id)}
                  className={`p-2.5 sm:p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    ex.completed
                      ? 'bg-zinc-100 dark:bg-zinc-950/40 border-emerald-500/30 text-zinc-500 dark:text-zinc-400'
                      : 'bg-white dark:bg-zinc-950/80 border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <button
                      type="button"
                      className="shrink-0 focus:outline-none"
                      aria-label={`Mark ${ex.name} as completed`}
                    >
                      {ex.completed ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 hover:text-blue-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${ex.completed ? 'line-through text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {index + 1}. {ex.name}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 sm:gap-2 mt-0.5 font-mono">
                        <span>{ex.sets} Sets × {ex.reps}</span>
                        <span>•</span>
                        <span className="text-blue-400">{ex.weight}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded border shrink-0 ${
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

          <div className="pt-2.5 sm:pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
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
      {/* TODAY'S MEALS & LOGGED NUTRITION (Breakfast, Lunch, Snacks, Dinner)        */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-6 lg:p-7 shadow-2xl space-y-4 sm:space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3 sm:pb-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base lg:text-lg font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Today's Meals & Logged Nutrition
                </h2>
                <span className="text-[10px] sm:text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                  {foodLogs.length} Logged
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                Breakdown of calories and macros consumed across Breakfast, Lunch, Snacks & Dinner.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {foodLogs.length > 0 && (
              <button
                type="button"
                onClick={handleClearFoodLogs}
                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] sm:text-xs font-semibold transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Reset Meals
              </button>
            )}
            <button
              type="button"
              onClick={() => handleOpenFoodModal('Breakfast')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add Food Item
            </button>
          </div>
        </div>

        {/* 4 Meal Cards Grid (2x2 on Mobile & Tablet, 4-col on XL Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          
          {/* 1. BREAKFAST CARD */}
          {renderMealCard('Breakfast', <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />, 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20', 'text-emerald-600 dark:text-emerald-400')}

          {/* 2. LUNCH CARD */}
          {renderMealCard('Lunch', <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />, 'from-cyan-500/10 to-blue-500/5 border-cyan-500/20', 'text-cyan-600 dark:text-cyan-400')}

          {/* 3. SNACKS CARD */}
          {renderMealCard('Snacks', <Cookie className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />, 'from-amber-500/10 to-orange-500/5 border-amber-500/20', 'text-amber-600 dark:text-amber-400')}

          {/* 4. DINNER CARD */}
          {renderMealCard('Dinner', <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />, 'from-indigo-500/10 to-purple-500/5 border-indigo-500/20', 'text-indigo-600 dark:text-indigo-400')}

        </div>

        {/* Day Nutrition Balance Footer */}
        <div className="p-3 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 shrink-0" />
            <span className="text-zinc-600 dark:text-zinc-400 font-sans text-[11px] sm:text-xs">Calories Consumed:</span>
            <strong className="text-zinc-900 dark:text-zinc-100 font-black text-xs sm:text-sm">{totalCaloriesLogged} kcal</strong>
            <span className="text-zinc-400 text-[10px] sm:text-xs">/ {targetCaloriesVal} kcal</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs flex-wrap">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Protein: {totalProteinLogged}g</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">Carbs: {totalCarbsLogged}g</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">Fats: {totalFatLogged}g</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: 5 QUICK ACTION CARDS (2-COL ON MOBILE, 5-COL ON LG)       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        
        {/* Card 1: Check BMI */}
        <button
          onClick={() => navigate('/workouts?tab=BMI_CALCULATOR')}
          className="p-3.5 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-850/80 transition-all text-center flex flex-col items-center justify-center space-y-2 sm:space-y-3 group shadow-md sm:shadow-lg"
        >
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
            <Calculator className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="w-full">
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm group-hover:text-blue-400 transition-colors truncate">Check BMI</h3>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Body mass & health</p>
          </div>
        </button>

        {/* Card 2: Check Other Workout */}
        <button
          onClick={() => navigate('/workouts')}
          className="p-3.5 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-850/80 transition-all text-center flex flex-col items-center justify-center space-y-2 sm:space-y-3 group shadow-md sm:shadow-lg"
        >
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
            <Dumbbell className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="w-full">
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm group-hover:text-emerald-400 transition-colors truncate">Other Workout</h3>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Explore workout plans</p>
          </div>
        </button>

        {/* Card 3: Check Activity */}
        <button
          onClick={() => navigate('/activities')}
          className="p-3.5 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-850/80 transition-all text-center flex flex-col items-center justify-center space-y-2 sm:space-y-3 group shadow-md sm:shadow-lg"
        >
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
            <Activity className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="w-full">
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm group-hover:text-amber-400 transition-colors truncate">Check Activity</h3>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Sessions & classes</p>
          </div>
        </button>

        {/* Card 4: Check Workout Splits */}
        <button
          onClick={() => navigate('/workouts?tab=SELECT_WORKOUT')}
          className="p-3.5 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-850/80 transition-all text-center flex flex-col items-center justify-center space-y-2 sm:space-y-3 group shadow-md sm:shadow-lg"
        >
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
            <Layers className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="w-full">
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm group-hover:text-indigo-400 transition-colors truncate">Workout Splits</h3>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Preset split routines</p>
          </div>
        </button>

        {/* Card 5: Check Diets & Recipes */}
        <button
          onClick={() => navigate('/diets')}
          className="col-span-2 sm:col-span-1 p-3.5 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-850/80 transition-all text-center flex flex-col items-center justify-center space-y-2 sm:space-y-3 group shadow-md sm:shadow-lg"
        >
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">
            <Utensils className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="w-full">
            <h3 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm group-hover:text-rose-400 transition-colors truncate">Diets & Recipes</h3>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Nutrition & healthy meals</p>
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
      {/* MODAL 2: HYDRATION & WATER TRACKER MODAL (Rectangular A4 Card HUD)         */}
      {/* ========================================================================= */}
      <HydrationModal
        isOpen={isWaterModalOpen}
        onClose={() => setIsWaterModalOpen(false)}
        currentWaterLiters={waterCurr}
        targetWaterLiters={waterTarg}
        waterLogs={waterLogs}
        onSaveWaterLog={handleSaveWaterDraft}
        onResetWaterLogs={handleClearWaterLogs}
        isSaving={isWaterAdding}
      />

      {/* ========================================================================= */}
      {/* MODAL 3: LOG FOOD & NUTRITION (Multi-Category Tabs, Fasting, Pie Chart)   */}
      {/* ========================================================================= */}
      <FoodLogModal
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
        onLogFoodItem={handleLogFoodItem}
        onOpenWaterModal={() => {
          setIsFoodModalOpen(false);
          handleOpenWaterModal();
        }}
        initialMealType={foodModalInitialMeal}
        currentWaterLiters={waterCurr}
        targetWaterLiters={waterTarg}
        isLogging={isLoggingFood}
        foodLogs={foodLogs}
        onDeleteFoodLog={handleDeleteFoodLog}
      />

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
