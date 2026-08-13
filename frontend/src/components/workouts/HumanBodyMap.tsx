import React from 'react';
import {
  Dumbbell,
  Filter,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export type MuscleGroupKey =
  | 'CHEST'
  | 'BACK'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'FOREARMS'
  | 'ABS'
  | 'QUADS'
  | 'HAMSTRINGS'
  | 'GLUTES'
  | 'CALVES';

interface HumanBodyMapProps {
  selectedMuscle: MuscleGroupKey | null;
  onSelectMuscle: (muscle: MuscleGroupKey | null) => void;
  exerciseCounts?: Record<string, number>;
  gender?: 'MALE' | 'FEMALE';
}

const MUSCLE_IMAGES: Record<MuscleGroupKey, string> = {
  CHEST: '/muscles/chest.png',
  BACK: '/muscles/back.png',
  SHOULDERS: '/muscles/shoulders.png',
  BICEPS: '/muscles/arms.png',
  TRICEPS: '/muscles/arms.png',
  FOREARMS: '/muscles/forearms.png',
  ABS: '/muscles/abs.png',
  QUADS: '/muscles/quads.png',
  HAMSTRINGS: '/muscles/hamstrings.png',
  GLUTES: '/muscles/glutes.png',
  CALVES: '/muscles/calves.png',
};

const MUSCLE_METADATA: Record<
  MuscleGroupKey,
  {
    name: string;
    labelShort: string;
    category: string;
    tag: string;
    desc: string;
    exercises: string[];
  }
> = {
  CHEST: {
    name: 'Pectoralis Major & Minor',
    labelShort: 'Chest',
    category: 'upper push',
    tag: 'Upper Body Push Powerhouse',
    desc: 'Clavicular & sternal chest heads responsible for pushing horizontal loads and hugging movements.',
    exercises: ['Barbell Bench Press', 'Incline DB Press', 'Cable Flyes']
  },
  SHOULDERS: {
    name: 'Deltoids (Front, Lateral, Rear)',
    labelShort: 'Shoulders',
    category: 'overhead push',
    tag: '3D Shoulder Cap & Mobility',
    desc: 'Multi-angled deltoid heads providing arm rotation, overhead pressing, and side width.',
    exercises: ['Overhead Press', 'Lateral Raises', 'Arnold Press']
  },
  BACK: {
    name: 'Latissimus Dorsi & Rhomboids',
    labelShort: 'Back',
    category: 'upper pull',
    tag: 'V-Taper Width & Mid-Back Thickness',
    desc: 'Broad back musculature controlling pulling movements, posture, and scapular retraction.',
    exercises: ['Barbell Deadlift', 'Lat Pulldown', 'Heavy Barbell Row']
  },
  BICEPS: {
    name: 'Biceps Brachii',
    labelShort: 'Biceps',
    category: 'arm flexion',
    tag: 'Arm Flexion & Peak Contraction',
    desc: 'Two-headed arm flexor controlling elbow flexion and wrist supination.',
    exercises: ['Barbell Curls', 'Incline DB Curls', 'Preacher Curls']
  },
  TRICEPS: {
    name: 'Triceps Brachii',
    labelShort: 'Triceps',
    category: 'arm extension',
    tag: '60% of Arm Volume & Lockout Strength',
    desc: 'Three-headed tricep complex extending elbows and stabilizing overhead pressing.',
    exercises: ['Rope Pushdown', 'Skull Crushers', 'Close-Grip Press']
  },
  FOREARMS: {
    name: 'Brachioradialis & Flexors',
    labelShort: 'Forearms',
    category: 'arm stability',
    tag: 'Grip Strength & Forearm Density',
    desc: 'Controls grip endurance, wrist stabilization, and heavy pulling hold power.',
    exercises: ['Wrist Curls', "Farmer's Walk", 'Reverse Curls']
  },
  ABS: {
    name: 'Rectus Abdominis & Obliques',
    labelShort: 'Abs & Core',
    category: 'core',
    tag: 'Core Stabilization & Aesthetics',
    desc: 'Core wall stabilizing spinal flexion, rotation, and heavy compound lift bracing.',
    exercises: ['Hanging Leg Raises', 'Cable Crunches', 'Planks']
  },
  QUADS: {
    name: 'Quadriceps (Vastus)',
    labelShort: 'Quads',
    category: 'lower push',
    tag: 'Lower Body Primary Driver',
    desc: 'Four-headed knee extensor powering squats, lunges, and athletic explosive power.',
    exercises: ['Barbell Back Squat', 'Leg Press', 'Bulgarian Split Squat']
  },
  HAMSTRINGS: {
    name: 'Biceps Femoris',
    labelShort: 'Hamstrings',
    category: 'lower pull',
    tag: 'Posterior Knee Flexion & Sprint Engine',
    desc: 'Posterior thigh complex driving hip extension and knee flexion.',
    exercises: ['Romanian Deadlift (RDL)', 'Lying Leg Curl', 'Glute-Ham Raise']
  },
  GLUTES: {
    name: 'Gluteus Maximus',
    labelShort: 'Glutes',
    category: 'hip power',
    tag: 'Body Power Generator',
    desc: 'Largest muscle in the human body driving hip extension, abduction, and pelvis stability.',
    exercises: ['Barbell Hip Thrust', 'Sumo Deadlift', 'Cable Kickbacks']
  },
  CALVES: {
    name: 'Gastrocnemius & Soleus',
    labelShort: 'Calves',
    category: 'lower leg',
    tag: 'Ankle Extension & Lower Leg Sweep',
    desc: 'Durable ankle plantar flexors providing calf height, soleus thickness, and jump drive.',
    exercises: ['Standing Calf Raise', 'Seated Calf Raise', 'Donkey Calf Raise']
  }
};

export const HumanBodyMap: React.FC<HumanBodyMapProps> = ({
  selectedMuscle,
  onSelectMuscle,
  exerciseCounts = {}
}) => {
  const allRegionKeys: MuscleGroupKey[] = [
    'CHEST',
    'BACK',
    'SHOULDERS',
    'BICEPS',
    'TRICEPS',
    'FOREARMS',
    'ABS',
    'QUADS',
    'HAMSTRINGS',
    'GLUTES',
    'CALVES'
  ];

  const activeMeta = selectedMuscle ? MUSCLE_METADATA[selectedMuscle] : null;

  return (
    <div className="w-full rounded-[28px] bg-[#FFFFFF] dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34] shadow-xl p-6 relative font-sans text-[#111418] dark:text-[#F5F7FA] overflow-hidden space-y-6 transition-colors duration-300">
      {/* Background Subtle Grid Accent */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-5"
        style={{
          backgroundImage: `radial-gradient(#E63946 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* HEADER BAR */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DDE1E6] dark:border-[#292E34]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#E63946]/10 dark:bg-[#FF4D5A]/15 border border-[#E63946]/20 dark:border-[#FF4D5A]/30 flex items-center justify-center text-[#E63946] dark:text-[#FF4D5A] shadow-sm">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide text-[#111418] dark:text-[#F5F7FA]">
                MUSCLE TARGETING DATABASE
              </h1>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#E63946] text-white dark:bg-[#FF4D5A] dark:text-slate-950 font-extrabold shadow-sm">
                ACTIVE FILTER
              </span>
            </div>
            <p className="text-xs text-[#626A73] dark:text-[#A7AFB8] font-medium mt-0.5">
              Select a target muscle group below to filter exercises with execution guides & form tips.
            </p>
          </div>
        </div>

        {/* Clear Filter Button */}
        {selectedMuscle && (
          <button
            onClick={() => onSelectMuscle(null)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#EEF0F3] dark:bg-[#1C2024] border border-[#DDE1E6] dark:border-[#292E34] text-[#111418] dark:text-[#F5F7FA] hover:bg-[#E63946] hover:text-white dark:hover:bg-[#FF4D5A] dark:hover:text-slate-950 transition shadow-sm"
          >
            Show All Muscle Groups
          </button>
        )}
      </div>

      {/* MUSCLE GROUP GRID CARDS */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* 'ALL MUSCLES' BUTTON */}
        <button
          onClick={() => onSelectMuscle(null)}
          className={`relative overflow-hidden h-40 rounded-2xl border p-4 text-left transition-all duration-300 flex flex-col justify-between shadow-md ${
            selectedMuscle === null
              ? 'border-[#E63946] dark:border-[#FF4D5A] ring-2 ring-[#E63946]/80 dark:ring-[#FF4D5A]/90 shadow-[#E63946]/20 scale-[1.03]'
              : 'border-[#DDE1E6] dark:border-[#292E34] hover:border-[#E63946]/60 dark:hover:border-[#FF4D5A]/60'
          }`}
        >
          <div className="absolute inset-0 bg-[#1D1F22] dark:bg-[#0B0D0F] flex items-center justify-center pointer-events-none">
            <Sparkles className="w-16 h-16 text-[#E63946]/30 dark:text-[#FF4D5A]/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-[#0B0D0F]/70 to-[#1D1F22]/40" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF4D5A] drop-shadow">ALL WORKOUTS</span>
            <Sparkles className={`w-4 h-4 ${selectedMuscle === null ? 'text-[#FF4D5A]' : 'text-slate-400'}`} />
          </div>
          <div className="relative z-10">
            <p className="text-lg font-black text-white drop-shadow-md">Full Catalog</p>
            <p className="text-[10px] font-bold text-[#A7AFB8] drop-shadow">All Muscle Groups</p>
          </div>
        </button>

        {/* INDIVIDUAL MUSCLE CARDS WITH EXACT GYM COLOR SYSTEM */}
        {allRegionKeys.map((key) => {
          const meta = MUSCLE_METADATA[key];
          const isSelected = selectedMuscle === key;
          const count = exerciseCounts[key] || 10;
          const imgUrl = MUSCLE_IMAGES[key];

          return (
            <button
              key={key}
              onClick={() => onSelectMuscle(key)}
              className={`group relative overflow-hidden h-40 rounded-2xl border p-4 text-left transition-all duration-300 flex flex-col justify-between shadow-md ${
                isSelected
                  ? 'border-[#E63946] dark:border-[#FF4D5A] ring-2 ring-[#E63946]/90 dark:ring-[#FF4D5A]/90 shadow-xl shadow-[#E63946]/30 scale-[1.04]'
                  : 'border-[#DDE1E6] dark:border-[#292E34] hover:border-[#E63946]/60 dark:hover:border-[#FF4D5A]/60 hover:scale-[1.02]'
              }`}
            >
              {/* REAL ANATOMICAL PNG IMAGE BACKGROUND */}
              <div className="absolute inset-0 bg-[#0B0D0F] flex items-center justify-center overflow-hidden pointer-events-none">
                <img
                  src={imgUrl}
                  alt={meta.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 opacity-90"
                />
                {/* Vignette Overlay for Crisp Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-[#0B0D0F]/65 to-[#0B0D0F]/40" />
              </div>

              {/* OVERLAID TEXT CONTENT */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-black tracking-wider lowercase text-[#F59E0B] dark:text-[#F59E0B] drop-shadow-md bg-[#0B0D0F]/80 px-2 py-0.5 rounded-md border border-[#292E34] backdrop-blur-sm">
                  {meta.category}
                </span>
                <Dumbbell className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FF4D5A]' : 'text-slate-300'}`} />
              </div>

              <div className="relative z-10 space-y-0.5">
                <h3 className="text-lg font-black text-[#F5F7FA] tracking-wide drop-shadow-md group-hover:text-[#FF4D5A] transition-colors">
                  {meta.labelShort}
                </h3>
                <p className="text-[11px] font-extrabold text-[#A7AFB8] drop-shadow">
                  {count}+ Exercises
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
