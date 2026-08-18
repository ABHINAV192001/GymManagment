import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Dumbbell,
  Apple,
  Plus,
  Trash,
  Check,
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
  Play,
  Edit2,
  Save,
  RotateCcw,
  Calendar,
  Clock,
  Trash2,
  Loader2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Exercise, FoodItem, WorkoutPlan } from '../../types';
import { usePermissions } from '../../lib/usePermissions';
import { HumanBodyMap, MuscleGroupKey } from '../../components/workouts/HumanBodyMap';
import { ExerciseDetailModal } from '../../components/workouts/ExerciseDetailModal';
import { WorkoutTimerModal } from '../../components/workouts/WorkoutTimerModal';
import QrScannerTab from '../../components/workouts/QrScannerTab';
import { getExercises, getWorkouts, getMySplits, createWorkout, updateWorkout, deleteWorkout } from '../../lib/api/workouts';
import { getFoods } from '../../lib/api/food';
import { calculateHealthMetrics, HealthResponse } from '../../lib/api/health';
import { PROGRAM_SPLITS_CONFIG, EXERCISES_CATALOG, getTodayWorkoutFocus } from '../member-portal/MemberDashboard';
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_MACRO_FOODS: FoodItem[] = [
  { id: 'f1', name: 'Raw Eggs (Whole)', category: 'Dairy & Eggs', caloriesPer100g: 143, proteinPer100g: 13, carbsPer100g: 1, fatPer100g: 10 },
  { id: 'f2', name: 'Chicken Breast (Boneless, Skinless)', category: 'Poultry', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
  { id: 'f3', name: 'Lean Ground Beef (93/7)', category: 'Meat', caloriesPer100g: 172, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 8 },
  { id: 'f4', name: 'White Basmati Rice (Cooked)', category: 'Grains', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3 },
  { id: 'f5', name: 'Rolled Oats (Dry)', category: 'Grains', caloriesPer100g: 389, proteinPer100g: 16.9, carbsPer100g: 66, fatPer100g: 6.9 },
  { id: 'f6', name: 'Whey Protein Isolate (Standard)', category: 'Supplements', caloriesPer100g: 370, proteinPer100g: 85, carbsPer100g: 3, fatPer100g: 1.5 },
  { id: 'f7', name: 'Peanut Butter (Natural)', category: 'Nuts & Seeds', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50 },
  { id: 'f8', name: 'Greek Yogurt (Plain Nonfat)', category: 'Dairy', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4 },
];

const DEFAULT_PRESET_SPLITS = [
  {
    id: 'b1111111-0000-0000-0000-000000000001',
    title: 'Push / Pull / Legs (PPL) Hypertrophy Split',
    description: 'Gold-standard 6-day split isolating pushing muscles (Chest/Shoulders/Triceps), pulling muscles (Back/Biceps), and lower body.',
    category: 'PPL',
    difficulty: 'INTERMEDIATE',
    duration: '6 Days/Wk',
    calories: 450,
    mandatoryExercises: 6,
    exercises: [
      { id: 'ex1', name: 'Barbell Flat Bench Press', sets: 4, reps: '8-10', target: 'Chest' },
      { id: 'ex2', name: 'Incline Dumbbell Press', sets: 4, reps: '10-12', target: 'Upper Chest' },
      { id: 'ex3', name: 'Barbell Conventional Deadlift', sets: 4, reps: '6-8', target: 'Back' },
      { id: 'ex4', name: 'Barbell Overhead Press', sets: 4, reps: '8-10', target: 'Shoulders' },
      { id: 'ex5', name: 'Barbell Back Squat', sets: 4, reps: '8-10', target: 'Quads' },
      { id: 'ex6', name: 'EZ-Bar Bicep Curls', sets: 4, reps: '10-12', target: 'Biceps' }
    ]
  },
  {
    id: 'b1111111-0000-0000-0000-000000000002',
    title: 'The Arnold Schwarzenegger Golden Era Split',
    description: 'High volume chest/back super-sets paired with shoulders and arms for maximum upper body expansion.',
    category: 'CLASSIC PRO',
    difficulty: 'PRO',
    duration: '6 Days/Wk',
    calories: 550,
    mandatoryExercises: 5,
    exercises: [
      { id: 'ex1', name: 'Barbell Flat Bench Press', sets: 5, reps: '10', target: 'Chest' },
      { id: 'ex2', name: 'Wide Grip Pull-Ups', sets: 5, reps: '12', target: 'Lats' },
      { id: 'ex3', name: 'Incline Barbell Bench Press', sets: 5, reps: '10', target: 'Upper Chest' },
      { id: 'ex4', name: 'Bent-Over Barbell Row', sets: 5, reps: '10', target: 'Mid-Back' },
      { id: 'ex5', name: 'Dumbbell Arnold Press', sets: 5, reps: '10', target: 'Shoulders' }
    ]
  },
  {
    id: 'b1111111-0000-0000-0000-000000000003',
    title: '4-Day Upper / Lower Strength & Volume Split',
    description: 'Optimal recovery split training upper body and lower body twice per week with heavy compound progression.',
    category: 'STRENGTH & HYPERTROPHY',
    difficulty: 'BEGINNER',
    duration: '4 Days/Wk',
    calories: 400,
    mandatoryExercises: 4,
    exercises: [
      { id: 'ex1', name: 'Barbell Flat Bench Press', sets: 4, reps: '6-8', target: 'Chest' },
      { id: 'ex2', name: 'Lat Pulldown (Wide Grip)', sets: 4, reps: '8-10', target: 'Back' },
      { id: 'ex3', name: 'Barbell Back Squat', sets: 4, reps: '6-8', target: 'Quads' },
      { id: 'ex4', name: 'Romanian Deadlift (RDL)', sets: 4, reps: '8-10', target: 'Hamstrings' }
    ]
  },
  {
    id: 'b1111111-0000-0000-0000-000000000004',
    title: '5-Day Classic Bodypart Bro Split',
    description: 'Bodybuilding split hitting one major muscle group per day with maximum single-session volume.',
    category: 'BODYBUILDING',
    difficulty: 'INTERMEDIATE',
    duration: '5 Days/Wk',
    calories: 420,
    mandatoryExercises: 5,
    exercises: [
      { id: 'ex1', name: 'Incline Dumbbell Press', sets: 4, reps: '10-12', target: 'Chest' },
      { id: 'ex2', name: 'Seated Cable Rows', sets: 4, reps: '10-12', target: 'Back' },
      { id: 'ex3', name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', target: 'Shoulders' },
      { id: 'ex4', name: 'EZ-Bar Bicep Curls', sets: 4, reps: '10-12', target: 'Biceps' },
      { id: 'ex5', name: 'Leg Press Machine', sets: 4, reps: '12-15', target: 'Quads' }
    ]
  },
  {
    id: 'b1111111-0000-0000-0000-000000000005',
    title: 'Fat Loss Shred & High-Calorie Burn Split',
    description: 'High-tempo circuit and metabolic resistance split designed to maximize caloric expenditure and strip body fat while preserving muscle.',
    category: 'FAT LOSS / SHRED',
    difficulty: 'BEGINNER',
    duration: '5 Days/Wk',
    calories: 600,
    mandatoryExercises: 6,
    exercises: [
      { id: 'ex1', name: 'Kettlebell Swings', sets: 4, reps: '20', target: 'Full Body' },
      { id: 'ex2', name: 'Dumbbell Goblet Squats', sets: 4, reps: '15', target: 'Quads' },
      { id: 'ex3', name: 'Push-Ups (Standard)', sets: 4, reps: '20', target: 'Chest' },
      { id: 'ex4', name: 'Jump Rope Conditioning', sets: 4, reps: '60s', target: 'Cardio' }
    ]
  },
  {
    id: 'b1111111-0000-0000-0000-000000000006',
    title: '5x5 Heavy Powerlifting Peak Strength Split',
    description: 'Low-rep, high-intensity compound power split focused on heavy deadlifts, squats, and bench press for raw maximum strength.',
    category: 'POWERLIFTING',
    difficulty: 'PRO',
    duration: '4 Days/Wk',
    calories: 480,
    mandatoryExercises: 5,
    exercises: [
      { id: 'ex1', name: 'Barbell Back Squat', sets: 5, reps: '5', target: 'Quads/Glutes' },
      { id: 'ex2', name: 'Barbell Flat Bench Press', sets: 5, reps: '5', target: 'Chest' },
      { id: 'ex3', name: 'Barbell Conventional Deadlift', sets: 5, reps: '5', target: 'Back' }
    ]
  },
  {
    id: 'b1111111-0000-0000-0000-000000000007',
    title: 'German Volume Training (GVT 10x10) Mass Split',
    description: 'Brutal 10 sets of 10 reps protocol targeting maximum sarcoplasmic hypertrophy and muscle cell swelling.',
    category: 'MASS BUILDING',
    difficulty: 'PRO',
    duration: '5 Days/Wk',
    calories: 520,
    mandatoryExercises: 4,
    exercises: [
      { id: 'ex1', name: 'Barbell Flat Bench Press', sets: 10, reps: '10', target: 'Chest' },
      { id: 'ex2', name: 'Bent-Over Barbell Row', sets: 10, reps: '10', target: 'Back' }
    ]
  },
  {
    id: 'b1111111-0000-0000-0000-000000000008',
    title: '3-Day Full Body Frequency Hypertrophy Split',
    description: 'High-frequency 3-day full body routine hitting every major muscle group 3x per week for busy schedules.',
    category: 'FULL BODY',
    difficulty: 'BEGINNER',
    duration: '3 Days/Wk',
    calories: 380,
    mandatoryExercises: 6,
    exercises: [
      { id: 'ex1', name: 'Barbell Back Squat', sets: 3, reps: '10', target: 'Quads' },
      { id: 'ex2', name: 'Barbell Flat Bench Press', sets: 3, reps: '10', target: 'Chest' },
      { id: 'ex3', name: 'Lat Pulldown (Wide Grip)', sets: 3, reps: '10', target: 'Back' }
    ]
  },
  {
    id: 'b1111111-0000-0000-0000-000000000009',
    title: 'Mike Mentzer Heavy Duty High Intensity (HIT) Split',
    description: 'Ultra-low volume, single all-out failure set strategy to force rapid muscle adaptions and maximum growth.',
    category: 'HIT / HIGH INTENSITY',
    difficulty: 'PRO',
    duration: '3 Days/Wk',
    calories: 350,
    mandatoryExercises: 4,
    exercises: [
      { id: 'ex1', name: 'Incline Dumbbell Press', sets: 1, reps: '8 to Failure', target: 'Upper Chest' },
      { id: 'ex2', name: 'Seated Cable Rows', sets: 1, reps: '8 to Failure', target: 'Back' }
    ]
  },
  {
    id: 'b1111111-0000-0000-0000-000000000010',
    title: '5-Day Upper / Lower / Arms Specialization Split',
    description: 'Hypertrophy split with dedicated arm and shoulder specialization days for maximum arm expansion.',
    category: 'ARMS & UPPER',
    difficulty: 'INTERMEDIATE',
    duration: '5 Days/Wk',
    calories: 460,
    mandatoryExercises: 6,
    exercises: [
      { id: 'ex1', name: 'EZ-Bar Bicep Curls', sets: 4, reps: '12', target: 'Biceps' },
      { id: 'ex2', name: 'Tricep Rope Pushdown', sets: 4, reps: '12', target: 'Triceps' },
      { id: 'ex3', name: 'Dumbbell Hammer Curls', sets: 4, reps: '12', target: 'Brachialis' }
    ]
  },
  {
    id: 'b1111111-0000-0000-0000-000000000011',
    title: 'Functional Athletic Performance & Agility Hybrid Split',
    description: 'Explosive plyometrics, rotational core, sprint work, and athletic compound lifting for hybrid conditioning.',
    category: 'ATHLETIC / HYBRID',
    difficulty: 'INTERMEDIATE',
    duration: '4 Days/Wk',
    calories: 500,
    mandatoryExercises: 5,
    exercises: [
      { id: 'ex1', name: 'Box Jump Calf Explosions', sets: 4, reps: '10', target: 'Plyometrics' },
      { id: 'ex2', name: 'Barbell Overhead Press', sets: 4, reps: '8', target: 'Shoulders' }
    ]
  },
  {
    id: 'b1111111-0000-0000-0000-000000000012',
    title: 'Posterior Chain & Glute Sculpting Split',
    description: 'Targeted posterior chain split emphasizing gluteal hypertrophy, hamstrings, and spinal erector strength.',
    category: 'GLUTE & POSTERIOR',
    difficulty: 'BEGINNER',
    duration: '4 Days/Wk',
    calories: 410,
    mandatoryExercises: 5,
    exercises: [
      { id: 'ex1', name: 'Barbell Hip Thrusts', sets: 4, reps: '12', target: 'Glutes' },
      { id: 'ex2', name: 'Romanian Deadlift (RDL)', sets: 4, reps: '10', target: 'Hamstrings' }
    ]
  }
];

const ALL_CATALOG_EXERCISES: Exercise[] = [
  // CHEST EXERCISES
  { id: 'c1000000-0000-4000-8000-000000000101', name: 'Barbell Flat Bench Press', muscleGroup: 'CHEST', equipment: 'Barbell', description: 'Flat bench press targeting overall chest development.' },
  { id: 'c1000000-0000-4000-8000-000000000102', name: 'Incline Dumbbell Press (Upper Chest)', muscleGroup: 'CHEST', equipment: 'Dumbbell', description: 'Incline dumbbell press isolating upper chest (clavicular head).' },
  { id: 'c1000000-0000-4000-8000-000000000103', name: 'Incline Barbell Bench Press (Upper Chest)', muscleGroup: 'CHEST', equipment: 'Barbell', description: 'Incline barbell bench press targeting upper chest thickness.' },
  { id: 'c1000000-0000-4000-8000-000000000104', name: 'Decline Barbell Bench Press (Lower Chest)', muscleGroup: 'CHEST', equipment: 'Barbell', description: 'Decline bench press isolating lower chest (sternal head).' },
  { id: 'c1000000-0000-4000-8000-000000000105', name: 'Decline Dumbbell Bench Press (Lower Chest)', muscleGroup: 'CHEST', equipment: 'Dumbbell', description: 'Decline dumbbell press for lower chest stretch.' },
  { id: 'c1000000-0000-4000-8000-000000000106', name: 'Flat Dumbbell Press', muscleGroup: 'CHEST', equipment: 'Dumbbell', description: 'Flat dumbbell press for chest hypertrophy and full motion.' },
  { id: 'c1000000-0000-4000-8000-000000000107', name: 'Pec Deck Machine Fly', muscleGroup: 'CHEST', equipment: 'Machine', description: 'Machine chest flyes for peak contraction and isolation.' },
  { id: 'c1000000-0000-4000-8000-000000000108', name: 'Cable Chest Flyes (Low-to-High Upper Chest)', muscleGroup: 'CHEST', equipment: 'Cable', description: 'Low-to-high cable flyes targeting upper inner chest.' },
  { id: 'c1000000-0000-4000-8000-000000000109', name: 'Cable Chest Flyes (High-to-Low Lower Chest)', muscleGroup: 'CHEST', equipment: 'Cable', description: 'High-to-low cable crossover for lower chest definition.' },
  { id: 'c1000000-0000-4000-8000-000000000110', name: 'Parallel Bar Chest Dips (Lower Chest)', muscleGroup: 'CHEST', equipment: 'Bodyweight', description: 'Forward-leaning dips isolating lower chest.' },
  { id: 'c1000000-0000-4000-8000-000000000111', name: 'Dumbbell Chest Flyes', muscleGroup: 'CHEST', equipment: 'Dumbbell', description: 'Flat or incline dumbbell flyes for chest stretch.' },
  { id: 'c1000000-0000-4000-8000-000000000112', name: 'Push-Ups (Decline / Incline / Standard)', muscleGroup: 'CHEST', equipment: 'Bodyweight', description: 'Classic chest bodyweight movement.' },

  // BACK EXERCISES
  { id: 'c1000000-0000-4000-8000-000000000201', name: 'Conventional Barbell Deadlift', muscleGroup: 'BACK', equipment: 'Barbell', description: 'Full posterior chain compound lift.' },
  { id: 'c1000000-0000-4000-8000-000000000202', name: 'Lat Pulldown (Wide Grip)', muscleGroup: 'BACK', equipment: 'Cable', description: 'Wide grip pulldowns for lat width.' },
  { id: 'c1000000-0000-4000-8000-000000000203', name: 'Bent-Over Barbell Row', muscleGroup: 'BACK', equipment: 'Barbell', description: 'Heavy row targeting mid-back thickness.' },
  { id: 'c1000000-0000-4000-8000-000000000204', name: 'Seated Cable Rows', muscleGroup: 'BACK', equipment: 'Cable', description: 'Seated cable row for lat and rhomboid thickness.' },
  { id: 'c1000000-0000-4000-8000-000000000205', name: 'Single-Arm Dumbbell Row', muscleGroup: 'BACK', equipment: 'Dumbbell', description: 'Unilateral row for lat symmetry.' },
  { id: 'c1000000-0000-4000-8000-000000000206', name: 'Wide Grip Pull-Ups', muscleGroup: 'BACK', equipment: 'Bodyweight', description: 'Bodyweight pull-ups for lat width.' },
  { id: 'c1000000-0000-4000-8000-000000000207', name: 'T-Bar Row', muscleGroup: 'BACK', equipment: 'Barbell', description: 'Heavy T-bar row for back thickness.' },
  { id: 'c1000000-0000-4000-8000-000000000208', name: 'Chin-Ups (Underhand Grip)', muscleGroup: 'BACK', equipment: 'Bodyweight', description: 'Underhand grip chin-ups for lats and lower traps.' },
  { id: 'c1000000-0000-4000-8000-000000000209', name: 'Hyperextensions (Lower Back)', muscleGroup: 'BACK', equipment: 'Bodyweight', description: 'Erector spinae lower back extension.' },
  { id: 'c1000000-0000-4000-8000-000000000210', name: 'Lat Pulldown (Close-Grip V-Bar)', muscleGroup: 'BACK', equipment: 'Cable', description: 'Close-grip V-bar pulldown for lower lats.' },

  // SHOULDERS EXERCISES
  { id: 'c1000000-0000-4000-8000-000000000301', name: 'Standing Military Press (Overhead)', muscleGroup: 'SHOULDERS', equipment: 'Barbell', description: 'Strict overhead press for front and side delts.' },
  { id: 'c1000000-0000-4000-8000-000000000302', name: 'Dumbbell Lateral Raises (Side Delts)', muscleGroup: 'SHOULDERS', equipment: 'Dumbbell', description: 'Lateral raises for shoulder width and side delts.' },
  { id: 'c1000000-0000-4000-8000-000000000303', name: 'Seated Dumbbell Arnold Press', muscleGroup: 'SHOULDERS', equipment: 'Dumbbell', description: 'Rotational shoulder press targeting all 3 delt heads.' },
  { id: 'c1000000-0000-4000-8000-000000000304', name: 'Face Pulls (Rear Delts & Traps)', muscleGroup: 'SHOULDERS', equipment: 'Cable', description: 'High cable face pulls for rear delts.' },
  { id: 'c1000000-0000-4000-8000-000000000305', name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'Dumbbell', description: 'Seated shoulder press for front delts.' },
  { id: 'c1000000-0000-4000-8000-000000000306', name: 'Barbell Shrugs (Traps)', muscleGroup: 'SHOULDERS', equipment: 'Barbell', description: 'Trap isolation exercise.' },
  { id: 'c1000000-0000-4000-8000-000000000307', name: 'Front Dumbbell Raises (Front Delts)', muscleGroup: 'SHOULDERS', equipment: 'Dumbbell', description: 'Front raise targeting anterior deltoids.' },
  { id: 'c1000000-0000-4000-8000-000000000308', name: 'Cable Lateral Raises', muscleGroup: 'SHOULDERS', equipment: 'Cable', description: 'Constant-tension cable raises for side delts.' },
  { id: 'c1000000-0000-4000-8000-000000000309', name: 'Reverse Pec Deck Fly (Rear Delts)', muscleGroup: 'SHOULDERS', equipment: 'Machine', description: 'Machine flyes targeting posterior deltoids.' },
  { id: 'c1000000-0000-4000-8000-000000000310', name: 'Upright Barbell Rows', muscleGroup: 'SHOULDERS', equipment: 'Barbell', description: 'Upright row for side delts and upper traps.' },

  // BICEPS EXERCISES
  { id: 'c1000000-0000-4000-8000-000000000401', name: 'EZ-Bar Bicep Curls', muscleGroup: 'BICEPS', equipment: 'Barbell', description: 'Classic EZ-bar curls for bicep mass.' },
  { id: 'c1000000-0000-4000-8000-000000000402', name: 'Dumbbell Hammer Curls', muscleGroup: 'BICEPS', equipment: 'Dumbbell', description: 'Neutral grip curls for brachialis and forearm strength.' },
  { id: 'c1000000-0000-4000-8000-000000000403', name: 'Incline Dumbbell Bicep Curls', muscleGroup: 'BICEPS', equipment: 'Dumbbell', description: 'Seated incline curls for bicep long head stretch.' },
  { id: 'c1000000-0000-4000-8000-000000000404', name: 'Preacher Bicep Curls', muscleGroup: 'BICEPS', equipment: 'EZ-Bar', description: 'Strict bicep isolation curls on preacher bench.' },
  { id: 'c1000000-0000-4000-8000-000000000405', name: 'Concentration Curls', muscleGroup: 'BICEPS', equipment: 'Dumbbell', description: 'Isolated bicep peak contraction.' },
  { id: 'c1000000-0000-4000-8000-000000000406', name: 'Standing Cable Bicep Curls', muscleGroup: 'BICEPS', equipment: 'Cable', description: 'Cable bicep curls with constant tension.' },

  // TRICEPS EXERCISES
  { id: 'c1000000-0000-4000-8000-000000000501', name: 'Tricep Rope Pushdowns', muscleGroup: 'TRICEPS', equipment: 'Cable', description: 'Cable pushdowns targeting lateral and medial heads.' },
  { id: 'c1000000-0000-4000-8000-000000000502', name: 'Overhead Dumbbell Extension', muscleGroup: 'TRICEPS', equipment: 'Dumbbell', description: 'Overhead extension targeting long head of triceps.' },
  { id: 'c1000000-0000-4000-8000-000000000503', name: 'Skullcrushers (Lying Tricep Ext)', muscleGroup: 'TRICEPS', equipment: 'EZ-Bar', description: 'Lying tricep extension for long and lateral heads.' },
  { id: 'c1000000-0000-4000-8000-000000000504', name: 'Close-Grip Barbell Bench Press', muscleGroup: 'TRICEPS', equipment: 'Barbell', description: 'Compound tricep press.' },
  { id: 'c1000000-0000-4000-8000-000000000505', name: 'Tricep Bench Dips', muscleGroup: 'TRICEPS', equipment: 'Bodyweight', description: 'Bodyweight tricep dips.' },
  { id: 'c1000000-0000-4000-8000-000000000506', name: 'Single-Arm Cable Tricep Kickbacks', muscleGroup: 'TRICEPS', equipment: 'Cable', description: 'Isolated tricep extension kickbacks.' },

  // LEGS EXERCISES
  { id: 'c1000000-0000-4000-8000-000000000601', name: 'Barbell Back Squat', muscleGroup: 'LEGS', equipment: 'Barbell', description: 'Quad and glute compound movement.' },
  { id: 'c1000000-0000-4000-8000-000000000602', name: 'Romanian Deadlift (RDL)', muscleGroup: 'LEGS', equipment: 'Barbell', description: 'Hip hinge targeting hamstrings and glutes.' },
  { id: 'c1000000-0000-4000-8000-000000000603', name: '45-Degree Leg Press', muscleGroup: 'LEGS', equipment: 'Machine', description: 'Heavy leg press for quads and glutes.' },
  { id: 'c1000000-0000-4000-8000-000000000604', name: 'Lying Hamstring Leg Curls', muscleGroup: 'LEGS', equipment: 'Machine', description: 'Machine leg curls for hamstring isolation.' },
  { id: 'c1000000-0000-4000-8000-000000000605', name: 'Seated Leg Extensions', muscleGroup: 'LEGS', equipment: 'Machine', description: 'Quad isolation extensions.' },
  { id: 'c1000000-0000-4000-8000-000000000606', name: 'Dumbbell Bulgarian Split Squats', muscleGroup: 'LEGS', equipment: 'Dumbbell', description: 'Unilateral leg squat for quads and glutes.' },
  { id: 'c1000000-0000-4000-8000-000000000607', name: 'Standing Calf Raises', muscleGroup: 'LEGS', equipment: 'Machine', description: 'Calf raises for gastrocnemius.' },
  { id: 'c1000000-0000-4000-8000-000000000608', name: 'Barbell Hip Thrusts', muscleGroup: 'LEGS', equipment: 'Barbell', description: 'Glute isolation thrusts.' },
  { id: 'c1000000-0000-4000-8000-000000000609', name: 'Dumbbell Walking Lunges', muscleGroup: 'LEGS', equipment: 'Dumbbell', description: 'Walking lunges for quads and hamstrings.' },

  // ABS EXERCISES
  { id: 'c1000000-0000-4000-8000-000000000701', name: 'Hanging Leg Raises', muscleGroup: 'ABS', equipment: 'Bodyweight', description: 'Hanging raises targeting lower abs and core.' },
  { id: 'c1000000-0000-4000-8000-000000000702', name: 'Ab Roller Wheel Rollouts', muscleGroup: 'ABS', equipment: 'Other', description: 'Core rollout for deep ab engagement.' },
  { id: 'c1000000-0000-4000-8000-000000000703', name: 'Weighted Declined Ab Crunches', muscleGroup: 'ABS', equipment: 'Dumbbell', description: 'Declined crunch with added weight.' },
  { id: 'c1000000-0000-4000-8000-000000000704', name: 'Planks & Cable Woodchoppers', muscleGroup: 'ABS', equipment: 'Cable', description: 'Core stability and oblique rotations.' },
  { id: 'c1000000-0000-4000-8000-000000000705', name: 'Decline Bench Sit-Ups', muscleGroup: 'ABS', equipment: 'Bodyweight', description: 'Full range ab sit-ups on decline bench.' }
];

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
      const mainContainer = document.querySelector('main');
      if (mainContainer) {
        mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
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

  const exercisesSectionRef = useRef<HTMLDivElement>(null);
  const activeSplitSectionRef = useRef<HTMLDivElement>(null);
  const isFirstMuscleMount = useRef(true);

  const handleSelectMuscle = (muscle: MuscleGroupKey | null) => {
    setSelectedMuscle(muscle);
  };

  const handleSelectSplit = (splitId: string) => {
    setSelectedSplitId(splitId);
    setTimeout(() => {
      if (activeSplitSectionRef.current) {
        const el = activeSplitSectionRef.current;
        const mainContainer = el.closest('main') || document.querySelector('main');
        if (mainContainer) {
          const mainTop = mainContainer.getBoundingClientRect().top;
          const elTop = el.getBoundingClientRect().top;
          const targetScrollTop = mainContainer.scrollTop + (elTop - mainTop) - 24;
          mainContainer.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  };

  useEffect(() => {
    if (isFirstMuscleMount.current) {
      isFirstMuscleMount.current = false;
      return;
    }
    if (selectedMuscle && exercisesSectionRef.current) {
      const timer = setTimeout(() => {
        const el = exercisesSectionRef.current;
        if (!el) return;
        const mainContainer = el.closest('main') || document.querySelector('main');
        if (mainContainer) {
          const mainTop = mainContainer.getBoundingClientRect().top;
          const elTop = el.getBoundingClientRect().top;
          const targetScrollTop = mainContainer.scrollTop + (elTop - mainTop) - 16;
          mainContainer.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedMuscle]);

  // Selected Split Routine
  const [selectedSplitId, setSelectedSplitId] = useState<string>('ppl');
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  // Workout Builder state
  const [mySplits, setMySplits] = useState<WorkoutPlan[]>([]);
  const [editingSplitId, setEditingSplitId] = useState<string | null>(null);
  const [isSavingSplit, setIsSavingSplit] = useState(false);
  const [isDeletingSplit, setIsDeletingSplit] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const [workoutName, setWorkoutName] = useState('My Custom Hypertrophy Routine');
  const [workoutCategory, setWorkoutCategory] = useState('CUSTOM_SPLIT');
  const [selectedDays, setSelectedDays] = useState<string[]>(DAYS_OF_WEEK);

  const [selectedInserterMuscle, setSelectedInserterMuscle] = useState<string>('CHEST');
  const [workoutExercises, setWorkoutExercises] = useState<{ exerciseId: string; sets: number; reps: string; targetDays: string[] }[]>([
    { exerciseId: 'c1000000-0000-4000-8000-000000000101', sets: 4, reps: '8-10', targetDays: ['Monday', 'Wednesday', 'Friday'] },
    { exerciseId: 'c1000000-0000-4000-8000-000000000102', sets: 4, reps: '10-12', targetDays: ['Monday', 'Thursday'] },
  ]);

  const [selectedExToAdd, setSelectedExToAdd] = useState('');
  const [addSets, setAddSets] = useState('4');
  const [addReps, setAddReps] = useState('8-12');
  const [addExDays, setAddExDays] = useState<string[]>(DAYS_OF_WEEK);

  // Exercise inline edit state
  const [editingExIndex, setEditingExIndex] = useState<number | null>(null);
  const [editExSets, setEditExSets] = useState('4');
  const [editExReps, setEditExReps] = useState('8-12');
  const [editExDays, setEditExDays] = useState<string[]>([]);

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

  // Fetch Foods & Preset Workout Splits from Backend Database
  const [foodsList, setFoodsList] = useState<FoodItem[]>(DEFAULT_MACRO_FOODS);
  const [presetSplits, setPresetSplits] = useState<any[]>([]);

  useEffect(() => {
    async function loadBackendData() {
      try {
        const [foodsData, splitsData, userSplits] = await Promise.all([
          getFoods(0, 100).catch(() => ({ items: [] })),
          getWorkouts().catch(() => []),
          getMySplits().catch(() => []),
        ]);
        const items = Array.isArray(foodsData) ? foodsData : (foodsData?.items || []);
        setFoodsList(items.length > 0 ? items : DEFAULT_MACRO_FOODS);
        const validSplits = Array.isArray(splitsData) && splitsData.length > 0 ? splitsData : DEFAULT_PRESET_SPLITS;
        setPresetSplits(validSplits);
        setMySplits(Array.isArray(userSplits) ? userSplits : []);
      } catch (err) {
        console.error('Error fetching backend foods or splits from DB', err);
        setFoodsList(DEFAULT_MACRO_FOODS);
        setPresetSplits(DEFAULT_PRESET_SPLITS);
      }
    }
    loadBackendData();
  }, []);

  const inserterExercises = useMemo(() => {
    const combinedMap = new Map<string, Exercise>();
    
    // 1. Catalog exercises
    ALL_CATALOG_EXERCISES.forEach(e => combinedMap.set(e.id, e));
    
    // 2. Loaded backend exercises
    exercises.forEach(e => combinedMap.set(e.id, e));
    
    const allList = Array.from(combinedMap.values());
    
    if (!selectedInserterMuscle || selectedInserterMuscle === 'ALL') {
      return allList;
    }

    const filterKey = selectedInserterMuscle.toUpperCase();
    return allList.filter(e => {
      const name = (e.name || '').toUpperCase();
      const mg = (e.muscleGroup || '').toUpperCase();

      // STRICT EXCLUSION: If user selected non-chest, exclude explicit chest/bench press exercises
      if (filterKey !== 'CHEST') {
        if (mg.includes('CHEST') || name.includes('BENCH PRESS') || name.includes('PEC DECK') || name.includes('CHEST FLY') || name.includes('CHEST DIPS')) {
          return false;
        }
      }

      if (filterKey === 'CHEST') {
        return (
          mg.includes('CHEST') ||
          mg.includes('PEC') ||
          name.includes('BENCH PRESS') ||
          name.includes('CHEST') ||
          name.includes('PEC DECK') ||
          name.includes('PUSH-UP') ||
          name.includes('PUSHUP')
        );
      }

      if (filterKey === 'BACK') {
        return (
          mg.includes('BACK') ||
          mg.includes('LAT') ||
          mg.includes('RHOMBOID') ||
          name.includes('DEADLIFT') ||
          name.includes('PULLDOWN') ||
          name.includes('PULL-UP') ||
          name.includes('CHIN-UP') ||
          name.includes('ROW') ||
          name.includes('HYPEREXTENSION')
        );
      }

      if (filterKey === 'SHOULDERS') {
        return (
          mg.includes('SHOULDER') ||
          mg.includes('DELT') ||
          mg.includes('TRAP') ||
          name.includes('MILITARY PRESS') ||
          name.includes('SHOULDER PRESS') ||
          name.includes('ARNOLD PRESS') ||
          name.includes('LATERAL RAISE') ||
          name.includes('FACE PULL') ||
          name.includes('FRONT RAISE') ||
          name.includes('REAR DELT') ||
          name.includes('SHRUG') ||
          name.includes('UPRIGHT ROW')
        );
      }

      if (filterKey === 'BICEPS') {
        return (
          mg.includes('BICEP') ||
          name.includes('BICEP') ||
          name.includes('HAMMER CURL') ||
          name.includes('PREACHER') ||
          name.includes('CONCENTRATION CURL') ||
          (name.includes('CURL') && !name.includes('LEG CURL'))
        );
      }

      if (filterKey === 'TRICEPS') {
        return (
          mg.includes('TRICEP') ||
          name.includes('TRICEP') ||
          name.includes('SKULLCRUSHER') ||
          name.includes('PUSHDOWN') ||
          name.includes('CLOSE-GRIP')
        );
      }

      if (filterKey === 'LEGS') {
        return (
          mg.includes('LEG') ||
          mg.includes('QUAD') ||
          mg.includes('HAMSTRING') ||
          mg.includes('CALF') ||
          mg.includes('GLUTE') ||
          name.includes('SQUAT') ||
          name.includes('LEG PRESS') ||
          name.includes('LEG CURL') ||
          name.includes('LEG EXTENSION') ||
          name.includes('CALF') ||
          name.includes('LUNGE') ||
          name.includes('HIP THRUST') ||
          name.includes('RDL')
        );
      }

      if (filterKey === 'ABS') {
        return (
          mg.includes('AB') ||
          mg.includes('CORE') ||
          mg.includes('OBLIQUE') ||
          name.includes('CRUNCH') ||
          name.includes('PLANK') ||
          name.includes('LEG RAISE') ||
          name.includes('KNEE RAISE') ||
          name.includes('AB ROLLER') ||
          name.includes('WOODCHOPPER') ||
          name.includes('SIT-UP')
        );
      }

      return mg.includes(filterKey);
    });
  }, [exercises, selectedInserterMuscle]);

  useEffect(() => {
    if (inserterExercises.length > 0) {
      const exists = inserterExercises.some(e => e.id === selectedExToAdd);
      if (!exists) {
        setSelectedExToAdd(inserterExercises[0].id);
      }
    } else {
      setSelectedExToAdd('');
    }
  }, [inserterExercises, selectedExToAdd]);

  // Filter preset splits dynamically by difficulty level pill (ALL, BEGINNER, INTERMEDIATE, PRO)
  const filteredPresetSplits = useMemo(() => {
    if (selectedDifficulty === 'ALL') return presetSplits;
    return presetSplits.filter(s => {
      const lvl = (s.level || s.difficulty || s.difficultyLevel || s.category || '').toUpperCase();
      return lvl.includes(selectedDifficulty.toUpperCase());
    });
  }, [presetSplits, selectedDifficulty]);

  const activeSplit = useMemo(() => {
    return presetSplits.find(s => s.id === selectedSplitId) || presetSplits[0];
  }, [presetSplits, selectedSplitId]);

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



  const handleSelectSavedSplit = (split: WorkoutPlan) => {
    setIsConfirmingDelete(false);
    setEditingSplitId(split.id || null);
    setWorkoutName(split.title || split.name || 'Custom Split');
    setWorkoutCategory(split.category || 'CUSTOM_SPLIT');
    if (split.targetDays) {
      const parsed = split.targetDays.split(',').map(d => d.trim()).filter(Boolean);
      setSelectedDays(parsed.length > 0 ? parsed : DAYS_OF_WEEK);
    } else {
      setSelectedDays(DAYS_OF_WEEK);
    }

    if (split.exercises && split.exercises.length > 0) {
      setWorkoutExercises(
        split.exercises.map(e => ({
          id: e.id,
          exerciseId: e.exerciseId,
          sets: e.sets || 4,
          reps: e.reps || '8-12',
          targetDays: e.targetDays ? e.targetDays.split(',').map(d => d.trim()).filter(Boolean) : DAYS_OF_WEEK,
        }))
      );
    } else {
      setWorkoutExercises([]);
    }
    triggerAnnouncement(`Loaded routine ${split.title || split.name}`);
  };

  const handleResetDraft = () => {
    setIsConfirmingDelete(false);
    setEditingSplitId(null);
    setWorkoutName('My Custom Hypertrophy Routine');
    setWorkoutCategory('CUSTOM_SPLIT');
    setSelectedDays(DAYS_OF_WEEK);
    setWorkoutExercises([]);
    setEditingExIndex(null);
    triggerAnnouncement('Started new routine draft.');
  };

  const handleToggleGlobalDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleToggleAddExDay = (day: string) => {
    if (addExDays.includes(day)) {
      setAddExDays(addExDays.filter(d => d !== day));
    } else {
      setAddExDays([...addExDays, day]);
    }
  };

  const handleToggleEditExDay = (day: string) => {
    if (editExDays.includes(day)) {
      setEditExDays(editExDays.filter(d => d !== day));
    } else {
      setEditExDays([...editExDays, day]);
    }
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExToAdd) return;
    setWorkoutExercises([
      ...workoutExercises,
      {
        exerciseId: selectedExToAdd,
        sets: Number(addSets) || 4,
        reps: addReps || '8-12',
        targetDays: addExDays.length > 0 ? [...addExDays] : [...selectedDays],
      },
    ]);
    const name = exercises.find(ex => ex.id === selectedExToAdd)?.name || 'Exercise';
    triggerAnnouncement(`Added ${name} to routine.`);
  };

  const handleStartEditExercise = (index: number) => {
    const item = workoutExercises[index];
    setEditingExIndex(index);
    setEditExSets(String(item.sets));
    setEditExReps(item.reps);
    setEditExDays(item.targetDays || [...selectedDays]);
  };

  const handleSaveEditExercise = (index: number) => {
    const updated = [...workoutExercises];
    updated[index] = {
      ...updated[index],
      sets: Number(editExSets) || 4,
      reps: editExReps || '8-12',
      targetDays: editExDays.length > 0 ? [...editExDays] : [...selectedDays],
    };
    setWorkoutExercises(updated);
    setEditingExIndex(null);
    triggerAnnouncement('Updated exercise customization.');
  };

  const handleDeleteExercise = (index: number) => {
    const exName = exercises.find(e => e.id === workoutExercises[index].exerciseId)?.name || 'Exercise';
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
    if (editingExIndex === index) setEditingExIndex(null);
    triggerAnnouncement(`Removed ${exName} from routine.`);
  };

  const handleSaveRoutineToBackend = async () => {
    if (!workoutName.trim()) {
      alert('Please enter a routine name');
      return;
    }
    if (workoutExercises.length === 0) {
      alert('Please add at least one exercise to your routine');
      return;
    }

    setIsSavingSplit(true);
    try {
      const payload: Partial<WorkoutPlan> = {
        title: workoutName,
        name: workoutName,
        category: workoutCategory,
        daysPerWeek: selectedDays.length,
        targetDays: selectedDays.join(','),
        exercises: workoutExercises.map(ex => {
          const matchedCatalogEx = ALL_CATALOG_EXERCISES.find(c => c.id === ex.exerciseId) || exercises.find(c => c.id === ex.exerciseId);
          return {
            exerciseId: ex.exerciseId,
            name: matchedCatalogEx?.name || 'Exercise',
            muscleGroup: matchedCatalogEx?.muscleGroup || 'TARGET',
            mechanics: matchedCatalogEx?.mechanics || 'COMPOUND',
            description: matchedCatalogEx?.description || '',
            sets: ex.sets,
            reps: ex.reps,
            targetDays: (ex.targetDays || []).join(','),
          };
        }),
      };

      let res: WorkoutPlan;
      if (editingSplitId) {
        res = await updateWorkout(editingSplitId, payload);
        triggerAnnouncement(`Updated split routine "${workoutName}" successfully!`);
      } else {
        res = await createWorkout(payload);
        triggerAnnouncement(`Created split routine "${workoutName}" successfully!`);
      }

      const refreshed = await getMySplits();
      setMySplits(refreshed);
      if (res && res.id) setEditingSplitId(res.id);
    } catch (err) {
      console.error('Failed to save workout split routine', err);
      alert('Error saving split routine to server.');
    } finally {
      setIsSavingSplit(false);
    }
  };

  const handleDeleteRoutineFromBackend = async () => {
    if (!editingSplitId) {
      alert('Please select a saved routine to delete.');
      return;
    }

    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }

    setIsDeletingSplit(true);
    try {
      await deleteWorkout(editingSplitId);
      triggerAnnouncement(`Deleted routine "${workoutName}".`);
      const refreshed = await getMySplits();
      setMySplits(refreshed);
      handleResetDraft();
      setIsConfirmingDelete(false);
    } catch (err) {
      console.error('Failed to delete split routine', err);
      alert('Error deleting split routine.');
    } finally {
      setIsDeletingSplit(false);
    }
  };

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    setDietFoods([...dietFoods, { foodId: selectedFoodToAdd, quantityG: Number(addGrams) }]);
    const currentList = Array.isArray(foodsList) && foodsList.length > 0 ? foodsList : DEFAULT_MACRO_FOODS;
    const name = currentList.find(f => f.id === selectedFoodToAdd)?.name || 'Food';
    triggerAnnouncement(`Added ${addGrams}g of ${name} to macro meal draft.`);
  };

  // Calculate total macros
  const calculateTotalMacros = () => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    const currentList = Array.isArray(foodsList) && foodsList.length > 0 ? foodsList : DEFAULT_MACRO_FOODS;

    dietFoods.forEach(item => {
      const food = currentList.find(f => f.id === item.foodId);
      if (!food) return;
      const factor = item.quantityG / 100;
      const c = food.caloriesPer100g ?? (food as any).calories ?? 0;
      const p = food.proteinPer100g ?? (food as any).protein ?? 0;
      const cb = food.carbsPer100g ?? (food as any).carbohydrates ?? (food as any).carbs ?? 0;
      const ft = food.fatPer100g ?? (food as any).fat ?? (food as any).fats ?? 0;
      calories += c * factor;
      protein += p * factor;
      carbs += cb * factor;
      fat += ft * factor;
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
    <div className="space-y-4 sm:space-y-8 pb-12">
      {/* ── TOP BAR OPTION NAVIGATION (GYM COLOR PALETTE SYSTEM) ── */}
      <div className="p-1.5 sm:p-2 rounded-2xl bg-[#FFFFFF] dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34] shadow-xl">

        {/* ── MOBILE: 2-column grid (hidden on sm+) ── */}
        <div className="grid grid-cols-2 gap-1 sm:hidden">
          {[
            { id: 'SCANNER',        label: 'Scanner',  icon: Activity },
            { id: 'SELECT_WORKOUT', label: 'Routines', icon: Target   },
            { id: 'PRESET_SPLITS',  label: 'Splits',   icon: Zap      },
            { id: 'CUSTOM_BUILDER', label: 'Builder',  icon: Dumbbell },
            { id: 'MACRO_METER',    label: 'Macros',   icon: Apple    },
            { id: 'BMI_CALCULATOR', label: 'BMI',      icon: Scale    },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#E63946] text-white shadow-md'
                    : 'text-[#626A73] dark:text-[#A7AFB8] hover:bg-[#EEF0F3] dark:hover:bg-[#1C2024]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-[#2563EB] dark:text-[#4D8DFF]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── SM+: Horizontal scrollable pill row (hidden on mobile) ── */}
        <div className="hidden sm:block overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: 'SCANNER',        labelFull: 'Muscle Target Scanner', icon: Activity },
              { id: 'SELECT_WORKOUT', labelFull: 'Workout Routines',      icon: Target   },
              { id: 'PRESET_SPLITS',  labelFull: 'Hypertrophy Splits',    icon: Zap      },
              { id: 'CUSTOM_BUILDER', labelFull: 'Split Builder',         icon: Dumbbell },
              { id: 'MACRO_METER',    labelFull: 'Macro Meter',           icon: Apple    },
              { id: 'BMI_CALCULATOR', labelFull: 'BMI & Health',          icon: Scale    },
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#E63946] text-white hover:bg-[#C92F3B] dark:bg-[#FF4D5A] dark:text-[#0B0D0F] shadow-md scale-[1.02]'
                      : 'text-[#626A73] dark:text-[#A7AFB8] hover:text-[#111418] dark:hover:text-[#F5F7FA] hover:bg-[#EEF0F3] dark:hover:bg-[#1C2024]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white dark:text-[#0B0D0F]' : 'text-[#2563EB] dark:text-[#4D8DFF]'}`} />
                  <span>{tab.labelFull}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>


      {/* ── TAB 1: 3D SCI-FI TARGET SCANNER (DEFAULT VIEW) ──────────────────── */}
      {activeTab === 'SCANNER' && (
        <div className="space-y-4 sm:space-y-8">
          <HumanBodyMap
            selectedMuscle={selectedMuscle}
            onSelectMuscle={handleSelectMuscle}
            exerciseCounts={exerciseCounts}
            gender={gender}
            onGenderChange={setGender}
          />

          {/* 10+ Exercises List for Selected Muscle */}
          <div ref={exercisesSectionRef} className="p-4 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34] space-y-4 sm:space-y-6 scroll-mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DDE1E6] dark:border-[#292E34] pb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-[#E63946] dark:text-[#FF4D5A] shrink-0" />
                  <h2 className="text-sm sm:text-base font-black text-[#111418] dark:text-[#F5F7FA] uppercase tracking-wide truncate">
                    {selectedMuscle || 'All Muscle Groups'}
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs text-[#626A73] dark:text-[#A7AFB8] font-medium mt-0.5 hidden sm:block">
                  10+ exercise plans with step-by-step form execution guides, bench angles, & safety cues.
                </p>
              </div>
              <div className="text-[11px] sm:text-xs text-[#626A73] dark:text-[#A7AFB8] font-mono shrink-0">
                <span className="text-[#E63946] dark:text-[#FF4D5A] font-black">{filteredExercises.length}</span> exercises
              </div>
            </div>

            {loadingExercises ? (
              <div className="p-12 text-center text-xs text-[#626A73] dark:text-[#A7AFB8]">Loading exercise database...</div>
            ) : filteredExercises.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#626A73] dark:text-[#A7AFB8]">
                No exercises found for this filter. Select another muscle group.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {filteredExercises.map(ex => {
                  return (
                    <div
                      key={ex.id}
                      onClick={() => setInspectingExercise(ex)}
                      className="group cursor-pointer rounded-2xl bg-white dark:bg-[#14171A] border border-slate-200 dark:border-[#292E34] hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 p-3.5 sm:p-4 flex flex-col justify-between shadow-sm hover:shadow-md relative"
                    >
                      {/* Top Row: Tags & Info Icon */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                            {ex.muscleGroup}
                          </span>
                        </div>

                        {/* Hover Info Icon */}
                        <div className="p-1 rounded-full text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 transition-colors shrink-0" title="Click to view technique & safety cues">
                          <Info className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1 mb-3">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                          {ex.name}
                        </h3>
                        {ex.description && (
                          <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {ex.description}
                          </p>
                        )}
                      </div>

                      {/* Metrics Bar */}
                      <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 text-center">
                        <div className="py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/50">
                          <span className="block text-xs font-black text-slate-900 dark:text-zinc-100 font-mono">
                            {ex.recommendedSets || 4} Sets
                          </span>
                        </div>
                        <div className="py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/50">
                          <span className="block text-xs font-black text-slate-900 dark:text-zinc-100 font-mono">
                            {ex.recommendedReps || '8-12'} Reps
                          </span>
                        </div>
                        <div className="py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/50">
                          <span className="block text-xs font-black text-slate-900 dark:text-zinc-100 font-mono">
                            {ex.restInterval || '90s'} Rest
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>


            )}
          </div>
        </div>
      )}

      {/* ── TAB: SELECT WORKOUT PROGRAM SPLIT & CUSTOMIZE EXERCISES ─────────── */}
      {activeTab === 'SELECT_WORKOUT' && (
        <div className="p-4 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34] space-y-4 sm:space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 border-b border-[#DDE1E6] dark:border-[#292E34] pb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#E63946] dark:text-[#FF4D5A] shrink-0" />
                <h2 className="text-sm sm:text-base font-black text-[#111418] dark:text-[#F5F7FA] uppercase tracking-wide leading-tight">
                  Workout Programs
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-[#626A73] dark:text-[#A7AFB8] font-medium mt-0.5 hidden sm:block">
                Select your overall workout program split (PPL, Upper/Lower, Full Body). Each focus offers 10 exercises.
              </p>
            </div>

            {selectedProgramKey && PROGRAM_SPLITS_CONFIG[selectedProgramKey] && (
              <div className="px-3 py-1.5 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-xs font-black text-[#16A34A] dark:bg-[#16A34A]/20 dark:border-[#16A34A]/50 flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span className="truncate">Active: <strong>{PROGRAM_SPLITS_CONFIG[selectedProgramKey].title}</strong></span>
              </div>
            )}
          </div>

          {/* Program Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {Object.values(PROGRAM_SPLITS_CONFIG).map((prog) => {
              const isSelected = selectedProgramKey === prog.key;
              return (
                <div
                  key={prog.key}
                  className={`p-4 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 sm:space-y-5 shadow-lg ${
                    isSelected
                      ? 'bg-[#EEF0F3] dark:bg-[#1C2024] border-[#E63946] dark:border-[#FF4D5A] ring-2 ring-[#E63946]/50 dark:ring-[#FF4D5A]/50 text-[#111418] dark:text-[#F5F7FA]'
                      : 'bg-[#FFFFFF] dark:bg-[#14171A] border-[#DDE1E6] dark:border-[#292E34] text-[#111418] dark:text-[#F5F7FA] hover:border-[#E63946]/50 dark:hover:border-[#FF4D5A]/50'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${
                        isSelected ? 'bg-[#E63946]/15 border-[#E63946]/30 text-[#E63946] dark:bg-[#FF4D5A]/20 dark:text-[#FF4D5A] dark:border-[#FF4D5A]/40' : 'bg-[#EEF0F3] dark:bg-[#1C2024] border-[#DDE1E6] dark:border-[#292E34] text-[#626A73] dark:text-[#A7AFB8]'
                      }`}>
                        {prog.badge}
                      </span>
                      {isSelected && (
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded-lg bg-[#16A34A]/15 text-[#16A34A] border border-[#16A34A]/30 flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> Active Program
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-black text-[#111418] dark:text-[#F5F7FA]">{prog.title}</h3>
                      <p className="text-xs text-[#2563EB] dark:text-[#4D8DFF] font-black mt-0.5">{prog.subtitle}</p>
                      <p className="text-xs text-[#626A73] dark:text-[#A7AFB8] font-medium mt-2 leading-relaxed">{prog.description}</p>
                    </div>

                    {/* Sub-Focuses & 10-Exercise Custom Selection */}
                    <div className="space-y-4 pt-3 border-t border-[#DDE1E6] dark:border-[#292E34]">
                      {prog.focusKeys.map((focusKey) => {
                        const focusCatalog = EXERCISES_CATALOG[focusKey];
                        if (!focusCatalog) return null;
                        const selectedIds = customExerciseSelections[focusKey] || focusCatalog.exercises.map(e => e.id);

                        return (
                          <div key={focusKey} className="space-y-2.5 p-3.5 rounded-xl bg-[#EEF0F3] dark:bg-[#1C2024] border border-[#DDE1E6] dark:border-[#292E34]">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-[#111418] dark:text-[#F5F7FA] flex items-center gap-1.5">
                                <Dumbbell className="w-3.5 h-3.5 text-[#E63946] dark:text-[#FF4D5A]" /> {focusCatalog.label}
                              </span>
                              <span className="text-[10px] font-black text-[#2563EB] dark:text-[#4D8DFF]">
                                {selectedIds.length} / {focusCatalog.exercises.length} Selected
                              </span>
                            </div>

                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                              {focusCatalog.exercises.map((ex, idx) => {
                                const isChecked = selectedIds.includes(ex.id);
                                return (
                                  <label
                                    key={ex.id}
                                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                                      isChecked
                                        ? 'bg-[#FFFFFF] dark:bg-[#14171A] border-[#2563EB] dark:border-[#4D8DFF] text-[#111418] dark:text-[#F5F7FA] font-bold shadow-sm'
                                        : 'bg-[#FFFFFF]/60 dark:bg-[#14171A]/60 border-[#DDE1E6] dark:border-[#292E34] text-[#626A73] dark:text-[#A7AFB8] hover:border-[#2563EB]/40'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleExerciseSelection(focusKey, ex.id)}
                                        className="w-3.5 h-3.5 rounded border-[#DDE1E6] dark:border-[#292E34] text-[#2563EB] focus:ring-[#2563EB] bg-[#FFFFFF] dark:bg-[#14171A] cursor-pointer"
                                      />
                                      <span className="truncate text-xs font-extrabold">{idx + 1}. {ex.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                                      <span className="text-[#626A73] dark:text-[#A7AFB8] font-bold">{ex.target}</span>
                                      <span className="text-[#2563EB] dark:text-[#4D8DFF] font-black">{ex.sets}×{ex.reps}</span>
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
                    className={`w-full py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md ${
                      isSelected
                        ? 'bg-[#16A34A] text-white hover:bg-[#15803D] shadow-sm'
                        : 'bg-[#E63946] hover:bg-[#C92F3B] text-white dark:bg-[#FF4D5A] dark:hover:bg-[#FF6670] dark:text-[#0B0D0F]'
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
        <div className="p-4 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34] space-y-4 sm:space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3 border-b border-[#DDE1E6] dark:border-[#292E34] pb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B] shrink-0" />
                <h2 className="text-sm sm:text-base font-black text-[#111418] dark:text-[#F5F7FA] uppercase tracking-wide">
                  Hypertrophy Splits
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-[#626A73] dark:text-[#A7AFB8] font-medium mt-0.5 hidden sm:block">
                Curated periodized splits for Beginners, Intermediate, & Advanced athletes.
              </p>
            </div>
            {/* Difficulty filter pills */}
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {(['ALL', 'BEGINNER', 'INTERMEDIATE', 'PRO'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedDifficulty(lvl)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all ${
                    selectedDifficulty === lvl
                      ? 'bg-[#E63946] text-white dark:bg-[#FF4D5A] dark:text-[#0B0D0F] shadow-md'
                      : 'bg-[#EEF0F3] dark:bg-[#1C2024] border border-[#DDE1E6] dark:border-[#292E34] text-[#626A73] dark:text-[#A7AFB8] hover:text-[#111418] dark:hover:text-[#F5F7FA]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 2-col on mobile, 3-col on md, 5-col on xl */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-4">
            {filteredPresetSplits.map(split => (
              <button
                key={split.id}
                onClick={() => handleSelectSplit(split.id)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                  selectedSplitId === split.id
                    ? 'bg-[#EEF0F3] dark:bg-[#1C2024] border-[#E63946] dark:border-[#FF4D5A] ring-2 ring-[#E63946]/50 dark:ring-[#FF4D5A]/50 text-[#111418] dark:text-[#F5F7FA] shadow-lg'
                    : 'bg-[#FFFFFF] dark:bg-[#14171A] border-[#DDE1E6] dark:border-[#292E34] text-[#626A73] dark:text-[#A7AFB8] hover:border-[#E63946]/50 dark:hover:border-[#FF4D5A]/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-[#F59E0B]/20 text-[#F59E0B]">
                      {split.badge || split.category || 'HYPERTROPHY'}
                    </span>
                    <span className="text-[10px] font-mono text-[#626A73] dark:text-[#A7AFB8] font-black">
                      {split.duration || (split.daysPerWeek ? `${split.daysPerWeek} Days/Wk` : '6 Days/Wk')}
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-[#111418] dark:text-[#F5F7FA] line-clamp-2">{split.title || split.name}</h3>
                  <p className="text-[11px] text-[#626A73] dark:text-[#A7AFB8] font-medium line-clamp-3 leading-relaxed">{split.description}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-[#DDE1E6] dark:border-[#292E34] flex items-center justify-between text-[10px] font-black text-[#E63946] dark:text-[#FF4D5A]">
                  <span>View Routine</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>

          <div ref={activeSplitSectionRef} className="space-y-4 sm:space-y-6 pt-2">
            {activeSplit && Array.isArray(activeSplit.splitDays) && activeSplit.splitDays.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34] space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#DDE1E6] dark:border-[#292E34] pb-3">
                  <h4 className="text-xs font-black text-[#111418] dark:text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2 min-w-0">
                    <Zap className="w-4 h-4 text-[#F59E0B] shrink-0" />
                    <span className="truncate">{activeSplit.name || activeSplit.title}</span>
                  </h4>
                  <span className="text-xs text-[#F59E0B] font-mono font-black shrink-0 ml-2">{activeSplit.level || 'INTERMEDIATE'}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                  {activeSplit.splitDays.map((day: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#EEF0F3] dark:bg-[#1C2024] border border-[#DDE1E6] dark:border-[#292E34] space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-black text-[#111418] dark:text-[#F5F7FA]">
                        <span className="text-[#E63946] dark:text-[#FF4D5A] font-mono">{day.day || `Day ${idx + 1}`}</span>
                        <span>{day.title || day.name}</span>
                      </div>
                      <p className="text-xs font-medium text-[#626A73] dark:text-[#A7AFB8] leading-snug">{day.muscles || day.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {activeSplit && Array.isArray(activeSplit.exercises) && activeSplit.exercises.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34] space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DDE1E6] dark:border-[#292E34] pb-3">
                <h4 className="text-xs font-black text-[#111418] dark:text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2 min-w-0">
                  <Dumbbell className="w-4 h-4 text-[#E63946] dark:text-[#FF4D5A] shrink-0" />
                  <span className="truncate">{activeSplit.title || activeSplit.name}</span>
                </h4>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#2563EB] dark:text-[#4D8DFF] font-mono font-black hidden sm:inline">{activeSplit.category || 'Hypertrophy'}</span>
                  <button 
                    onClick={() => setIsTimerOpen(true)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" fill="currentColor" /> <span>Start</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
                {activeSplit.exercises.map((ex: any, idx: number) => {
                  const exName = ex.name || ex.exerciseName || ex.exercise?.name || `Workout Movement ${idx + 1}`;
                  const exDesc = ex.description || ex.exercise?.description || 'Hypertrophy execution with strict tempo control.';
                  const mechanics = ex.mechanics || ex.exercise?.mechanics || 'COMPOUND';
                  const muscle = ex.muscleGroup || ex.exercise?.muscleGroup || 'TARGET';
                  const setsDisplay = ex.sets ? `${ex.sets} sets` : '4 sets';
                  const repsDisplay = ex.reps ? `× ${ex.reps} reps` : '× 8-12 reps';

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
                      className="p-4 rounded-xl bg-[#EEF0F3] dark:bg-[#1C2024] border border-[#DDE1E6] dark:border-[#292E34] space-y-2.5 flex flex-col justify-between hover:border-[#E63946] dark:hover:border-[#FF4D5A] transition-all text-left w-full group shadow-sm"
                    >
                      <div className="space-y-1.5 w-full">
                        <div className="flex items-center justify-between text-[11px] font-black">
                          <span className="text-[#E63946] dark:text-[#FF4D5A] font-mono">Movement #{idx + 1}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded tracking-wide ${
                            mechanics === 'COMPOUND' ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30' : 'bg-[#2563EB]/20 text-[#2563EB] dark:text-[#4D8DFF] border border-[#2563EB]/30'
                          }`}>
                            {mechanics}
                          </span>
                        </div>
                        <h5 className="text-xs font-black text-[#111418] dark:text-[#F5F7FA] flex items-center justify-between">
                          <span>{exName}</span>
                          <span className="text-[10px] text-[#626A73] dark:text-[#A7AFB8] font-mono uppercase">{muscle}</span>
                        </h5>
                        <p className="text-[11px] text-[#626A73] dark:text-[#A7AFB8] font-medium leading-relaxed line-clamp-2">{exDesc}</p>
                      </div>
                      <div className="pt-2 border-t border-[#DDE1E6] dark:border-[#292E34] flex items-center justify-between w-full">
                        <div className="text-[10px] font-mono font-black text-[#2563EB] dark:text-[#4D8DFF]">
                          <span className="bg-[#FFFFFF] dark:bg-[#14171A] px-2.5 py-0.5 rounded-full border border-[#DDE1E6] dark:border-[#292E34]">
                            {setsDisplay} {repsDisplay}
                          </span>
                        </div>
                        <div className="text-[10px] font-black text-[#E63946] dark:text-[#FF4D5A] flex items-center gap-1">
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
        </div>
      )}

      {/* ── TAB 3: CUSTOM HYPERTROPHY SPLIT BUILDER ───────────────────────────── */}
      {activeTab === 'CUSTOM_BUILDER' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Saved Splits Bar */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-[#DDE1E6] dark:border-[#292E34] bg-[#FFFFFF] dark:bg-[#14171A] shadow-xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-black text-[#111418] dark:text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2 min-w-0">
                <Layers className="w-4 h-4 text-[#2563EB] dark:text-[#4D8DFF] shrink-0" />
                <span className="truncate">Saved Splits ({mySplits.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleResetDraft}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-black transition flex items-center gap-1.5 shadow shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">New Routine</span><span className="sm:hidden">New</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {mySplits.length === 0 ? (
                <p className="text-xs text-[#626A73] dark:text-[#A7AFB8] italic">No saved custom splits found. Create one below!</p>
              ) : (
                mySplits.map(split => {
                  const isActive = editingSplitId === split.id;
                  return (
                    <button
                      key={split.id}
                      type="button"
                      onClick={() => handleSelectSavedSplit(split)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border flex items-center gap-2 ${
                        isActive
                          ? 'bg-[#E63946] text-white border-[#E63946] shadow-lg scale-[1.02]'
                          : 'bg-[#EEF0F3] dark:bg-[#1C2024] text-[#111418] dark:text-[#F5F7FA] border-[#DDE1E6] dark:border-[#292E34] hover:border-[#E63946]'
                      }`}
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>{split.title || split.name}</span>
                      <span className="text-[10px] opacity-80 font-mono">({split.exercises?.length || 0} ex)</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Routine Builder Panel */}
          <div className="p-4 sm:p-6 rounded-2xl border border-[#DDE1E6] dark:border-[#292E34] bg-[#FFFFFF] dark:bg-[#14171A] shadow-xl space-y-4 sm:space-y-6">
            {/* Header / Meta Settings */}
            <div className="space-y-3 sm:space-y-4 border-b border-[#DDE1E6] dark:border-[#292E34] pb-4 sm:pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-[#E63946] dark:text-[#FF4D5A]" />
                  <h3 className="font-black text-[#111418] dark:text-[#F5F7FA] text-base">
                    {editingSplitId ? 'Edit Split Routine' : 'Create Custom Split Routine'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {editingSplitId && permissions.canDelete('workout') && (
                    <button
                      type="button"
                      onClick={handleDeleteRoutineFromBackend}
                      disabled={isDeletingSplit}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow ${
                        isConfirmingDelete
                          ? 'bg-rose-700 hover:bg-rose-800 text-white ring-2 ring-rose-400 animate-pulse'
                          : 'bg-rose-600 hover:bg-rose-700 text-white'
                      } disabled:opacity-50`}
                    >
                      {isDeletingSplit ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      {isConfirmingDelete ? 'Confirm Delete Routine?' : 'Delete Routine'}
                    </button>
                  )}
                  {(editingSplitId ? permissions.canEdit('workout') : permissions.canCreate('workout')) && (
                    <button
                      type="button"
                      onClick={handleSaveRoutineToBackend}
                      disabled={isSavingSplit}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      {isSavingSplit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {editingSplitId ? 'Update Routine' : 'Save Routine'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#626A73] dark:text-[#A7AFB8] uppercase tracking-wider mb-1">
                    Routine Title / Name
                  </label>
                  <input
                    type="text"
                    value={workoutName}
                    onChange={e => setWorkoutName(e.target.value)}
                    placeholder="e.g. 5-Day Push Pull Legs Hypertrophy"
                    className="w-full px-3.5 py-2 border border-[#DDE1E6] dark:border-[#292E34] bg-[#EEF0F3] dark:bg-[#1C2024] rounded-xl text-[#111418] dark:text-[#F5F7FA] font-bold text-xs focus:ring-2 focus:ring-[#E63946] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#626A73] dark:text-[#A7AFB8] uppercase tracking-wider mb-1">
                    Split Category / Type
                  </label>
                  <select
                    value={workoutCategory}
                    onChange={e => setWorkoutCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#DDE1E6] dark:border-[#292E34] bg-[#EEF0F3] dark:bg-[#1C2024] rounded-xl text-[#111418] dark:text-[#F5F7FA] font-bold text-xs outline-none"
                  >
                    <option value="CUSTOM_SPLIT">Custom Split</option>
                    <option value="Hypertrophy">Hypertrophy (Muscle Building)</option>
                    <option value="Strength">Strength & Power</option>
                    <option value="PPL">Push Pull Legs (PPL)</option>
                    <option value="Upper / Lower">Upper / Lower Split</option>
                    <option value="Full Body">Full Body Routine</option>
                  </select>
                </div>
              </div>

              {/* Day of Week Selector */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-[#626A73] dark:text-[#A7AFB8] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#E63946]" /> Routine Active Days ({selectedDays.length} / 7 days selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDays([...DAYS_OF_WEEK])}
                      className="text-[10px] font-black text-[#2563EB] dark:text-[#4D8DFF] hover:underline"
                    >
                      Select All Days
                    </button>
                    <span className="text-[#626A73]">•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedDays([])}
                      className="text-[10px] font-black text-rose-500 hover:underline"
                    >
                      Clear Days
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleGlobalDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#2563EB] text-white border-[#2563EB] shadow'
                            : 'bg-[#EEF0F3] dark:bg-[#1C2024] text-[#626A73] dark:text-[#A7AFB8] border-[#DDE1E6] dark:border-[#292E34] hover:border-[#2563EB]'
                        }`}
                      >
                        {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Exercises Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-[#111418] dark:text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#E63946]" /> Selected Routine Exercises ({workoutExercises.length})
                </h4>
              </div>

              {workoutExercises.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#EEF0F3] dark:bg-[#1C2024] border border-dashed border-[#DDE1E6] dark:border-[#292E34] space-y-2">
                  <Dumbbell className="w-8 h-8 text-[#626A73] dark:text-[#A7AFB8] mx-auto opacity-50" />
                  <p className="text-xs font-bold text-[#626A73] dark:text-[#A7AFB8]">No exercises added to this routine yet.</p>
                  <p className="text-[10px] text-[#626A73] dark:text-[#A7AFB8]">Use the form below to insert exercises into your custom split.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workoutExercises.map((we, index) => {
                    const ex = ALL_CATALOG_EXERCISES.find(e => e.id === we.exerciseId) || exercises.find(e => e.id === we.exerciseId);
                    const isEditingThis = editingExIndex === index;

                    if (isEditingThis) {
                      return (
                        <div
                          key={index}
                          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between font-black text-amber-600 dark:text-amber-400">
                            <span>Editing: {ex?.name || 'Exercise'}</span>
                            <button
                              type="button"
                              onClick={() => setEditingExIndex(null)}
                              className="text-[10px] underline"
                            >
                              Cancel
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 mb-1">Sets</label>
                              <input
                                type="number"
                                value={editExSets}
                                onChange={e => setEditExSets(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-zinc-500 mb-1">Reps</label>
                              <input
                                type="text"
                                value={editExReps}
                                onChange={e => setEditExReps(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg font-mono font-bold"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 mb-1">Assigned Days for Exercise</label>
                            <div className="flex flex-wrap gap-1.5">
                              {DAYS_OF_WEEK.map(d => {
                                const active = editExDays.includes(d);
                                return (
                                  <button
                                    key={d}
                                    type="button"
                                    onClick={() => handleToggleEditExDay(d)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                      active ? 'bg-amber-600 text-white border-amber-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                                    }`}
                                  >
                                    {d.slice(0, 3)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSaveEditExercise(index)}
                            className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition text-xs flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" /> Save Exercise Changes
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={index}
                        className="p-4 rounded-xl bg-[#EEF0F3] dark:bg-[#1C2024] border border-[#DDE1E6] dark:border-[#292E34] flex flex-wrap lg:flex-nowrap justify-between items-center gap-3 text-xs hover:border-[#E63946] transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#E63946]/10 text-[#E63946] font-mono text-[10px] font-black">
                              #{index + 1}
                            </span>
                            <h4 className="font-black text-[#111418] dark:text-[#F5F7FA] text-sm">{ex?.name || 'Exercise'}</h4>
                          </div>
                          <p className="text-[10px] text-[#626A73] dark:text-[#A7AFB8] font-medium">
                            Target: <span className="font-bold text-[#111418] dark:text-[#F5F7FA]">{ex?.muscleGroup || 'TARGET'}</span> | Gear: {ex?.equipment || 'Barbell'}
                          </p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {(we.targetDays && we.targetDays.length > 0 ? we.targetDays : selectedDays).map(d => (
                              <span
                                key={d}
                                className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#2563EB]/15 text-[#2563EB] dark:text-[#4D8DFF] border border-[#2563EB]/30"
                              >
                                {d.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 min-w-max">
                          <div className="text-right">
                            <span className="font-mono font-black text-sm text-[#2563EB] dark:text-[#4D8DFF] block">
                              {we.sets} sets × {we.reps} reps
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditExercise(index)}
                              title="Edit exercise sets/reps/days"
                              className="p-2 rounded-lg bg-[#FFFFFF] dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34] text-amber-500 hover:bg-amber-500 hover:text-white transition shadow-sm"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExercise(index)}
                              title="Delete exercise from routine"
                              className="p-2 rounded-lg bg-[#FFFFFF] dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34] text-rose-500 hover:bg-rose-500 hover:text-white transition shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inserter Form */}
            <form
              onSubmit={handleAddExercise}
              className="mt-4 sm:mt-6 p-3.5 sm:p-4 rounded-xl border border-dashed border-[#2563EB]/40 bg-[#2563EB]/5 space-y-3 sm:space-y-4 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-black text-[#111418] dark:text-[#F5F7FA] flex items-center gap-1.5 text-xs">
                  <Plus className="w-4 h-4 text-[#2563EB] shrink-0" /> Add Exercise
                </h4>
                <span className="text-[10px] text-[#2563EB] font-bold">{inserterExercises.length} available</span>
              </div>
              
              {/* Step 1: Body Part / Target Muscle Group Selector */}
              <div>
                <label className="block text-[10px] font-black text-[#626A73] dark:text-[#A7AFB8] uppercase mb-1.5">
                  1. Target Muscle Group
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'CHEST', label: 'Chest (Upper/Lower/Bench)' },
                    { key: 'BACK', label: 'Back & Lats' },
                    { key: 'SHOULDERS', label: 'Shoulders & Delts' },
                    { key: 'BICEPS', label: 'Biceps' },
                    { key: 'TRICEPS', label: 'Triceps' },
                    { key: 'LEGS', label: 'Legs (Quads/Hams/Calves)' },
                    { key: 'ABS', label: 'Abs & Core' },
                    { key: 'ALL', label: 'All Body Parts' },
                  ].map(item => {
                    const isActive = selectedInserterMuscle === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSelectedInserterMuscle(item.key)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition border shadow-xs flex items-center gap-1 ${
                          isActive
                            ? 'bg-[#2563EB] text-white border-[#2563EB] ring-2 ring-[#2563EB]/30'
                            : 'bg-[#FFFFFF] dark:bg-[#14171A] text-[#626A73] dark:text-[#A7AFB8] border-[#DDE1E6] dark:border-[#292E34] hover:border-[#2563EB]'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Exercise & Sets / Reps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-[#626A73] dark:text-[#A7AFB8] uppercase mb-1">
                    2. Select Workout ({selectedInserterMuscle})
                  </label>
                  <select
                    value={selectedExToAdd}
                    onChange={e => setSelectedExToAdd(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDE1E6] dark:border-[#292E34] bg-[#FFFFFF] dark:bg-[#14171A] rounded-xl text-[#111418] dark:text-[#F5F7FA] font-bold text-xs outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {inserterExercises.length === 0 ? (
                      <option value="">No exercises found for {selectedInserterMuscle}</option>
                    ) : (
                      inserterExercises.map(ex => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name} ({ex.muscleGroup} • {ex.equipment})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#626A73] dark:text-[#A7AFB8] uppercase mb-1">Sets</label>
                  <input
                    type="number"
                    value={addSets}
                    onChange={e => setAddSets(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DDE1E6] dark:border-[#292E34] bg-[#FFFFFF] dark:bg-[#14171A] rounded-xl text-[#111418] dark:text-[#F5F7FA] font-mono font-bold text-xs text-center outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#626A73] dark:text-[#A7AFB8] uppercase mb-1">Reps</label>
                  <input
                    type="text"
                    value={addReps}
                    onChange={e => setAddReps(e.target.value)}
                    placeholder="e.g. 8-12"
                    className="w-full px-3 py-2 border border-[#DDE1E6] dark:border-[#292E34] bg-[#FFFFFF] dark:bg-[#14171A] rounded-xl text-[#111418] dark:text-[#F5F7FA] font-mono font-bold text-xs text-center outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#626A73] dark:text-[#A7AFB8] uppercase mb-1.5">
                  Exercise Day Assignment
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_OF_WEEK.map(d => {
                    const isSel = addExDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleToggleAddExDay(d)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition ${
                          isSel
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-[#FFFFFF] dark:bg-[#14171A] text-[#626A73] dark:text-[#A7AFB8] border-[#DDE1E6] dark:border-[#292E34]'
                        }`}
                      >
                        {d.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white font-black rounded-xl transition text-xs flex items-center justify-center gap-2 shadow"
              >
                <Plus className="w-4 h-4" /> Add Exercise to Routine
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 4: DYNAMIC NUTRITION MACRO METER ───────────────────────────── */}
      {activeTab === 'MACRO_METER' && (
        <div className="p-4 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between space-y-4 sm:space-y-6">
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
                    const currentList = Array.isArray(foodsList) && foodsList.length > 0 ? foodsList : DEFAULT_MACRO_FOODS;
                    const food = currentList.find(f => f.id === df.foodId);
                    const p = food?.proteinPer100g ?? (food as any)?.protein ?? 0;
                    const c = food?.carbsPer100g ?? (food as any)?.carbohydrates ?? (food as any)?.carbs ?? 0;
                    return (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-zinc-200 dark:border-zinc-800">
                        <div>
                          <span className="font-bold text-zinc-700 dark:text-zinc-200">{food?.name || 'Food Item'}</span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 ml-1">({df.quantityG}g portion)</span>
                        </div>
                        <span className="font-mono text-zinc-500 dark:text-zinc-400">
                          P: {Math.round(p * (df.quantityG / 100))}g | C:{' '}
                          {Math.round(c * (df.quantityG / 100))}g
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
                  {(Array.isArray(foodsList) && foodsList.length > 0 ? foodsList : DEFAULT_MACRO_FOODS).map(f => (
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
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-4 sm:space-y-6">
          <div className="flex items-start gap-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
            <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wide leading-tight">
                BMI & Health Calculator
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 hidden sm:block">
                Calculate Body Mass Index, BMR, Caloric Targets, Daily Fiber (g), and Hydration Water goals.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            {/* Input Form */}
            <div className="lg:col-span-5 space-y-4 p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
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
            <div className="lg:col-span-7 grid grid-cols-2 gap-2.5 sm:gap-4">
              {/* BMI Card */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> <span className="truncate">BMI Index</span>
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mt-1">
                    <span className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-white font-mono">{healthMetrics ? healthMetrics.bmi : '--'}</span>
                    <span className={`text-[10px] sm:text-xs font-bold truncate ${healthMetrics ? healthMetrics.bmiColor : 'text-zinc-500'}`}>{healthMetrics ? healthMetrics.bmiStatus : 'Calculating...'}</span>
                  </div>
                </div>
                <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                  Target: 18.5 – 24.9 kg/m²
                </p>
              </div>

              {/* BMR & Maintenance */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" /> <span className="truncate">BMR Resting</span>
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mt-1">
                    <span className="text-xl sm:text-3xl font-black text-amber-400 font-mono">{healthMetrics ? healthMetrics.bmr : '--'}</span>
                    <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">kcal/day</span>
                  </div>
                </div>
                <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-2 truncate">
                  TDEE: <span className="text-zinc-700 dark:text-zinc-200 font-bold">{healthMetrics ? healthMetrics.tdee : '--'} kcal</span>
                </p>
              </div>

              {/* Goal Targets (Bulk / Cut) */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" /> <span className="truncate">Caloric Targets</span>
                </span>
                <div className="space-y-1 text-[11px] sm:text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 dark:text-zinc-400 truncate">Bulk (+350):</span>
                    <span className="font-mono font-bold text-emerald-400 shrink-0">{healthMetrics ? healthMetrics.bulkCals : '--'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 dark:text-zinc-400 truncate">Cut (-450):</span>
                    <span className="font-mono font-bold text-amber-400 shrink-0">{healthMetrics ? healthMetrics.cutCals : '--'}</span>
                  </div>
                </div>
              </div>

              {/* Fiber & Water Hydration */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> <span className="truncate">Fiber & Water</span>
                </span>
                <div className="space-y-1 text-[11px] sm:text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 dark:text-zinc-400 truncate">Fiber:</span>
                    <span className="font-mono font-bold text-emerald-400 shrink-0">{healthMetrics ? healthMetrics.fiberGrams : '--'}g/d</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 dark:text-zinc-400 truncate">Water:</span>
                    <span className="font-mono font-bold text-blue-400 shrink-0">{healthMetrics ? healthMetrics.waterLiters : '--'}L</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Unit Conversion Telemetry */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2 col-span-2">
                <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> Real-time Unit Conversions
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-center font-mono text-xs">
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-cyan-400 font-bold block">{healthMetrics ? healthMetrics.normalizedHeightCm : '--'} cm</span>
                    <span className="text-[9px] text-zinc-500 font-sans">Centimeters</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-cyan-400 font-bold block">{healthMetrics ? healthMetrics.normalizedHeightM : '--'} m</span>
                    <span className="text-[9px] text-zinc-500 font-sans">Meters</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-cyan-400 font-bold block">{healthMetrics ? healthMetrics.heightFtInDisplay : '--'}</span>
                    <span className="text-[9px] text-zinc-500 font-sans font-medium">Feet & Inches</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-amber-400 font-bold block">{healthMetrics ? `${healthMetrics.normalizedWeightKg}kg / ${healthMetrics.normalizedWeightLbs}lbs` : '-- kg / -- lbs'}</span>
                    <span className="text-[9px] text-zinc-500 font-sans">Weight Eq.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal exercise={inspectingExercise} onClose={() => setInspectingExercise(null)} />

      {/* Workout Timer Modal */}
      <WorkoutTimerModal 
        isOpen={isTimerOpen} 
        onClose={() => setIsTimerOpen(false)} 
        exercises={(activeSplit?.exercises || []).map((ex: any, idx: number) => {
          const exName = ex.name || ex.exerciseName || ex.exercise?.name || `Workout Movement ${idx + 1}`;
          const exDesc = ex.description || ex.exercise?.description || 'Hypertrophy execution with strict tempo control.';
          const mechanics = ex.mechanics || ex.exercise?.mechanics || 'COMPOUND';
          const muscle = ex.muscleGroup || ex.exercise?.muscleGroup || 'TARGET';
          
          const fullExercise = exercises.find(e => e.id === ex.exerciseId) || {
            id: ex.exerciseId || `temp-${idx}`,
            name: exName,
            description: exDesc,
            muscleGroup: muscle,
            mechanics: mechanics,
            equipment: 'Various',
            recommendedSets: ex.sets || 4,
            recommendedReps: ex.reps ? String(ex.reps) : '8-12',
            executionSteps: ex.stepOneDescription ? `${ex.stepOneDescription}\n${ex.stepTwoDescription || ''}` : undefined
          } as Exercise;

          return { ...ex, fullExercise };
        })} 
      />
    </div>
  );
};
