import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2, Layers, Flame, Clock, Dumbbell, Image as ImageIcon, RefreshCw, Zap, Loader2 } from 'lucide-react';
import { Exercise } from '../../types';
import { getExerciseById } from '../../lib/api/workouts';
import driveMappingData from '../../config/exercise_drive_mapping.json';

const driveMapping = driveMappingData as Record<string, { "0"?: string; "1"?: string }>;

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

const MUSCLE_KEYFRAME_COLLECTIONS: Record<string, { start: string[]; peak: string[] }> = {
  CHEST: {
    start: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    ],
    peak: [
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
    ],
  },
  BACK: {
    start: [
      'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=800&q=80',
    ],
    peak: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    ],
  },
  LEGS: {
    start: [
      'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    ],
    peak: [
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    ],
  },
  SHOULDERS: {
    start: [
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    ],
    peak: [
      'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    ],
  },
  ABS: {
    start: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    ],
    peak: [
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    ],
  },
  ARMS: {
    start: [
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=800&q=80',
    ],
    peak: [
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80',
    ],
  },
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getExerciseUniqueImage(exerciseName: string, muscleGroup: string, keyframeIndex: number): string {
  const mg = (muscleGroup || '').toUpperCase();
  let collectionKey = 'CHEST';
  if (mg.includes('BACK') || mg.includes('LAT') || mg.includes('RHOMBOID')) collectionKey = 'BACK';
  else if (mg.includes('LEG') || mg.includes('QUAD') || mg.includes('GLUTE') || mg.includes('HAMSTRING') || mg.includes('CALF')) collectionKey = 'LEGS';
  else if (mg.includes('SHOULDER') || mg.includes('DELT') || mg.includes('TRAP')) collectionKey = 'SHOULDERS';
  else if (mg.includes('AB') || mg.includes('CORE') || mg.includes('OBLIQUE')) collectionKey = 'ABS';
  else if (mg.includes('ARM') || mg.includes('BICEP') || mg.includes('TRICEP') || mg.includes('FOREARM')) collectionKey = 'ARMS';

  const collection = MUSCLE_KEYFRAME_COLLECTIONS[collectionKey] || MUSCLE_KEYFRAME_COLLECTIONS.CHEST;
  const list = keyframeIndex === 0 ? collection.start : collection.peak;
  
  const hash = hashString(`${exerciseName}_frame_${keyframeIndex}`);
  const index = hash % list.length;
  return list[index];
}

function getExerciseSvgFallback(name: string, muscleGroup: string, frame: 0 | 1): string {
  const frameTitle = frame === 0 ? "01. START POSITION" : "02. PEAK CONTRACTION";
  const frameColor = frame === 0 ? "%233b82f6" : "%23f59e0b";
  const pulseScale = frame === 0 ? "1.0" : "1.15";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23090d16"/><stop offset="50%" stop-color="%23111827"/><stop offset="100%" stop-color="%23030712"/></linearGradient><radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${frameColor}" stop-opacity="0.3"/><stop offset="100%" stop-color="${frameColor}" stop-opacity="0"/></radialGradient></defs><rect width="600" height="400" fill="url(%23bg)"/><circle cx="300" cy="170" r="140" fill="url(%23glow)"/><rect x="20" y="20" width="560" height="360" rx="16" fill="none" stroke="${frameColor}" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="8 6"/><g transform="translate(300, 160) scale(${pulseScale})"><circle cx="0" cy="-55" r="18" fill="%23e2e8f0" stroke="${frameColor}" stroke-width="3"/><line x1="0" y1="-37" x2="0" y2="35" stroke="%23f8fafc" stroke-width="8" stroke-linecap="round"/>${frame === 0 ? `<path d="M-45 10 L-25 -25 L0 -25 L25 -25 L45 10" fill="none" stroke="${frameColor}" stroke-width="6" stroke-linecap="round"/>` : `<path d="M-30 -45 L-15 -25 L0 -25 L15 -25 L30 -45" fill="none" stroke="${frameColor}" stroke-width="7" stroke-linecap="round"/>`}<path d="M-25 80 L-12 35 L0 35 L12 35 L25 80" fill="none" stroke="%2394a3b8" stroke-width="6" stroke-linecap="round"/></g><text x="300" y="295" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="%23ffffff" text-anchor="middle" letter-spacing="1">${name.toUpperCase()}</text><text x="300" y="320" font-family="system-ui, sans-serif" font-weight="700" font-size="12" fill="${frameColor}" text-anchor="middle" letter-spacing="2">TARGET: ${muscleGroup.toUpperCase()} • ${frameTitle}</text><text x="300" y="350" font-family="system-ui, sans-serif" font-weight="500" font-size="11" fill="%2364748b" text-anchor="middle">GymOS AI Motion Visualizer</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ exercise: initialExercise, onClose }) => {
  const [activeTab, setActiveTab] = useState<'loop' | 'both' | 'start' | 'peak'>('loop');
  const [loopFrame, setLoopFrame] = useState<0 | 1>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMs, setSpeedMs] = useState<number>(1000); // 1 sec loop default
  const [stepOneFailed, setStepOneFailed] = useState(false);
  const [stepTwoFailed, setStepTwoFailed] = useState(false);

  const [fullExercise, setFullExercise] = useState<Exercise | null>(initialExercise);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Load detailed exercise info from GET /api/exercises/{id} when modal opens
  useEffect(() => {
    setFullExercise(initialExercise);
    setStepOneFailed(false);
    setStepTwoFailed(false);
    setLoopFrame(0);

    if (initialExercise?.id) {
      setLoadingDetail(true);
      getExerciseById(initialExercise.id)
        .then((data) => {
          if (data) setFullExercise(data);
        })
        .finally(() => setLoadingDetail(false));
    }
  }, [initialExercise]);

  // 1-second interval loop timer (0 -> 1 -> 0 -> 1)
  useEffect(() => {
    if (!isPlaying || activeTab !== 'loop') return;

    const interval = setInterval(() => {
      setLoopFrame((prevFrame) => (prevFrame === 0 ? 1 : 0));
    }, speedMs);

    return () => clearInterval(interval);
  }, [isPlaying, activeTab, speedMs]);

  if (!initialExercise) return null;
  const exercise = fullExercise || initialExercise;

  const cdnBase = (import.meta.env.VITE_EXERCISE_CDN_BASE_URL || '').replace(/\/$/, '');

  // Look up direct Google Drive CDN URL mapping
  const nameKeys = [
    exercise.name,
    exercise.name.toLowerCase(),
    exercise.name.replace(/\s+/g, '_'),
    exercise.name.replace(/\s+/g, '_').toLowerCase(),
    exercise.name.replace(/\s+/g, '-'),
    exercise.name.replace(/\s+/g, '-').toLowerCase(),
    exercise.name.replace(/[^a-zA-Z0-9_-]/g, '_'),
    exercise.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase(),
    exercise.name.replace(/[^a-zA-Z0-9]/g, '_'),
    exercise.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
  ];

  let mapped: { "0"?: string; "1"?: string } | undefined;
  for (const k of nameKeys) {
    if (driveMapping[k]) {
      mapped = driveMapping[k];
      break;
    }
  }

  const svgFallbackOne = getExerciseSvgFallback(exercise.name, exercise.muscleGroup, 0);
  const svgFallbackTwo = getExerciseSvgFallback(exercise.name, exercise.muscleGroup, 1);

  const fallbackOne = getExerciseUniqueImage(exercise.name, exercise.muscleGroup, 0) || svgFallbackOne;
  const fallbackTwo = getExerciseUniqueImage(exercise.name, exercise.muscleGroup, 1) || svgFallbackTwo;

  const stepOneUrl = stepOneFailed 
    ? svgFallbackOne 
    : (mapped?.["0"] || (exercise.stepOneImage ? (exercise.stepOneImage.startsWith('http') ? exercise.stepOneImage : `${cdnBase}${exercise.stepOneImage}`) : fallbackOne));

  const stepTwoUrl = stepTwoFailed 
    ? svgFallbackTwo 
    : (mapped?.["1"] || (exercise.stepTwoImage ? (exercise.stepTwoImage.startsWith('http') ? exercise.stepTwoImage : `${cdnBase}${exercise.stepTwoImage}`) : fallbackTwo));

  // Format execution steps into an array if string has numbers or newlines
  const rawSteps = exercise.executionSteps || 
    '1. Position body carefully aligning joints with resistance vector.\n2. Inhale and brace core prior to initiation.\n3. Execute movement under full muscular control with peak contraction.';

  const stepsList = rawSteps
    .split('\n')
    .map(step => step.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(Boolean);

  const secondaryMusclesList = exercise.secondaryMuscles
    ? exercise.secondaryMuscles.split(',').map(m => m.trim()).filter(Boolean)
    : [];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-zinc-900/50 flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            {/* Tag Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 tracking-wider">
                {exercise.muscleGroup}
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-200/70 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300/50 dark:border-zinc-700/50">
                {exercise.equipment || 'Bodyweight'}
              </span>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${
                  (exercise.difficultyLevel || 'INTERMEDIATE') === 'PRO'
                    ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/60'
                    : (exercise.difficultyLevel || 'INTERMEDIATE') === 'INTERMEDIATE'
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                    : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                }`}
              >
                {exercise.difficultyLevel || 'INTERMEDIATE'}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-black text-slate-900 dark:text-zinc-50 truncate leading-snug">
              {exercise.name}
            </h2>

            {/* Description */}
            {exercise.description && (
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {exercise.description}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0 shadow-xs"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs leading-relaxed">
          {/* 1-Sec Keyframe Loop Player Section */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-inner border border-slate-800">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" /> Rep Motion Keyframes (0 → 1 → 0 Loop)
              </span>

              {/* View Mode Tabs */}
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  onClick={() => { setActiveTab('loop'); setIsPlaying(true); }}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${activeTab === 'loop' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  <RefreshCw className={`w-3 h-3 ${isPlaying && activeTab === 'loop' ? 'animate-spin' : ''}`} /> 1s Loop
                </button>
                <button
                  onClick={() => setActiveTab('both')}
                  className={`px-2.5 py-1 rounded-md transition-all ${activeTab === 'both' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setActiveTab('start')}
                  className={`px-2.5 py-1 rounded-md transition-all ${activeTab === 'start' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  01. Start
                </button>
                <button
                  onClick={() => setActiveTab('peak')}
                  className={`px-2.5 py-1 rounded-md transition-all ${activeTab === 'peak' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                >
                  02. Peak
                </button>
              </div>
            </div>

            {/* Loop Player (Mode: 'loop') */}
            {activeTab === 'loop' && (
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[220px] group">
                {/* 1-Sec Alternating Keyframe Image */}
                {loopFrame === 0 ? (
                  <div className="w-full h-72 bg-black/90 flex items-center justify-center p-2 rounded-xl">
                    <img
                      key="frame-0"
                      src={stepOneUrl}
                      referrerPolicy="no-referrer"
                      alt={`${exercise.name} - 01. Start Position`}
                      onError={(e) => {
                        if (!stepOneFailed) {
                          setStepOneFailed(true);
                          (e.target as HTMLImageElement).src = svgFallbackOne;
                        }
                      }}
                      className="max-w-full max-h-full object-contain mx-auto transition-opacity duration-300 shadow-md rounded"
                    />
                  </div>
                ) : (
                  <div className="w-full h-72 bg-black/90 flex items-center justify-center p-2 rounded-xl">
                    <img
                      key="frame-1"
                      src={stepTwoUrl}
                      referrerPolicy="no-referrer"
                      alt={`${exercise.name} - 02. Peak Contraction`}
                      onError={(e) => {
                        if (!stepTwoFailed) {
                          setStepTwoFailed(true);
                          (e.target as HTMLImageElement).src = svgFallbackTwo;
                        }
                      }}
                      className="max-w-full max-h-full object-contain mx-auto transition-opacity duration-300 shadow-md rounded"
                    />
                  </div>
                )}

                {/* Top Badge Overlay */}
                <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/80 text-[10px] font-black uppercase flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${loopFrame === 0 ? 'bg-blue-400 animate-ping' : 'bg-amber-400 animate-ping'}`} />
                  <span className={loopFrame === 0 ? 'text-blue-400' : 'text-amber-400'}>
                    {loopFrame === 0 ? '01. START POSITION (0.jpg)' : '02. PEAK CONTRACTION (1.jpg)'}
                  </span>
                </div>
              </div>
            )}

            {/* Static / Side-by-Side Displays */}
            {activeTab !== 'loop' && (
              <div className={`grid ${activeTab === 'both' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                {/* Start Position (0.jpg) */}
                {(activeTab === 'both' || activeTab === 'start') && (
                  <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[180px] group">
                    <div className="w-full h-52 bg-black/90 flex items-center justify-center p-2">
                      <img
                        src={stepOneUrl}
                        referrerPolicy="no-referrer"
                        alt={`${exercise.name} - Start Position`}
                        onError={(e) => {
                          if (!stepOneFailed) {
                            setStepOneFailed(true);
                            (e.target as HTMLImageElement).src = svgFallbackOne;
                          }
                        }}
                        className="max-w-full max-h-full object-contain mx-auto transition-transform duration-300 rounded"
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700/80 text-[10px] font-extrabold text-blue-400 tracking-wider uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> 01. Start Position
                    </div>
                  </div>
                )}

                {/* Peak Contraction (1.jpg) */}
                {(activeTab === 'both' || activeTab === 'peak') && (
                  <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[180px] group">
                    <div className="w-full h-52 bg-black/90 flex items-center justify-center p-2">
                      <img
                        src={stepTwoUrl}
                        referrerPolicy="no-referrer"
                        alt={`${exercise.name} - Peak Contraction`}
                        onError={(e) => {
                          if (!stepTwoFailed) {
                            setStepTwoFailed(true);
                            (e.target as HTMLImageElement).src = svgFallbackTwo;
                          }
                        }}
                        className="max-w-full max-h-full object-contain mx-auto transition-transform duration-300 rounded"
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700/80 text-[10px] font-extrabold text-amber-400 tracking-wider uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> 02. Peak Contraction
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Target Volume
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
                {exercise.recommendedSets ? `${exercise.recommendedSets} Sets` : '4 Sets'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Recommended Reps
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
                {exercise.recommendedReps ? exercise.recommendedReps : '8-12'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Rest Interval
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
                {exercise.restInterval ? exercise.restInterval : '90s'}
              </span>
            </div>
          </div>

          {/* Secondary Assisting Muscles */}
          {secondaryMusclesList.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                Secondary Assisting Muscles
              </span>
              <div className="flex flex-wrap gap-1.5">
                {secondaryMusclesList.map((muscle, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/50"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Technique Guide */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-zinc-300 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Step-by-Step Form & Technique Guide
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 space-y-2.5">
              {stepsList.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-slate-700 dark:text-zinc-300 text-xs">
                  <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-snug pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Injury Prevention & Safety Form Cues (High Contrast) */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-extrabold uppercase text-amber-700 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-500" /> Injury Prevention & Safety Form Cues
            </h3>
            <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs leading-relaxed font-medium">
              {exercise.safetyTips ||
                'Maintain neutral spine alignment throughout repetition range. Avoid excessive momentum or swinging.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-zinc-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
            GymOS Pro Hypertrophy Protocol
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
          >
            Got It, Let's Lift!
          </button>
        </div>
      </div>
    </div>
  );
};

