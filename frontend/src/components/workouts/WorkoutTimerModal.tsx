import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, SkipForward, SkipBack, CheckCircle, RotateCcw, ShieldAlert, CheckCircle2, Info, ChevronRight, ChevronLeft, Layers, Flame } from 'lucide-react';

interface WorkoutTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: any[]; // The list of exercises in this routine, now with fullExercise injected
}

type TimerState = 'IDLE' | 'PREP' | 'WORK' | 'REST' | 'FINISHED';

const WORK_TIME = 30; // default work time
const REST_TIME = 10; // default rest time

export const WorkoutTimerModal: React.FC<WorkoutTimerModalProps> = ({ isOpen, onClose, exercises }) => {
  const [timerState, setTimerState] = useState<TimerState>('IDLE');
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
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
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState, isPaused, currentExIndex, currentSet]);

  const currentExercise = exercises[currentExIndex] || {};
  const fullExercise = currentExercise.fullExercise || {};
  
  const totalSets = parseInt(String(fullExercise.recommendedSets || currentExercise.sets || 4), 10) || 4;
  const workDuration = parseInt(String(fullExercise.workDuration || WORK_TIME), 10) || WORK_TIME;
  const restDuration = parseInt(String(fullExercise.restInterval || REST_TIME), 10) || REST_TIME;

  useEffect(() => {
    if (timeLeft === 0) {
      if (timerState === 'PREP') {
        setTimerState('WORK');
        setTimeLeft(workDuration);
      } else if (timerState === 'WORK') {
        if (currentSet < totalSets) {
          setTimerState('REST');
          setCurrentSet(prev => prev + 1); // Increment early so REST shows next set info
          setTimeLeft(restDuration);
        } else {
          if (currentExIndex >= exercises.length - 1) {
            setTimerState('FINISHED');
          } else {
            setTimerState('REST');
            setCurrentExIndex(prev => prev + 1); // Increment early so REST shows next exercise info
            setCurrentSet(1);
            setTimeLeft(restDuration);
          }
        }
      } else if (timerState === 'REST') {
        setTimerState('WORK');
        setTimeLeft(workDuration);
      }
    }
  }, [timeLeft, timerState, currentSet, totalSets, currentExIndex, exercises.length, workDuration, restDuration]);

  const startWorkout = () => {
    setTimerState('PREP');
    setCurrentExIndex(0);
    setCurrentSet(1);
    setTimeLeft(10); // 10 seconds to study
    setIsPaused(false);
  };

  const resetTimer = () => {
    setTimerState('IDLE');
    setCurrentExIndex(0);
    setCurrentSet(1);
    setTimeLeft(WORK_TIME);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const nextExercise = () => {
    if (currentExIndex < exercises.length - 1) {
      setCurrentExIndex(prev => prev + 1);
      setCurrentSet(1);
      setTimerState('WORK');
      const nextWorkDur = exercises[currentExIndex + 1]?.fullExercise?.workDuration || WORK_TIME;
      setTimeLeft(nextWorkDur);
    } else {
      setTimerState('FINISHED');
    }
  };

  const prevExercise = () => {
    if (currentExIndex > 0) {
      setCurrentExIndex(prev => prev - 1);
      setCurrentSet(1);
      setTimerState('WORK');
      const prevWorkDur = exercises[currentExIndex - 1]?.fullExercise?.workDuration || WORK_TIME;
      setTimeLeft(prevWorkDur);
    }
  };

  if (!isOpen) return null;

  const nextEx = exercises[currentExIndex + 1];
  const prevEx = exercises[currentExIndex - 1];

  const totalTime = timerState === 'PREP' ? 10 : (timerState === 'WORK' ? workDuration : restDuration);
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  const rawSteps = fullExercise.executionSteps || 
    '1. Position body carefully aligning joints with resistance vector.\n2. Inhale and brace core prior to initiation.\n3. Execute movement under full muscular control with peak contraction.';
  const stepsList = rawSteps
    .split('\n')
    .map((step: string) => step.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(Boolean);

  const setsLeft = totalSets - currentSet;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] dark:bg-[#0B0D0F] border border-[#DDE1E6] dark:border-[#292E34] w-full max-w-5xl max-h-[95vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#DDE1E6] dark:border-[#292E34] bg-white dark:bg-[#14171A]">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-600" fill="currentColor" /> Routine execution mode
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {timerState === 'IDLE' && (
            <div className="p-8 flex flex-col items-center justify-center h-full space-y-6 w-full min-h-[50vh]">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-wider text-center">Ready to sweat?</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg text-center max-w-lg">
                You have {exercises.length} exercises in this routine. <br />
                We'll guide you through each set with form cues and rest timers.
              </p>
              <button
                onClick={startWorkout}
                className="px-10 py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xl transition-colors flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30"
              >
                <Play className="w-8 h-8" fill="currentColor" /> Start Workout
              </button>
            </div>
          )}

          {(timerState === 'WORK' || timerState === 'REST' || timerState === 'PREP') && (
            <div className="flex flex-col lg:flex-row h-full">
              {/* Left Side - Timer */}
              <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col items-center justify-center bg-white dark:bg-[#14171A] border-r border-[#DDE1E6] dark:border-[#292E34]">
                <div className="text-center space-y-3 mb-8 w-full">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block ${
                    timerState === 'WORK' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                      : timerState === 'PREP'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  }`}>
                    {timerState === 'WORK' ? 'WORK PHASE' : timerState === 'PREP' ? 'GET READY' : 'REST PHASE'}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                    {fullExercise.name || currentExercise?.name || `Exercise ${currentExIndex + 1}`}
                  </h2>
                  <div className="flex items-center justify-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mt-2">
                    <span className="flex items-center gap-1"><Layers className="w-4 h-4 text-blue-500" /> Set {currentSet} of {totalSets}</span>
                  </div>
                </div>

                {/* Circular Progress Timer */}
                <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center mb-8">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className="stroke-slate-100 dark:stroke-zinc-800/80"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      className={`${timerState === 'WORK' ? 'stroke-emerald-500' : timerState === 'PREP' ? 'stroke-blue-500' : 'stroke-amber-500'} transition-all duration-1000 ease-linear`}
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * progressPercent) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl md:text-7xl font-black font-mono text-slate-900 dark:text-white">
                      {timeLeft}
                    </span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">
                      Seconds
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 w-full justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={prevExercise}
                      disabled={currentExIndex === 0}
                      className="p-4 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                      title={prevEx ? `Prev: ${prevEx.name || prevEx.fullExercise?.name}` : ''}
                    >
                      <SkipBack className="w-6 h-6" fill="currentColor" />
                    </button>
                    {prevEx && <span className="text-[10px] text-slate-400 font-bold max-w-[80px] truncate text-center">Prev</span>}
                  </div>
                  
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="p-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition shadow-xl shadow-blue-500/40 transform active:scale-95"
                  >
                    {isPaused ? <Play className="w-10 h-10 ml-1" fill="currentColor" /> : <Pause className="w-10 h-10" fill="currentColor" />}
                  </button>

                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={nextExercise}
                      disabled={currentExIndex >= exercises.length - 1}
                      className="p-4 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                      title={nextEx ? `Next: ${nextEx.name || nextEx.fullExercise?.name}` : ''}
                    >
                      <SkipForward className="w-6 h-6" fill="currentColor" />
                    </button>
                    {nextEx && <span className="text-[10px] text-slate-400 font-bold max-w-[80px] truncate text-center">Next</span>}
                  </div>
                </div>
                
                <div className="mt-8 text-xs font-bold text-slate-400 font-mono tracking-widest bg-slate-100 dark:bg-zinc-800/50 px-4 py-2 rounded-full">
                  Exercise {currentExIndex + 1} of {exercises.length}
                </div>
              </div>

              {/* Right Side - Details */}
              <div className="w-full lg:w-1/2 p-6 lg:p-8 overflow-y-auto space-y-6">
                
                {/* Status Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34]">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Reps</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{fullExercise.recommendedReps || '8-12'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34]">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Sets Left</span>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 font-mono">{setsLeft}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34]">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Target</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white truncate block">{fullExercise.muscleGroup || 'Full Body'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34]">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Level</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 truncate block">{fullExercise.difficultyLevel || 'Intermediate'}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-500" /> Description
                  </h3>
                  <div className="p-4 rounded-xl bg-white dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34]">
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {fullExercise.description || 'Focus on the mind-muscle connection and maintain strict form throughout.'}
                    </p>
                  </div>
                </div>

                {/* Execution Steps */}
                <div className="space-y-2">
                  <h3 className="text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> How to perform it
                  </h3>
                  <div className="p-4 rounded-xl bg-white dark:bg-[#14171A] border border-[#DDE1E6] dark:border-[#292E34] space-y-3">
                    {stepsList.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-xs">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety & Injury Risks */}
                <div className="space-y-2">
                  <h3 className="text-[11px] font-extrabold uppercase text-amber-700 dark:text-amber-500 tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" /> Injury Risks & Safety Guidance
                  </h3>
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
                    <p className="text-xs text-amber-900 dark:text-amber-200/80 leading-relaxed font-medium">
                      {fullExercise.safetyTips || 'Maintain neutral spine alignment throughout repetition range. Avoid excessive momentum or swinging.'}
                    </p>
                  </div>
                </div>

                {/* Next Exercise Preview */}
                {nextEx && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
                    <h3 className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Up Next</h3>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-zinc-800/50">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">{nextEx.name || nextEx.fullExercise?.name || `Exercise ${currentExIndex + 2}`}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">{nextEx.fullExercise?.muscleGroup || 'Next target'}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {timerState === 'FINISHED' && (
            <div className="p-8 flex flex-col items-center justify-center h-full space-y-6 w-full min-h-[50vh]">
              <div className="mx-auto w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 border-4 border-emerald-50 dark:border-emerald-900/10">
                <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-wider text-center">Workout Complete!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg text-center max-w-lg">
                Awesome job! You've crushed {exercises.length} exercises. Time to refuel and recover.
              </p>
              <div className="flex gap-4 pt-4 w-full max-w-sm">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-black text-sm transition-colors"
                >
                  Finish
                </button>
                <button
                  onClick={resetTimer}
                  className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
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
