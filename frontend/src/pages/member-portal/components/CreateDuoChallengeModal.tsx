import React, { useState, useEffect } from 'react';
import {
  Trophy, X, Target, Gift, Zap, AlertCircle, Copy, Plus, Trash2, Users, Calendar, ArrowRight, Share2, Check, ShieldAlert, Award, Sparkles, AlertTriangle, Edit3
} from 'lucide-react';
import { createDuoChallenge, updateDuoChallenge } from '../../../lib/api/duo';
import { ChallengeTask, ChallengeType, DuoChallenge, DuoPartnership } from '../../../types/duo';

interface CreateDuoChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnership?: DuoPartnership;
  editingChallenge?: DuoChallenge | null;
  onSuccess: (challenge: DuoChallenge) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const CreateDuoChallengeModal: React.FC<CreateDuoChallengeModalProps> = ({
  isOpen,
  onClose,
  partnership,
  editingChallenge,
  onSuccess,
}) => {
  const isEditMode = !!editingChallenge;
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [title, setTitle] = useState('Duo Workout Showdown');
  const [challengeType, setChallengeType] = useState<ChallengeType>('POINT_RACE');
  const [targetValue, setTargetValue] = useState(30);
  const [wagerPrize, setWagerPrize] = useState('');
  const [maxMembers, setMaxMembers] = useState(2);
  const [durationDays, setDurationDays] = useState(7);

  // Day Task Builder state
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const [taskNameInput, setTaskNameInput] = useState('');
  const [taskPointsInput, setTaskPointsInput] = useState(2);
  const [tasks, setTasks] = useState<ChallengeTask[]>([]);
  const [isCopyMenuOpen, setIsCopyMenuOpen] = useState(false);
  const [copySuccessMessage, setCopySuccessMessage] = useState<string | null>(null);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdChallenge, setCreatedChallenge] = useState<DuoChallenge | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (editingChallenge) {
      setTitle(editingChallenge.title);
      setChallengeType(editingChallenge.challengeType || 'POINT_RACE');
      setTargetValue(editingChallenge.targetValue || 30);
      setWagerPrize(editingChallenge.wagerPrize || '');
      setMaxMembers(editingChallenge.maxMembers || 2);
      setDurationDays(editingChallenge.durationDays || 7);
      setTasks(editingChallenge.tasks || []);
    } else {
      setTitle('Duo Workout Showdown');
      setTargetValue(30);
      setWagerPrize('');
      setMaxMembers(2);
      setDurationDays(7);
      setTasks([]);
    }
  }, [editingChallenge, isOpen]);

  if (!isOpen) return null;

  const currentDayName = DAYS_OF_WEEK[(selectedDayIndex - 1) % 7];

  // Total points calculation across ALL scheduled tasks
  const totalScheduledPoints = tasks.reduce((sum, t) => sum + (Number(t.points) || 0), 0);
  const isPointsExceeded = totalScheduledPoints > targetValue;

  const handleAddTask = () => {
    if (!taskNameInput.trim()) return;
    const points = Number(taskPointsInput) || 1;

    if (totalScheduledPoints + points > targetValue) {
      setError(`Cannot add task worth ${points} pts. Total scheduled points (${totalScheduledPoints + points} pts) would exceed the Target Point Goal (${targetValue} pts).`);
      return;
    }

    setError(null);
    setCopySuccessMessage(null);
    const newTask: ChallengeTask = {
      dayIndex: selectedDayIndex,
      dayOfWeek: currentDayName,
      taskName: taskNameInput.trim(),
      points: points,
    };
    setTasks([...tasks, newTask]);
    setTaskNameInput('');
    setTaskPointsInput(2);
  };

  const handleRemoveTask = (indexToRemove: number) => {
    setTasks(tasks.filter((_, idx) => idx !== indexToRemove));
    setError(null);
    setCopySuccessMessage(null);
  };

  const handleCopyTasksFromDay = (sourceDayIndex: number) => {
    const sourceTasks = tasks.filter((t) => t.dayIndex === sourceDayIndex);
    if (sourceTasks.length === 0) {
      setError(`Day ${sourceDayIndex} (${DAYS_OF_WEEK[(sourceDayIndex - 1) % 7].substring(0, 3)}) has no tasks to copy. Add tasks to Day ${sourceDayIndex} first.`);
      setIsCopyMenuOpen(false);
      return;
    }

    const sourceTasksPoints = sourceTasks.reduce((sum, t) => sum + (Number(t.points) || 0), 0);
    const currentDayTasksPoints = tasks.filter((t) => t.dayIndex === selectedDayIndex).reduce((sum, t) => sum + (Number(t.points) || 0), 0);
    const netPointChange = sourceTasksPoints - currentDayTasksPoints;

    if (totalScheduledPoints + netPointChange > targetValue) {
      setError(`Copying Day ${sourceDayIndex} tasks (+${sourceTasksPoints} pts) to Day ${selectedDayIndex} would exceed Target Goal (${targetValue} pts). Adjust target goal or task points.`);
      setIsCopyMenuOpen(false);
      return;
    }

    setError(null);
    const otherDayTasks = tasks.filter((t) => t.dayIndex !== selectedDayIndex);
    const clonedTasks = sourceTasks.map((t) => ({
      ...t,
      dayIndex: selectedDayIndex,
      dayOfWeek: currentDayName,
    }));

    setTasks([...otherDayTasks, ...clonedTasks]);
    setIsCopyMenuOpen(false);
    setCopySuccessMessage(`Successfully copied ${sourceTasks.length} task(s) from Day ${sourceDayIndex} to Day ${selectedDayIndex}!`);
    setTimeout(() => setCopySuccessMessage(null), 4000);
  };

  const handleApplyTasksToAllDays = () => {
    const currentDayTasks = tasks.filter((t) => t.dayIndex === selectedDayIndex);
    if (currentDayTasks.length === 0) {
      setError(`Day ${selectedDayIndex} has no tasks to replicate. Add tasks to Day ${selectedDayIndex} first.`);
      setIsCopyMenuOpen(false);
      return;
    }

    const singleDayPoints = currentDayTasks.reduce((sum, t) => sum + (Number(t.points) || 0), 0);
    const totalPotentialPoints = singleDayPoints * durationDays;

    if (totalPotentialPoints > targetValue) {
      setError(`Replicating Day ${selectedDayIndex} tasks (${singleDayPoints} pts/day × ${durationDays} days = ${totalPotentialPoints} pts) exceeds Target Goal (${targetValue} pts).`);
      setIsCopyMenuOpen(false);
      return;
    }

    setError(null);
    let newAllTasks: ChallengeTask[] = [];

    for (let dayNum = 1; dayNum <= durationDays; dayNum++) {
      const dayName = DAYS_OF_WEEK[(dayNum - 1) % 7];
      const clonedForDay = currentDayTasks.map((t) => ({
        ...t,
        dayIndex: dayNum,
        dayOfWeek: dayName,
      }));
      newAllTasks = [...newAllTasks, ...clonedForDay];
    }

    setTasks(newAllTasks);
    setIsCopyMenuOpen(false);
    setCopySuccessMessage(`Successfully replicated Day ${selectedDayIndex} tasks across all ${durationDays} days!`);
    setTimeout(() => setCopySuccessMessage(null), 4000);
  };

  const handleSubmit = async () => {
    if (isPointsExceeded) {
      setError(`Total scheduled task points (${totalScheduledPoints} pts) cannot exceed Target Goal (${targetValue} pts).`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        partnershipId: partnership?.id,
        title: title.trim(),
        challengeType,
        targetValue: Number(targetValue),
        wagerPrize: wagerPrize.trim() || undefined,
        maxMembers,
        durationDays,
        tasks: tasks.length > 0 ? tasks : undefined,
      };

      const challenge = isEditMode && editingChallenge
        ? await updateDuoChallenge(editingChallenge.id, payload)
        : await createDuoChallenge(payload);

      setCreatedChallenge(challenge);
      onSuccess(challenge);
      onClose();
      if (window.location.pathname !== '/duo') {
        window.location.href = '/duo';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save challenge');
    } finally {
      setLoading(false);
    }
  };

  const getInviteUrl = () => {
    if (!createdChallenge?.inviteCode) return '';
    return `${window.location.origin}/duo/join?code=${createdChallenge.inviteCode}`;
  };

  const handleCopyInviteLink = () => {
    const url = getInviteUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-gray-900 text-white rounded-3xl shadow-2xl border border-amber-500/20 overflow-hidden relative">
        
        {/* Glowing Background Accent */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-xl text-white tracking-tight">Custom Duo Challenge Studio</h3>
              <p className="text-xs text-amber-400 font-medium">Step {step} of 4 — Setup tasks, duration & point budget</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (step === 4 && window.location.pathname !== '/duo') {
                window.location.href = '/duo';
              }
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="grid grid-cols-4 bg-gray-950/80 border-b border-gray-800 text-[11px] font-bold text-center relative z-10">
          {[
            { id: 1, label: '1. Setup' },
            { id: 2, label: '2. Duration' },
            { id: 3, label: '3. Tasks & Copy' },
            { id: 4, label: '4. Share' },
          ].map((s) => (
            <div
              key={s.id}
              className={`py-3 transition-all ${
                step === s.id
                  ? 'bg-amber-500 text-white font-black shadow-md'
                  : step > s.id
                  ? 'text-amber-400 bg-amber-950/30'
                  : 'text-gray-500'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-gray-800">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-950/60 border border-red-800/80 text-red-200 rounded-2xl text-xs font-semibold animate-in shake duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {copySuccessMessage && (
            <div className="flex items-center gap-2.5 p-3.5 bg-green-950/60 border border-green-800/80 text-green-200 rounded-2xl text-xs font-bold animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-green-400 shrink-0" />
              <span>{copySuccessMessage}</span>
            </div>
          )}

          {/* STEP 1: Basic Info & Member Limit */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2">
                  Challenge Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 30-Point Gym Showdown"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-700 bg-gray-800/90 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-500" />
                  Allowed Members (2 - 5 Participants)
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMaxMembers(num)}
                      className={`py-3 rounded-2xl border text-xs font-extrabold transition-all flex flex-col items-center gap-1.5 ${
                        maxMembers === num
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/10'
                          : 'border-gray-800 bg-gray-800/40 text-gray-400 hover:border-gray-700 hover:text-white'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>{num} Members</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-500" />
                  Wager Prize / Reward (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1st Place gets Whey Protein / Loser pays dinner"
                  value={wagerPrize}
                  onChange={(e) => setWagerPrize(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-700 bg-gray-800/90 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all placeholder:text-gray-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                  <span>Next: Duration & Goal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Duration & Target Point Goal */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  Select Challenge Duration
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { days: 7, label: '7 Days (Whole Week)' },
                    { days: 30, label: '30 Days (Whole Month)' },
                    { days: 4, label: '4 Days (Mon-Thu)' },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => {
                        setDurationDays(preset.days);
                        if (selectedDayIndex > preset.days) setSelectedDayIndex(1);
                      }}
                      className={`p-3.5 rounded-2xl border text-xs font-extrabold text-center transition-all ${
                        durationDays === preset.days
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-md'
                          : 'border-gray-800 bg-gray-800/40 text-gray-400 hover:border-gray-700 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Explicit Target Point Goal Field */}
              <div className="p-4 bg-gray-800/80 rounded-2xl border border-amber-500/30 space-y-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  Target Point Goal (Win Condition)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-gray-900 border border-amber-500/40 rounded-xl text-amber-300 font-mono font-black text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-bold text-gray-400">PTS NEEDED TO WIN</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  💡 Members must accumulate this total number of points across all challenge days to claim victory.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-400 hover:text-white rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                  <span>Next: Day Tasks & Copy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Task Scheduler, Points Meter & Copy-Day Tool */}
          {step === 3 && (
            <div className="space-y-4">
              
              {/* LIVE POINTS BUDGET METER */}
              <div className={`p-4 rounded-2xl border transition-all ${isPointsExceeded ? 'bg-red-950/60 border-red-800' : 'bg-gray-800/80 border-amber-500/30'}`}>
                <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Scheduled Task Points Meter
                  </span>
                  <span className={`font-mono text-sm ${isPointsExceeded ? 'text-red-400 font-black' : 'text-amber-300 font-bold'}`}>
                    {totalScheduledPoints} / {targetValue} PTS
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden p-0.5 border border-gray-700">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isPointsExceeded
                        ? 'bg-red-500'
                        : totalScheduledPoints === targetValue
                        ? 'bg-green-500'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((totalScheduledPoints / targetValue) * 100))}%` }}
                  />
                </div>

                {isPointsExceeded ? (
                  <p className="text-[11px] text-red-400 font-bold mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Warning: Scheduled points ({totalScheduledPoints} pts) exceed Target Goal ({targetValue} pts). Adjust points or target.
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    Remaining point budget: <b className="text-amber-300">{Math.max(0, targetValue - totalScheduledPoints)} pts</b> available to assign across tasks.
                  </p>
                )}
              </div>

              {/* Day Selector Tabs (Full Scrollable Days) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800">
                {Array.from({ length: durationDays }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dayName = DAYS_OF_WEEK[idx % 7];
                  const dayTasks = tasks.filter((t) => t.dayIndex === dayNum);
                  const dayPoints = dayTasks.reduce((sum, t) => sum + (Number(t.points) || 0), 0);
                  const isSelected = selectedDayIndex === dayNum;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setSelectedDayIndex(dayNum)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span>Day {dayNum} ({dayName.substring(0, 3)})</span>
                      {dayTasks.length > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-white/30 text-white' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                          {dayPoints} pts
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Task Input Form for Selected Day */}
              <div className="p-4 bg-gray-800/60 rounded-2xl border border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                    Tasks for {currentDayName} (Day {selectedDayIndex})
                  </h4>

                  {/* Copy Tasks Dropdown Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCopyMenuOpen(!isCopyMenuOpen)}
                      className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] rounded-lg flex items-center gap-1.5 border border-amber-500/30 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Tasks...</span>
                    </button>

                    {isCopyMenuOpen && (
                      <div className="absolute right-0 top-8 z-30 w-56 bg-gray-900 rounded-2xl shadow-2xl border border-amber-500/40 p-2 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                        {/* Option A: Replicate to All Days */}
                        <button
                          type="button"
                          onClick={handleApplyTasksToAllDays}
                          className="w-full text-left px-2.5 py-2 text-xs font-extrabold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-xl flex items-center gap-1.5 transition-colors border border-amber-500/30"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Replicate Day {selectedDayIndex} To All Days</span>
                        </button>

                        <div className="border-t border-gray-800 my-1" />
                        <p className="text-[10px] font-bold text-gray-400 px-2 uppercase">Copy From Another Day:</p>

                        {Array.from({ length: durationDays })
                          .map((_, idx) => idx + 1)
                          .filter((d) => d !== selectedDayIndex)
                          .map((d) => {
                            const count = tasks.filter((t) => t.dayIndex === d).length;
                            const pts = tasks.filter((t) => t.dayIndex === d).reduce((sum, t) => sum + (Number(t.points) || 0), 0);
                            return (
                              <button
                                key={d}
                                type="button"
                                onClick={() => handleCopyTasksFromDay(d)}
                                className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-gray-200 hover:bg-gray-800 hover:text-white rounded-lg flex justify-between items-center transition-colors"
                              >
                                <span>Day {d} ({DAYS_OF_WEEK[(d - 1) % 7].substring(0, 3)})</span>
                                <span className={`text-[10px] font-mono font-bold ${count > 0 ? 'text-amber-400' : 'text-gray-500'}`}>
                                  {count > 0 ? `${pts} pts (${count} tasks)` : 'Empty'}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Explicit Inputs for Task Description and Points */}
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-7">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Task Description
                    </label>
                    <input
                      type="text"
                      value={taskNameInput}
                      onChange={(e) => setTaskNameInput(e.target.value)}
                      placeholder="e.g. 50 Pushups / 20m Cardio"
                      className="w-full px-3 py-2 rounded-xl border border-gray-700 bg-gray-900 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                      Points Awarded
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={taskPointsInput}
                      onChange={(e) => setTaskPointsInput(parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-2 rounded-xl border border-gray-700 bg-gray-900 text-xs font-bold text-center text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={handleAddTask}
                      disabled={!taskNameInput.trim() || isPointsExceeded}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Scheduled Task Items List for Selected Day */}
                <div className="space-y-1.5 pt-1">
                  {tasks
                    .filter((t) => t.dayIndex === selectedDayIndex)
                    .map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-gray-900 rounded-xl border border-gray-800 text-xs font-semibold"
                      >
                        <span className="text-gray-200">{t.taskName}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800/80 font-bold rounded-lg text-[10px]">
                            +{t.points} pts
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTask(tasks.indexOf(t))}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  {tasks.filter((t) => t.dayIndex === selectedDayIndex).length === 0 && (
                    <p className="text-[11px] text-gray-500 text-center py-2 italic">
                      No tasks scheduled for Day {selectedDayIndex} yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 text-xs font-bold text-gray-400 hover:text-white rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || isPointsExceeded}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Launching Challenge...' : 'Launch Challenge 🏆'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success & Share Invite Link */}
          {step === 4 && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/30 animate-bounce">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-extrabold text-white">Challenge Created Successfully! 🔥</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Target: <b>{targetValue} Points</b> — Invite up to <b>{maxMembers - 1} gym partners</b> to join!
                </p>
              </div>

              {/* Share Box */}
              <div className="p-4 bg-gray-800/80 rounded-2xl border border-amber-500/30 text-left space-y-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                  Challenge Invite Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getInviteUrl()}
                    className="flex-1 px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs font-mono font-bold text-amber-300"
                  />
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (window.location.pathname !== '/duo') {
                    window.location.href = '/duo';
                  }
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Go to Duo Challenge Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
