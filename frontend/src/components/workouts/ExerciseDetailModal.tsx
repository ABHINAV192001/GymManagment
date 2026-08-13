import React from 'react';
import { X, ShieldAlert, CheckCircle2, Layers, Flame, Clock, Activity, Dumbbell } from 'lucide-react';
import { Exercise } from '../../types';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ exercise, onClose }) => {
  if (!exercise) return null;

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
        className="relative w-full max-w-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/90 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
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
