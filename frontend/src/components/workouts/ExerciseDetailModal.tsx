import React from 'react';
import { X, ShieldAlert, CheckCircle2, Dumbbell, Zap, Clock, Layers, Flame } from 'lucide-react';
import { Exercise } from '../../types';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ exercise, onClose }) => {
  if (!exercise) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-100 dark:bg-zinc-900/50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {exercise.muscleGroup}
              </span>
              {exercise.equipment && (
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {exercise.equipment}
                </span>
              )}
              {exercise.difficultyLevel && (
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                    exercise.difficultyLevel === 'PRO'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : exercise.difficultyLevel === 'INTERMEDIATE'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {exercise.difficultyLevel}
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-zinc-50">{exercise.name}</h2>
            {exercise.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{exercise.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-400" /> Target Volume
              </span>
              <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                {exercise.recommendedSets ? `${exercise.recommendedSets} Sets` : '4 Sets'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Recommended Reps
              </span>
              <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                {exercise.recommendedReps ? exercise.recommendedReps : '8-12 Reps'}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Rest Interval
              </span>
              <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                {exercise.restInterval ? exercise.restInterval : '90s Rest'}
              </span>
            </div>
          </div>

          {/* Secondary Muscles */}
          {exercise.secondaryMuscles && (
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Secondary Assisting Muscles
              </span>
              <p className="text-xs text-blue-300 font-medium">{exercise.secondaryMuscles}</p>
            </div>
          )}

          {/* Step by Step Execution Instructions */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-300 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> Step-by-Step Form & Technique Guide
            </h3>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 whitespace-pre-line font-sans space-y-2">
              {exercise.executionSteps ||
                '1. Position body carefully aligning joints with resistance vector.\n2. Inhale and brace core prior to initiation.\n3. Execute movement under full muscular control with peak contraction.'}
            </div>
          </div>

          {/* Pro Safety Cues & Injury Prevention */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Injury Prevention & Safety Form Cues
            </h3>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 whitespace-pre-line font-sans">
              {exercise.safetyTips ||
                'Maintain neutral spine alignment throughout repetition range. Avoid excessive momentum or swinging.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-100 dark:bg-zinc-900/60 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            GymOS Pro Hypertrophy Protocol
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
          >
            Got It, Let's Lift!
          </button>
        </div>
      </div>
    </div>
  );
};
