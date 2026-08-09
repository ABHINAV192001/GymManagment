import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Dumbbell,
  Apple,
  Plus,
  Trash,
  Check,
  Sparkles,
  Calculator,
  Info,
  Flame,
  ShieldCheck,
  Zap,
  ChevronRight,
  Filter,
  Layers,
  Scale,
  Activity,
  Heart,
  Droplets,
  Award,
  Scan,
  Target,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { Exercise, FoodItem } from '../../types';
import { usePermissions } from '../../lib/usePermissions';
import { HumanBodyMap, MuscleGroupKey } from '../../components/workouts/HumanBodyMap';
import { ExerciseDetailModal } from '../../components/workouts/ExerciseDetailModal';
import QrScannerTab from '../../components/workouts/QrScannerTab';
import { getExercises, getWorkouts } from '../../lib/api/workouts';
import { getFoods } from '../../lib/api/food';
import { calculateHealthMetrics, HealthResponse } from '../../lib/api/health';
import { PROGRAM_SPLITS_CONFIG, EXERCISES_CATALOG, getTodayWorkoutFocus } from '../member-portal/MemberDashboard';

export type ActiveTab =
  | 'SCANNER'
  | 'SELECT_WORKOUT'
  | 'PRESET_SPLITS'
  | 'CUSTOM_BUILDER'
  | 'MACRO_METER'
  | 'BMI_CALCULATOR';

export const WorkoutsAndDiets: React.FC = () => {
  const outletCtx = useOutletContext<{ triggerAnnouncement?: (msg: string) => void }>() || {};
  const triggerAnnouncement = outletCtx?.triggerAnnouncement || (() => {});
  const permissions = usePermissions();
  const canCreate = permissions?.canCreate || (() => true);

  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as ActiveTab | null;
  const [activeTab, setActiveTab] = useState<ActiveTab>(tabParam || 'SCANNER');

  const [selectedProgramKey, setSelectedProgramKey] = useState<string>(() => {
    return localStorage.getItem('selectedGymOSProgramKey') || localStorage.getItem('selectedGymOSWorkoutSplit') || 'PPL';
  });

  const [customExerciseSelections, setCustomExerciseSelections] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    Object.keys(EXERCISES_CATALOG).forEach(focusKey => {
      const savedJson = localStorage.getItem(`selectedGymOSCustomExercises_${focusKey}`);
      if (savedJson) {
        try {
          initial[focusKey] = JSON.parse(savedJson);
        } catch (e) {
          initial[focusKey] = EXERCISES_CATALOG[focusKey].exercises.map(e => e.id);
        }
      } else {
        initial[focusKey] = EXERCISES_CATALOG[focusKey].exercises.map(e => e.id);
      }
    });
    return initial;
  });

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const toggleExerciseSelection = (focusKey: string, exerciseId: string) => {
    setCustomExerciseSelections(prev => {
      const currentList = prev[focusKey] || EXERCISES_CATALOG[focusKey]?.exercises.map(e => e.id) || [];
      const updated = currentList.includes(exerciseId)
        ? currentList.filter(id => id !== exerciseId)
        : [...currentList, exerciseId];
      
      localStorage.setItem(`selectedGymOSCustomExercises_${focusKey}`, JSON.stringify(updated));
      return { ...prev, [focusKey]: updated };
    });
  };

  const handleActivateProgram = (programKey: string) => {
    setSelectedProgramKey(programKey);
    localStorage.setItem('selectedGymOSProgramKey', programKey);
    localStorage.setItem('selectedGymOSWorkoutSplit', programKey);
    const prog = PROGRAM_SPLITS_CONFIG[programKey];
    triggerAnnouncement(`Activated ${prog?.title || programKey}! Your dashboard routine has been updated.`);
  };

  // Muscle selection & exercise list state
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroupKey | null>('CHEST');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'PRO'>('ALL');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [inspectingExercise, setInspectingExercise] = useState<Exercise | null>(null);

  // Selected Split Routine
  const [selectedSplitId, setSelectedSplitId] = useState<string>('ppl');

  // Workout Builder state
  const [workoutName, setWorkoutName] = useState('My Custom Hypertrophy Routine');
  const [workoutExercises, setWorkoutExercises] = useState<{ exerciseId: string; sets: number; reps: string }[]>([
    { exerciseId: '11111111-1111-1111-1111-111111111101', sets: 4, reps: '8-10' },
    { exerciseId: '11111111-1111-1111-1111-111111111102', sets: 4, reps: '10-12' },
  ]);
  const [selectedExToAdd, setSelectedExToAdd] = useState('');
  const [addSets, setAddSets] = useState('4');
  const [addReps, setAddReps] = useState('8-12');

  // Diet / Macro Calculator state
  const [dietName, setDietName] = useState('High-Protein Muscle Building Diet');
  const [dietFoods, setDietFoods] = useState<{ foodId: string; quantityG: number }[]>([
    { foodId: 'f2', quantityG: 200 }, // 200g chicken
    { foodId: 'f4', quantityG: 150 }, // 150g rice
  ]);
  const [selectedFoodToAdd, setSelectedFoodToAdd] = useState('f6'); // whey
  const [addGrams, setAddGrams] = useState('30');

  // BMI & Complete Health Calculator State with Dynamic Units
  const [weightInput, setWeightInput] = useState('75');
  const [weightUnit, setWeightUnit] = useState<'KG' | 'LBS'>('KG');

  const [heightUnit, setHeightUnit] = useState<'CM' | 'M' | 'FT'>('CM');
  const [heightCmInput, setHeightCmInput] = useState('178');
  const [heightMInput, setHeightMInput] = useState('1.78');
  const [heightFtInput, setHeightFtInput] = useState('5');
  const [heightInInput, setHeightInInput] = useState('10');

  const [age, setAge] = useState('25');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [activityLevel, setActivityLevel] = useState<'SEDENTARY' | 'MODERATE' | 'ACTIVE' | 'EXTREME'>('MODERATE');

  // Fetch Exercises from Backend
  useEffect(() => {
    async function loadExercises() {
      setLoadingExercises(true);
      try {
        const data = await getExercises(selectedMuscle || undefined);
        setExercises(Array.isArray(data) ? data : []);
        if (data && data.length > 0 && !selectedExToAdd) {
          setSelectedExToAdd(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch exercises from backend', err);
        setExercises([]);
      } finally {
        setLoadingExercises(false);
      }
    }
    loadExercises();
  }, [selectedMuscle]);

  // Fetch Foods & Preset Workout Splits from Backend
  const [foodsList, setFoodsList] = useState<FoodItem[]>([]);
  const [presetSplits, setPresetSplits] = useState<any[]>([]);

  useEffect(() => {
    async function loadBackendData() {
      try {
        const [foodsData, splitsData] = await Promise.all([
          getFoods().catch(() => []),
          getWorkouts().catch(() => [])
        ]);
        setFoodsList(foodsData);
        setPresetSplits(splitsData);
      } catch (err) {
        console.error('Error fetching backend foods or splits', err);
      }
    }
    loadBackendData();
  }, []);

  // Fetch Health Metrics dynamically from Spring Boot HealthCalculatorController (/api/health/calculate)
  const [healthMetrics, setHealthMetrics] = useState<HealthResponse | null>(null);

  useEffect(() => {
    async function loadHealthMetrics() {
      try {
        const w = weightUnit === 'LBS' ? (parseFloat(weightInput) || 0) * 0.453592 : (parseFloat(weightInput) || 75);
        let h = 178;
        if (heightUnit === 'CM') h = parseFloat(heightCmInput) || 178;
        else if (heightUnit === 'M') h = (parseFloat(heightMInput) || 1.78) * 100;
        else if (heightUnit === 'FT') h = ((parseFloat(heightFtInput) || 5) * 12 + (parseFloat(heightInInput) || 10)) * 2.54;

        const data = await calculateHealthMetrics({
          weightKg: w,
          heightCm: h,
          age: parseInt(age) || 25,
          gender,
          activityLevel
        });
        if (data) setHealthMetrics(data);
      } catch (err) {
        console.error('Health metrics calculation error', err);
      }
    }
    loadHealthMetrics();
  }, [weightInput, weightUnit, heightUnit, heightCmInput, heightMInput, heightFtInput, heightInInput, age, gender, activityLevel]);

  // Compute Exercise Counts per muscle group
  const exerciseCounts = useMemo(() => {
    const counts: Record<string, number> = {
      CHEST: 0, BACK: 0, SHOULDERS: 0, BICEPS: 0, TRICEPS: 0, FOREARMS: 0, ABS: 0, QUADS: 0, HAMSTRINGS: 0, GLUTES: 0, CALVES: 0
    };
    exercises.forEach(e => {
      const group = (e.muscleGroup || '').toUpperCase();
      if (counts[group] !== undefined) counts[group]++;
    });
    return counts;
  }, [exercises]);

  // Filtered exercises by difficulty
  const filteredExercises = useMemo(() => {
    return exercises.filter(e => {
      if (selectedDifficulty === 'ALL') return true;
      return e.difficultyLevel === selectedDifficulty;
    });
  }, [exercises, selectedDifficulty]);

  // Selected Split details
  const activeSplit = useMemo(() => {
    return presetSplits.find(s => s.id === selectedSplitId) || (presetSplits.length > 0 ? presetSplits[0] : null);
  }, [presetSplits, selectedSplitId]);



  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExToAdd) return;
    setWorkoutExercises([
      ...workoutExercises,
      { exerciseId: selectedExToAdd, sets: Number(addSets), reps: addReps },
    ]);
    const name = exercises.find(ex => ex.id === selectedExToAdd)?.name || 'Exercise';
    triggerAnnouncement(`Added ${name} to your custom split draft.`);
  };

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    setDietFoods([...dietFoods, { foodId: selectedFoodToAdd, quantityG: Number(addGrams) }]);
    const name = foodsList.find(f => f.id === selectedFoodToAdd)?.name || 'Food';
    triggerAnnouncement(`Added ${addGrams}g of ${name} to macro meal draft.`);
  };

  // Calculate total macros
  const calculateTotalMacros = () => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    dietFoods.forEach(item => {
      const food = foodsList.find(f => f.id === item.foodId);
      if (!food) return;
      const factor = item.quantityG / 100;
      calories += food.calories * factor;
      protein += food.protein * factor;
      carbs += food.carbs * factor;
      fat += food.fats * factor;
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    };
  };

  const macros = calculateTotalMacros();

  return (
    <div className="space-y-8 pb-12">
      {/* ── TOP BAR OPTION NAVIGATION ──────────────────────────────────────── */}
      <div className="p-2 rounded-2xl bg-white dark:bg-[#090e17] border border-zinc-200 dark:border-cyan-500/20 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'SCANNER', label: '3D Sci-Fi Target Scanner', icon: Activity, defaultBadge: true },
            { id: 'SELECT_WORKOUT', label: 'Select Workout Routine', icon: Target },
            { id: 'PRESET_SPLITS', label: 'Top-Rated Hypertrophy Workout Splits', icon: Zap },
            { id: 'CUSTOM_BUILDER', label: 'Custom Hypertrophy Split Draft', icon: Dumbbell },
            { id: 'MACRO_METER', label: 'Dynamic Nutrition Macro Meter', icon: Apple },
            { id: 'BMI_CALCULATOR', label: 'BMI & Health Calculator', icon: Scale },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 font-black scale-[1.02]'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-cyan-400'}`} />
                <span>{tab.label}</span>
                {tab.defaultBadge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                    Default
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedMuscle && (
          <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Target Locked: {selectedMuscle}</span>
          </div>
        )}
      </div>

      {/* ── TAB 1: 3D SCI-FI TARGET SCANNER (DEFAULT VIEW) ──────────────────── */}
      {activeTab === 'SCANNER' && (
        <div className="space-y-8">
          <HumanBodyMap
            selectedMuscle={selectedMuscle}
            onSelectMuscle={setSelectedMuscle}
            exerciseCounts={exerciseCounts}
          />

          {/* 10+ Exercises List for Selected Muscle */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-cyan-500" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">
                    Workouts for {selectedMuscle || 'All Muscle Groups'}
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  10+ exercise plans with step-by-step form execution guides, bench angles, & safety cues.
                </p>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                Displaying <span className="text-cyan-400 font-bold">{filteredExercises.length}</span> exercises
              </div>
            </div>

            {loadingExercises ? (
              <div className="p-12 text-center text-xs text-zinc-500">Loading exercise database...</div>
            ) : filteredExercises.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500">
                No exercises found for this filter. Select another muscle group.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredExercises.map(ex => (
                  <div
                    key={ex.id}
                    className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4 shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {ex.muscleGroup}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {ex.equipment && (
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                              {ex.equipment}
                            </span>
                          )}
                          {ex.difficultyLevel && (
                            <span
                              className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                                ex.difficultyLevel === 'PRO'
                                  ? 'bg-red-500/20 text-red-400'
                                  : ex.difficultyLevel === 'INTERMEDIATE'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {ex.difficultyLevel}
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{ex.name}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{ex.description}</p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                        <div className="p-1.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                          <span className="block text-cyan-400 font-bold">{ex.recommendedSets || 4}</span>
                          <span className="text-zinc-500">Sets</span>
                        </div>
                        <div className="p-1.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                          <span className="block text-amber-400 font-bold">{ex.recommendedReps || '8-12'}</span>
                          <span className="text-zinc-500">Reps</span>
                        </div>
                        <div className="p-1.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                          <span className="block text-emerald-400 font-bold">{ex.restInterval || '90s'}</span>
                          <span className="text-zinc-500">Rest</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setInspectingExercise(ex)}
                        className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Info className="w-3.5 h-3.5" /> View Form Guide & Safety Cues
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: SELECT WORKOUT PROGRAM SPLIT & CUSTOMIZE EXERCISES ─────────── */}
      {activeTab === 'SELECT_WORKOUT' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">
                  Select Your Workout Program & Customize Exercises
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Select your overall workout program split below (PPL, Upper/Lower, Full Body). Each focus offers 10 exercises — select which ones you want to perform in your routine.
              </p>
            </div>

            {selectedProgramKey && PROGRAM_SPLITS_CONFIG[selectedProgramKey] && (
              <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-lg shadow-emerald-950/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Current Active Program: <strong>{PROGRAM_SPLITS_CONFIG[selectedProgramKey].title}</strong></span>
              </div>
            )}
          </div>

          {/* Program Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.values(PROGRAM_SPLITS_CONFIG).map((prog) => {
              const isSelected = selectedProgramKey === prog.key;
              return (
                <div
                  key={prog.key}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-5 shadow-2xl ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-50 to-white dark:from-cyan-950/40 dark:to-zinc-950 border-cyan-500 text-zinc-900 dark:text-zinc-100 ring-1 ring-cyan-500/40'
                      : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${
                        isSelected ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                      }`}>
                        {prog.badge}
                      </span>
                      {isSelected && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active Program
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">{prog.title}</h3>
                      <p className="text-xs text-cyan-400 font-mono font-semibold mt-0.5">{prog.subtitle}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">{prog.description}</p>
                    </div>

                    {/* Sub-Focuses & 10-Exercise Custom Selection */}
                    <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
                      {prog.focusKeys.map((focusKey) => {
                        const focusCatalog = EXERCISES_CATALOG[focusKey];
                        if (!focusCatalog) return null;
                        const selectedIds = customExerciseSelections[focusKey] || focusCatalog.exercises.map(e => e.id);

                        return (
                          <div key={focusKey} className="space-y-2.5 p-3 rounded-xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                                <Dumbbell className="w-3.5 h-3.5 text-cyan-400" /> {focusCatalog.label}
                              </span>
                              <span className="text-[10px] font-mono text-cyan-400 font-bold">
                                {selectedIds.length} / {focusCatalog.exercises.length} Selected
                              </span>
                            </div>

                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                              {focusCatalog.exercises.map((ex, idx) => {
                                const isChecked = selectedIds.includes(ex.id);
                                return (
                                  <label
                                    key={ex.id}
                                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                                      isChecked
                                        ? 'bg-cyan-950/30 border-cyan-500/40 text-zinc-900 dark:text-zinc-100 font-medium'
                                        : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleExerciseSelection(focusKey, ex.id)}
                                        className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-cyan-500 focus:ring-cyan-500 bg-white dark:bg-zinc-950 cursor-pointer"
                                      />
                                      <span className="truncate text-xs">{idx + 1}. {ex.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                                      <span className="text-zinc-500">{ex.target}</span>
                                      <span className="text-cyan-400 font-bold">{ex.sets}×{ex.reps}</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleActivateProgram(prog.key)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg ${
                      isSelected
                        ? 'bg-emerald-600 text-zinc-900 dark:text-white hover:bg-emerald-500 shadow-emerald-900/30 font-black'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-zinc-900 dark:text-white shadow-blue-900/30 font-extrabold'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Currently Active Program Split
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Activate This Program Split
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: TOP-RATED HYPERTROPHY WORKOUT SPLITS ──────────────────────── */}
      {activeTab === 'PRESET_SPLITS' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">
                  Top-Rated Hypertrophy Workout Splits
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Curated periodized splits for Beginners, Intermediate, & Advanced athletes.
              </p>
            </div>
            <div className="flex gap-2">
              {(['ALL', 'BEGINNER', 'INTERMEDIATE', 'PRO'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedDifficulty(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedDifficulty === lvl
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {presetSplits.map(split => (
              <button
                key={split.id}
                onClick={() => setSelectedSplitId(split.id)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                  selectedSplitId === split.id
                    ? 'bg-amber-500/10 border-amber-500 text-zinc-900 dark:text-zinc-100 shadow-xl shadow-amber-500/10'
                    : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-amber-500/20 text-amber-400">
                      {split.badge || split.category || 'HYPERTROPHY'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold">
                      {split.duration || (split.daysPerWeek ? `${split.daysPerWeek} Days/Wk` : '6 Days/Wk')}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">{split.title || split.name}</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">{split.description}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-bold text-amber-400">
                  <span>View Routine</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>

          {activeSplit && Array.isArray(activeSplit.splitDays) && activeSplit.splitDays.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  {activeSplit.name || activeSplit.title} — Schedule & Muscle Targets
                </h4>
                <span className="text-xs text-amber-400 font-mono font-bold">Level: {activeSplit.level || 'INTERMEDIATE'}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeSplit.splitDays.map((day: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                      <span className="text-amber-400 font-mono font-bold">{day.day || `Day ${idx + 1}`}</span>
                      <span className="text-zinc-700 dark:text-zinc-200">{day.title || day.name}</span>
                    </div>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-snug">{day.muscles || day.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSplit && Array.isArray(activeSplit.exercises) && activeSplit.exercises.length > 0 && (
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-amber-400" />
                  {activeSplit.title || activeSplit.name} — Routine Movements
                </h4>
                <span className="text-xs text-amber-400 font-mono font-bold">{activeSplit.category || 'Hypertrophy'}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {activeSplit.exercises.map((ex: any, idx: number) => {
                  const exName = ex.name || ex.exerciseName || ex.exercise?.name || `Workout Movement ${idx + 1}`;
                  const exDesc = ex.description || ex.exercise?.description || 'Hypertrophy execution with strict tempo control.';
                  const mechanics = ex.mechanics || ex.exercise?.mechanics || 'COMPOUND';
                  const muscle = ex.muscleGroup || ex.exercise?.muscleGroup || 'TARGET';
                  const setsDisplay = ex.sets ? `${ex.sets} sets` : '4 sets';
                  const repsDisplay = ex.reps ? `× ${ex.reps} reps` : '× 8-12 reps';

                  // Try to find the full exercise object for better details in modal, else fallback to workout DTO data
                  const fullExercise = exercises.find(e => e.id === ex.exerciseId) || {
                    id: ex.exerciseId || `temp-${idx}`,
                    name: exName,
                    description: exDesc,
                    muscleGroup: muscle,
                    mechanics: mechanics,
                    equipment: 'Various',
                    recommendedSets: ex.sets,
                    recommendedReps: ex.reps ? String(ex.reps) : undefined,
                    executionSteps: ex.stepOneDescription ? `${ex.stepOneDescription}\n${ex.stepTwoDescription || ''}` : undefined
                  } as Exercise;

                  return (
                    <button 
                      key={idx} 
                      type="button"
                      onClick={() => setInspectingExercise(fullExercise)}
                      className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2.5 flex flex-col justify-between hover:border-cyan-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-left w-full group shadow-sm hover:shadow-cyan-500/10"
                    >
                      <div className="space-y-1.5 w-full">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-amber-400 font-mono group-hover:text-cyan-400 transition-colors">Exercise #{idx + 1}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded tracking-wide transition-colors ${
                            mechanics === 'COMPOUND' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 group-hover:border-cyan-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 group-hover:border-cyan-500/30'
                          }`}>
                            {mechanics}
                          </span>
                        </div>
                        <h5 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                          <span>{exName}</span>
                          <span className="text-[10px] text-zinc-500 font-mono uppercase group-hover:text-cyan-500/70">{muscle}</span>
                        </h5>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">{exDesc}</p>
                      </div>
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between w-full group-hover:border-cyan-500/30 transition-colors">
                        <div className="text-[10px] font-mono font-bold text-amber-400 group-hover:text-cyan-400 transition-colors">
                          <span className="bg-amber-500/10 group-hover:bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 group-hover:border-zinc-200 dark:hover:border-cyan-500/20 transition-colors">
                            {setsDisplay} {repsDisplay}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-zinc-500 group-hover:text-cyan-400 flex items-center gap-1 transition-colors">
                          <Info className="w-3.5 h-3.5" /> View Details
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: CUSTOM HYPERTROPHY SPLIT DRAFT ───────────────────────────── */}
      {activeTab === 'CUSTOM_BUILDER' && (
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Custom Hypertrophy Split Draft</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Routine Name</label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={e => setWorkoutName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 text-xs"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Selected Exercises</span>
                <div className="space-y-2">
                  {workoutExercises.map((we, i) => {
                    const ex = exercises.find(e => e.id === we.exerciseId);
                    return (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs"
                      >
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{ex?.name || 'Exercise'}</h4>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Target: {ex?.muscleGroup || 'CHEST'} | Gear: {ex?.equipment || 'Barbell'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-blue-400">
                            {we.sets} sets x {we.reps} reps
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {canCreate('workout') && (
            <form
              onSubmit={handleAddExercise}
              className="mt-6 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-3 text-xs"
            >
              <h4 className="font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-500" /> Insert Exercise into Routine
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[10px] text-zinc-500 dark:text-zinc-400 mb-1">Sets</label>
                  <input
                    type="number"
                    value={addSets}
                    onChange={e => setAddSets(e.target.value)}
                    className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md text-zinc-900 dark:text-zinc-100 text-center font-mono"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] text-zinc-500 dark:text-zinc-400 mb-1">Reps</label>
                  <input
                    type="text"
                    value={addReps}
                    onChange={e => setAddReps(e.target.value)}
                    className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md text-zinc-900 dark:text-zinc-100 text-center font-mono"
                  />
                </div>
                <div className="col-span-1 flex items-end">
                  <button type="submit" className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-zinc-900 dark:text-white font-bold rounded-md">
                    Add
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 dark:text-zinc-400 mb-1">Select Exercise</label>
                <select
                  value={selectedExToAdd}
                  onChange={e => setSelectedExToAdd(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md text-zinc-900 dark:text-zinc-100 font-bold"
                >
                  {exercises.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.muscleGroup})
                    </option>
                  ))}
                </select>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── TAB 4: DYNAMIC NUTRITION MACRO METER ───────────────────────────── */}
      {activeTab === 'MACRO_METER' && (
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Apple className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Dynamic Nutrition Macro Meter</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Meal Title</label>
                <input
                  type="text"
                  value={dietName}
                  onChange={e => setDietName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 text-xs"
                />
              </div>

              <div className="space-y-2 text-xs">
                <span className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Selected Plate Foods</span>
                <div className="space-y-1.5">
                  {dietFoods.map((df, i) => {
                    const food = foodsList.find(f => f.id === df.foodId);
                    return (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-zinc-200 dark:border-zinc-800">
                        <div>
                          <span className="font-bold text-zinc-700 dark:text-zinc-200">{food?.name}</span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 ml-1">({df.quantityG}g portion)</span>
                        </div>
                        <span className="font-mono text-zinc-500 dark:text-zinc-400">
                          P: {Math.round((food?.protein || 0) * (df.quantityG / 100))}g | C:{' '}
                          {Math.round((food?.carbs || 0) * (df.quantityG / 100))}g
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Calculator className="w-4 h-4" /> Live Macro Calculators
                  </span>
                  <span className="font-mono font-extrabold text-sm text-emerald-400">{macros.calories} kcal</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
                    <span className="block text-emerald-400">{macros.protein}g</span>
                    <span className="text-[9px]">Protein</span>
                  </div>
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
                    <span className="block text-blue-400">{macros.carbs}g</span>
                    <span className="text-[9px]">Carbs</span>
                  </div>
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
                    <span className="block text-amber-400">{macros.fat}g</span>
                    <span className="text-[9px]">Fat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {canCreate('diet') && (
            <form
              onSubmit={handleAddFood}
              className="mt-6 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-3 text-xs"
            >
              <h4 className="font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-500" /> Insert Food Portion
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] text-zinc-500 dark:text-zinc-400 mb-1 font-semibold font-mono">Grams / Weight</label>
                  <input
                    type="number"
                    required
                    value={addGrams}
                    onChange={e => setAddGrams(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
                <div className="col-span-1 flex items-end">
                  <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-900 dark:text-white font-bold rounded-md shadow">
                    Add
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 dark:text-zinc-400 mb-1 font-semibold">Select Food Item</label>
                <select
                  value={selectedFoodToAdd}
                  onChange={e => setSelectedFoodToAdd(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md text-zinc-900 dark:text-zinc-100 font-bold"
                >
                  {foodsList.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── TAB 5: BMI & COMPLETE HEALTH CALCULATOR ──────────────────────────── */}
      {activeTab === 'BMI_CALCULATOR' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
            <Scale className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide">
                BMI & Complete Health Target Calculator
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Calculate Body Mass Index, BMR, Caloric Targets, Daily Fiber (g), and Hydration Water goals.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Input Form */}
            <div className="xl:col-span-5 space-y-4 p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
              <h3 className="font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider mb-2">Personal Parameters</h3>

              <div className="space-y-4">
                {/* Weight Input with KG / LBS toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">Body Weight</label>
                    <div className="flex bg-white dark:bg-zinc-950 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setWeightUnit('KG')}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          weightUnit === 'KG' ? 'bg-cyan-500 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                        }`}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightUnit('LBS')}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          weightUnit === 'LBS' ? 'bg-cyan-500 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                        }`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={weightInput}
                    onChange={e => setWeightInput(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                    placeholder={weightUnit === 'KG' ? 'e.g. 75' : 'e.g. 165'}
                  />
                </div>

                {/* Height Input with CM / M / FT unit toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase">Height Unit</label>
                    <div className="flex bg-white dark:bg-zinc-950 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 gap-0.5">
                      <button
                        type="button"
                        onClick={() => setHeightUnit('CM')}
                        className={`px-2.5 py-0.5 text-[9px] font-bold rounded ${
                          heightUnit === 'CM' ? 'bg-cyan-500 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                        }`}
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeightUnit('FT')}
                        className={`px-2.5 py-0.5 text-[9px] font-bold rounded ${
                          heightUnit === 'FT' ? 'bg-cyan-500 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                        }`}
                      >
                        ft + in
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeightUnit('M')}
                        className={`px-2.5 py-0.5 text-[9px] font-bold rounded ${
                          heightUnit === 'M' ? 'bg-cyan-500 text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                        }`}
                      >
                        m
                      </button>
                    </div>
                  </div>

                  {heightUnit === 'CM' && (
                    <input
                      type="number"
                      value={heightCmInput}
                      onChange={e => setHeightCmInput(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                      placeholder="e.g. 178 cm"
                    />
                  )}

                  {heightUnit === 'M' && (
                    <input
                      type="number"
                      step="0.01"
                      value={heightMInput}
                      onChange={e => setHeightMInput(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                      placeholder="e.g. 1.78 m"
                    />
                  )}

                  {heightUnit === 'FT' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] text-zinc-500 mb-0.5">Feet (ft)</label>
                        <input
                          type="number"
                          value={heightFtInput}
                          onChange={e => setHeightFtInput(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                          placeholder="e.g. 5"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-zinc-500 mb-0.5">Inches (in)</label>
                        <input
                          type="number"
                          value={heightInInput}
                          onChange={e => setHeightInInput(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                          placeholder="e.g. 10"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-zinc-500 dark:text-zinc-400 mb-1 font-semibold">Age (Years)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 dark:text-zinc-400 mb-1 font-semibold">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as 'MALE' | 'FEMALE')}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-500 dark:text-zinc-400 mb-1 font-semibold">Activity Intensity Level</label>
                <select
                  value={activityLevel}
                  onChange={e => setActivityLevel(e.target.value as any)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold"
                >
                  <option value="SEDENTARY">Sedentary (Office Work / Low Movement)</option>
                  <option value="MODERATE">Moderate Exercise (3-4 Days Workout / Week)</option>
                  <option value="ACTIVE">Heavy Active (5-6 Days Intense Lifting)</option>
                  <option value="EXTREME">Extreme Athlete (Double Sessions / Heavy Work)</option>
                </select>
              </div>
            </div>

            {/* Results Grid */}
            <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BMI Card */}
              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" /> Body Mass Index (BMI)
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-zinc-900 dark:text-white font-mono">{healthMetrics ? healthMetrics.bmi : '--'}</span>
                  <span className={`text-xs font-bold ${healthMetrics ? healthMetrics.bmiColor : 'text-zinc-500'}`}>{healthMetrics ? healthMetrics.bmiStatus : 'Calculating...'}</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Ideal healthy adult BMI range is 18.5 – 24.9 kg/m².
                </p>
              </div>

              {/* BMR & Maintenance */}
              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Basal Metabolic Rate (BMR)
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-amber-400 font-mono">{healthMetrics ? healthMetrics.bmr : '--'}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">kcal/day at rest</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Maintenance TDEE: <span className="text-zinc-700 dark:text-zinc-200 font-bold">{healthMetrics ? healthMetrics.tdee : '--'} kcal</span>
                </p>
              </div>

              {/* Goal Targets (Bulk / Cut) */}
              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-blue-400" /> Caloric Goal Targets
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Hypertrophy Bulk (+350):</span>
                    <span className="font-mono font-bold text-emerald-400">{healthMetrics ? healthMetrics.bulkCals : '--'} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Fat Loss Cut (-450):</span>
                    <span className="font-mono font-bold text-amber-400">{healthMetrics ? healthMetrics.cutCals : '--'} kcal</span>
                  </div>
                </div>
              </div>

              {/* Fiber & Water Hydration */}
              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-emerald-400" /> Daily Fiber & Hydration
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Dietary Fiber Target:</span>
                    <span className="font-mono font-bold text-emerald-400">{healthMetrics ? healthMetrics.fiberGrams : '--'}g / day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">Hydration Water Target:</span>
                    <span className="font-mono font-bold text-blue-400">{healthMetrics ? healthMetrics.waterLiters : '--'} Liters</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Unit Conversion Telemetry */}
              <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2 sm:col-span-2">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" /> Real-time Unit Conversions
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-center font-mono text-xs">
                  <div className="p-2 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-cyan-400 font-bold block">{healthMetrics ? healthMetrics.normalizedHeightCm : '--'} cm</span>
                    <span className="text-[9px] text-zinc-500 font-sans">Centimeters</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-cyan-400 font-bold block">{healthMetrics ? healthMetrics.normalizedHeightM : '--'} m</span>
                    <span className="text-[9px] text-zinc-500 font-sans">Meters</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-cyan-400 font-bold block">{healthMetrics ? healthMetrics.heightFtInDisplay : '--'}</span>
                    <span className="text-[9px] text-zinc-500 font-sans font-medium">Feet & Inches</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-amber-400 font-bold block">{healthMetrics ? `${healthMetrics.normalizedWeightKg} kg / ${healthMetrics.normalizedWeightLbs} lbs` : '-- kg / -- lbs'}</span>
                    <span className="text-[9px] text-zinc-500 font-sans">Weight Equivalent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal exercise={inspectingExercise} onClose={() => setInspectingExercise(null)} />
    </div>
  );
};
