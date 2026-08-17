import React, { useState, useMemo } from 'react';
import {
  Droplets,
  X,
  Plus,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';

export interface WaterLogEntry {
  id: string;
  amountLiters: number;
  time: string;
  type: 'bottle' | 'glass';
  label: string;
}

interface HydrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWaterLiters: number;
  targetWaterLiters: number;
  waterLogs: WaterLogEntry[];
  onSaveWaterLog: (totalLiters: number, bottles: number, glasses: number) => Promise<void>;
  onResetWaterLogs: () => void;
  isSaving?: boolean;
}

export const HydrationModal: React.FC<HydrationModalProps> = ({
  isOpen,
  onClose,
  currentWaterLiters,
  targetWaterLiters,
  waterLogs,
  onSaveWaterLog,
  onResetWaterLogs,
  isSaving = false
}) => {
  const [draftBottles, setDraftBottles] = useState<number>(0);
  const [draftGlasses, setDraftGlasses] = useState<number>(0);

  // Initialize or reset draft when modal opens
  React.useEffect(() => {
    if (isOpen) {
      // Calculate current bottles and glasses from currentWaterLiters
      const fullBottles = Math.min(4, Math.floor(currentWaterLiters / 1.0));
      const remainingMl = Math.round((currentWaterLiters % 1.0) * 1000);
      const glasses = Math.min(5, Math.round(remainingMl / 250));
      setDraftBottles(fullBottles);
      setDraftGlasses(glasses);
    }
  }, [isOpen, currentWaterLiters]);

  const targetLiters = targetWaterLiters || 3.5;
  const draftLiters = useMemo(() => {
    return parseFloat(((draftBottles * 1.0) + (draftGlasses * 0.25)).toFixed(2));
  }, [draftBottles, draftGlasses]);

  const percentAchieved = useMemo(() => {
    return Math.min(100, Math.round((draftLiters / targetLiters) * 100));
  }, [draftLiters, targetLiters]);

  const remainingLiters = useMemo(() => {
    return Math.max(0, parseFloat((targetLiters - draftLiters).toFixed(2)));
  }, [draftLiters, targetLiters]);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  if (!isOpen) return null;

  // Toggle or set bottle levels
  const toggleBottle = (bottleIndex: number) => {
    if (draftBottles === bottleIndex) {
      setDraftBottles(bottleIndex - 1);
    } else {
      setDraftBottles(bottleIndex);
    }
  };

  // Toggle or set glass levels
  const toggleGlass = (glassIndex: number) => {
    if (draftGlasses === glassIndex) {
      setDraftGlasses(glassIndex - 1);
    } else {
      setDraftGlasses(glassIndex);
    }
  };

  // Quick Preset Adders
  const addPreset = (liters: number) => {
    const newTotal = draftLiters + liters;
    const newBottles = Math.min(4, Math.floor(newTotal / 1.0));
    const remMl = Math.round((newTotal - newBottles) * 1000);
    const newGlasses = Math.min(5, Math.round(remMl / 250));
    setDraftBottles(newBottles);
    setDraftGlasses(newGlasses);
  };

  const handleSave = async () => {
    await onSaveWaterLog(draftLiters, draftBottles, draftGlasses);
  };

  const getStatusBadge = () => {
    if (percentAchieved >= 100) {
      return {
        text: '🏆 Goal Achieved!',
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
      };
    }
    if (percentAchieved >= 75) {
      return {
        text: '💧 Optimal Hydration',
        bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
      };
    }
    if (percentAchieved >= 50) {
      return {
        text: '⚡ Good Progress',
        bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
      };
    }
    return {
      text: '⚠️ Drink More Water',
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
    };
  };

  const status = getStatusBadge();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Rectangular / A4 Landscape Container (No vertical modal scroll) */}
      <div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '92vh' }}
      >
        {/* TOP BAR */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shadow-inner">
              <Droplets className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Smart Hydration & Water Tracker
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.bg}`}>
                  {status.text}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Today: {todayFormatted} • Daily Target: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{targetLiters}L</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDraftBottles(0);
                setDraftGlasses(0);
              }}
              title="Reset Draft"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2-COLUMN A4 HUD CONTENT */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch overflow-hidden">
          
          {/* ───────────────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN: Radial Progress Visualizer + Quick Presets           */}
          {/* ───────────────────────────────────────────────────────────────── */}
          <div className="md:col-span-5 bg-gradient-to-b from-cyan-50/50 via-sky-50/20 to-transparent dark:from-cyan-950/20 dark:via-sky-950/10 dark:to-zinc-900 border border-cyan-200/60 dark:border-cyan-500/20 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            
            {/* Concentric / Radial Hydration Gauge */}
            <div className="flex flex-col items-center justify-center text-center relative py-2">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  {/* Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="none"
                    className="stroke-zinc-200 dark:stroke-zinc-800/80"
                    strokeWidth="10"
                  />
                  {/* Glowing Progress Arc */}
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="none"
                    className="stroke-cyan-500 transition-all duration-700 ease-out"
                    strokeWidth="10"
                    strokeDasharray={389.5}
                    strokeDashoffset={389.5 - (389.5 * percentAchieved) / 100}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner Stat Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Droplets className="w-5 h-5 text-cyan-400 mb-0.5 animate-bounce" />
                  <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
                    {draftLiters.toFixed(2)}<span className="text-sm font-bold text-zinc-500 dark:text-zinc-400"> L</span>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                    {percentAchieved}% Goal
                  </span>
                </div>
              </div>

              {/* Progress Summary Bar */}
              <div className="w-full mt-3 space-y-1.5">
                <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    style={{ width: `${percentAchieved}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  <span>Logged: {draftLiters.toFixed(2)} L</span>
                  <span>Remaining: {remainingLiters.toFixed(2)} L</span>
                </div>
              </div>
            </div>

            {/* Quick 1-Tap Presets */}
            <div className="space-y-2 pt-3 border-t border-cyan-100 dark:border-zinc-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Quick Add Presets
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => addPreset(0.25)}
                  className="py-2 px-2.5 rounded-xl border border-cyan-200 dark:border-cyan-500/30 bg-white/80 dark:bg-zinc-950/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> +250 ml
                </button>
                <button
                  type="button"
                  onClick={() => addPreset(0.50)}
                  className="py-2 px-2.5 rounded-xl border border-sky-200 dark:border-sky-500/30 bg-white/80 dark:bg-zinc-950/60 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> +500 ml
                </button>
                <button
                  type="button"
                  onClick={() => addPreset(0.75)}
                  className="py-2 px-2.5 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-white/80 dark:bg-zinc-950/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> +750 ml
                </button>
                <button
                  type="button"
                  onClick={() => addPreset(1.0)}
                  className="py-2 px-2.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-white/80 dark:bg-zinc-950/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> +1.0 Liter
                </button>
              </div>
            </div>

          </div>

          {/* ───────────────────────────────────────────────────────────────── */}
          {/* RIGHT COLUMN: Interactive Bottles & Glasses Grid + Logs + Save    */}
          {/* ───────────────────────────────────────────────────────────────── */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            
            {/* 1.0 LITER BOTTLES (4 Bottles) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-cyan-300 flex items-center gap-1.5">
                  🍾 1.0 Liter Bottles (1,000 ml each)
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Tap bottle to toggle</span>
              </div>

              <div className="grid grid-cols-4 gap-2.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
                {[1, 2, 3, 4].map((bNum) => {
                  const isFilled = bNum <= draftBottles;
                  return (
                    <button
                      key={bNum}
                      type="button"
                      onClick={() => toggleBottle(bNum)}
                      className={`flex flex-col items-center p-2 rounded-xl border transition-all relative overflow-hidden group ${
                        isFilled
                          ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-400/80 shadow-md shadow-cyan-950/20 ring-1 ring-cyan-400/50'
                          : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-cyan-400/40 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {/* Bottle Vector Visual */}
                      <div className="relative w-9 h-20 border-2 border-cyan-400/50 rounded-b-xl rounded-t-sm bg-white dark:bg-zinc-950 overflow-hidden flex flex-col justify-end p-0.5 shadow-inner">
                        {/* Bottle Cap */}
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-cyan-500 rounded-t-sm"></div>
                        
                        {/* Measurement Ticks */}
                        <div className="absolute inset-y-1 left-0.5 flex flex-col justify-between text-[6px] text-cyan-400/50 font-mono z-10 select-none">
                          <span>1L</span>
                          <span>.5</span>
                        </div>

                        {/* Liquid Fill */}
                        <div
                          className="w-full bg-gradient-to-t from-cyan-600 via-sky-500 to-cyan-300 transition-all duration-500 ease-out rounded-b-lg relative"
                          style={{ height: isFilled ? '100%' : '0%' }}
                        >
                          {isFilled && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-white/70 animate-pulse rounded-t-full" />
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 mt-1">Bottle #{bNum}</span>
                      <span className={`text-[9px] font-mono font-bold ${isFilled ? 'text-cyan-500 dark:text-cyan-400' : 'text-zinc-400'}`}>
                        {isFilled ? '✓ 1.0L' : 'Empty'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 250 ML GLASSES (5 Glasses) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-blue-300 flex items-center gap-1.5">
                  🥛 250 ml Water Glasses (5 Glasses)
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Tap glass to toggle</span>
              </div>

              <div className="grid grid-cols-5 gap-2 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
                {[1, 2, 3, 4, 5].map((gNum) => {
                  const isFilled = gNum <= draftGlasses;
                  return (
                    <button
                      key={gNum}
                      type="button"
                      onClick={() => toggleGlass(gNum)}
                      className={`flex flex-col items-center p-1.5 rounded-xl border transition-all relative overflow-hidden group ${
                        isFilled
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400/80 shadow-md shadow-blue-950/20 ring-1 ring-blue-400/50'
                          : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-blue-400/40 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {/* Glass Vector Visual */}
                      <div className="relative w-8 h-14 border-2 border-blue-400/50 rounded-b-lg rounded-t-xs bg-white dark:bg-zinc-950 overflow-hidden flex flex-col justify-end p-0.5 shadow-inner">
                        {/* Liquid Fill */}
                        <div
                          className="w-full bg-gradient-to-t from-blue-600 via-sky-400 to-cyan-300 transition-all duration-400 ease-out rounded-b-md relative"
                          style={{ height: isFilled ? '100%' : '0%' }}
                        >
                          {isFilled && (
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/70 animate-pulse rounded-t-full" />
                          )}
                        </div>
                      </div>

                      <span className="text-[9px] font-bold text-zinc-800 dark:text-zinc-200 mt-1">Glass #{gNum}</span>
                      <span className={`text-[8px] font-mono font-bold ${isFilled ? 'text-blue-500 dark:text-blue-400' : 'text-zinc-400'}`}>
                        {isFilled ? '✓ 250ml' : 'Empty'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selection Formula Banner */}
            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 text-center text-xs font-mono text-cyan-800 dark:text-cyan-300 flex items-center justify-center gap-1.5 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>
                Selected: <strong>{draftBottles} Bottle(s)</strong> ({draftBottles * 1000} ml) + <strong>{draftGlasses} Glass(es)</strong> ({draftGlasses * 250} ml) = <strong className="text-cyan-600 dark:text-cyan-200 underline font-black">{draftLiters.toFixed(2)} Liters</strong>
              </span>
            </div>

            {/* Action Buttons: Cancel + Save */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-950/30 hover:shadow-cyan-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Hydration Log...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Save Hydration Log ({draftLiters.toFixed(2)} L)
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* BOTTOM FOOTER: Today's Hydration Record Logs */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[11px]">
              Hydration logs synchronize with your daily metabolic rate and macro rings.
            </span>
          </div>

          {waterLogs.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-400 font-mono">
                {waterLogs.length} logged today
              </span>
              <button
                type="button"
                onClick={onResetWaterLogs}
                className="text-[11px] text-red-500 hover:text-red-400 font-bold hover:underline"
              >
                Reset Daily Logs
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
