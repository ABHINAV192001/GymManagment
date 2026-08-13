import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, SkipForward, SkipBack, CheckCircle, RotateCcw } from 'lucide-react';

interface WorkoutTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: any[]; // The list of exercises in this routine
}

type TimerState = 'IDLE' | 'WORK' | 'REST' | 'FINISHED';

const WORK_TIME = 30;
const REST_TIME = 10;

export const WorkoutTimerModal: React.FC<WorkoutTimerModalProps> = ({ isOpen, onClose, exercises }) => {
  const [timerState, setTimerState] = useState<TimerState>('IDLE');
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      resetTimer();
    }
  }, [isOpen]);

  useEffect(() => {
    if (timerState === 'IDLE' || timerState === 'FINISHED' || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState, isPaused, currentExIndex]);

  const handleTimerEnd = () => {
    if (timerState === 'WORK') {
      if (currentExIndex >= exercises.length - 1) {
        setTimerState('FINISHED');
      } else {
        setTimerState('REST');
        setTimeLeft(REST_TIME);
      }
    } else if (timerState === 'REST') {
      setTimerState('WORK');
      setCurrentExIndex((prev) => prev + 1);
      setTimeLeft(WORK_TIME);
    }
  };

  const startWorkout = () => {
    setTimerState('WORK');
    setCurrentExIndex(0);
    setTimeLeft(WORK_TIME);
    setIsPaused(false);
  };

  const resetTimer = () => {
    setTimerState('IDLE');
    setCurrentExIndex(0);
    setTimeLeft(WORK_TIME);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const nextExercise = () => {
    if (currentExIndex < exercises.length - 1) {
      setCurrentExIndex(prev => prev + 1);
      setTimerState('WORK');
      setTimeLeft(WORK_TIME);
    } else {
      setTimerState('FINISHED');
    }
  };

  const prevExercise = () => {
    if (currentExIndex > 0) {
      setCurrentExIndex(prev => prev - 1);
      setTimerState('WORK');
      setTimeLeft(WORK_TIME);
    }
  };

  if (!isOpen) return null;

  const currentExercise = exercises[currentExIndex];
  const nextEx = exercises[currentExIndex + 1];

  const totalTime = timerState === 'WORK' ? WORK_TIME : REST_TIME;
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#FFFFFF] dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center">
          {timerState === 'IDLE' && (
            <div className="text-center space-y-6 w-full">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Ready to sweat?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                You have {exercises.length} exercises in this routine. <br />
                30 seconds work, 10 seconds rest.
              </p>
              <button
                onClick={startWorkout}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-6 h-6" fill="currentColor" /> Start Workout
              </button>
            </div>
          )}

          {(timerState === 'WORK' || timerState === 'REST') && (
            <div className="w-full flex flex-col items-center space-y-8">
              <div className="text-center space-y-2">
                <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                  timerState === 'WORK' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {timerState === 'WORK' ? 'Work' : 'Rest'}
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {timerState === 'WORK' ? currentExercise?.name || currentExercise?.exerciseName || currentExercise?.exercise?.name || `Exercise ${currentExIndex + 1}` : 'Take a breather'}
                </h2>
                {timerState === 'REST' && nextEx && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    Up next: {nextEx?.name || nextEx?.exerciseName || nextEx?.exercise?.name || `Exercise ${currentExIndex + 2}`}
                  </p>
                )}
              </div>

              {/* Circular Progress Timer */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="stroke-slate-100 dark:stroke-zinc-800"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className={`${timerState === 'WORK' ? 'stroke-blue-500' : 'stroke-amber-500'} transition-all duration-1000 ease-linear`}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * progressPercent) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-black font-mono text-slate-900 dark:text-white">
                    {timeLeft}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                <button
                  onClick={prevExercise}
                  disabled={currentExIndex === 0}
                  className="p-3 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                >
                  <SkipBack className="w-6 h-6" fill="currentColor" />
                </button>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition shadow-lg shadow-blue-500/30"
                >
                  {isPaused ? <Play className="w-8 h-8" fill="currentColor" /> : <Pause className="w-8 h-8" fill="currentColor" />}
                </button>
                <button
                  onClick={nextExercise}
                  className="p-3 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                >
                  <SkipForward className="w-6 h-6" fill="currentColor" />
                </button>
              </div>
              
              <div className="text-xs font-bold text-slate-400 font-mono tracking-widest">
                {currentExIndex + 1} / {exercises.length}
              </div>
            </div>
          )}

          {timerState === 'FINISHED' && (
            <div className="text-center space-y-6 w-full">
              <div className="mx-auto w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Workout Complete!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Awesome job! You've crushed {exercises.length} exercises.
              </p>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-bold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={resetTimer}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" /> Repeat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
