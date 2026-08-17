import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Dumbbell,
  UtensilsCrossed,
  Droplets,
  Footprints,
  Clock,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flame,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import {
  NotificationBundle,
  getNotificationBundle,
  saveNotificationBundle,
  sendNotificationBundleEmail
} from '../../lib/api/user';

interface NotificationBundleSectionProps {
  userEmail?: string;
  userName?: string;
  onAnnounce?: (msg: string) => void;
}

export const NotificationBundleSection: React.FC<NotificationBundleSectionProps> = ({
  userEmail = 'user@gymbross.com',
  userName = 'Member',
  onAnnounce
}) => {
  const [bundle, setBundle] = useState<NotificationBundle>({
    enabled: true,
    recipientEmail: userEmail,
    workoutReminder: {
      enabled: true,
      preferredTime: '07:00',
      splitFocus: 'Upper Body & Core Power',
      includeWarmup: true,
      includeMotivation: true,
      targetExercises: [
        'Barbell Bench Press - 4 Sets x 10 Reps',
        'Incline Dumbbell Press - 3 Sets x 12 Reps',
        'Seated Cable Rows - 4 Sets x 12 Reps',
        'Overhead Shoulder Press - 3 Sets x 10 Reps',
        'Hanging Leg Raises - 3 Sets x 15 Reps'
      ]
    },
    dietReminder: {
      enabled: true,
      breakfastTime: '08:30',
      lunchTime: '13:00',
      snackTime: '17:00',
      dinnerTime: '20:30',
      dailyCalorieTarget: 2200,
      proteinTargetGrams: 165,
      carbsTargetGrams: 245,
      fatTargetGrams: 60,
      suggestMealIdeas: true,
      dietPlanName: 'High-Protein Muscle Gain Diet'
    },
    waterReminder: {
      enabled: true,
      intervalHours: 1, // Default: Every 1 hour
      startTime: '08:00',
      endTime: '22:00',
      dailyTargetLiters: 3.5,
      currentLoggedLiters: 2.25,
      percentageCompleted: 64,
      alertIfBelowTarget: true
    },
    walkReminder: {
      enabled: true,
      intervalHours: 1, // Default: Hourly desk break
      walkTime: '18:30',
      dailyStepTarget: 10000,
      reminderType: 'BOTH'
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Fetch bundle from backend on mount
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getNotificationBundle()
      .then(data => {
        if (mounted && data) {
          setBundle(prev => ({
            ...prev,
            ...data,
            recipientEmail: data.recipientEmail || userEmail || prev.recipientEmail,
            workoutReminder: { ...prev.workoutReminder, ...(data.workoutReminder || {}) },
            dietReminder: { ...prev.dietReminder, ...(data.dietReminder || {}) },
            waterReminder: { ...prev.waterReminder, ...(data.waterReminder || {}) },
            walkReminder: { ...prev.walkReminder, ...(data.walkReminder || {}) }
          }));
        }
      })
      .catch(err => {
        console.log('Using initial client notification bundle defaults:', err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userEmail]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setStatusMessage(null);
      await saveNotificationBundle(bundle);
      setStatusMessage({ type: 'success', text: 'Daily Routine & Notification preferences saved successfully!' });
      if (onAnnounce) onAnnounce('Daily Routine preferences saved successfully.');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to save notification bundle settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setIsSendingEmail(true);
      setStatusMessage(null);
      await sendNotificationBundleEmail(bundle);
      const targetEmail = bundle.recipientEmail || userEmail;
      setStatusMessage({
        type: 'success',
        text: `Test Routine Notification Bundle sent to ${targetEmail}! Check your inbox.`
      });
      if (onAnnounce) onAnnounce(`Test Routine Notification Bundle sent to ${targetEmail}`);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to dispatch email. Please verify backend email configuration.'
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const waterLogged = bundle.waterReminder.currentLoggedLiters || 0.0;
  const waterTarget = bundle.waterReminder.dailyTargetLiters || 3.5;
  const waterPct = Math.min(100, Math.round((waterLogged / waterTarget) * 100));

  return (
    <div className="space-y-4 text-xs">
      
      {/* ── Status Feedback Alert ───────────────────────────────────────────── */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-semibold animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Master Header Banner ──────────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-zinc-900 text-white shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <Sparkles className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                Daily Routine Notification Bundle
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Email Channel
                </span>
              </h4>
              <p className="text-[11px] text-blue-200">
                Automated daily alerts for your workout split, diet & meals, 1-hour water hydration timer, and walk breaks.
              </p>
            </div>
          </div>

          {/* Master Enable/Disable Switch */}
          <label className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/20 cursor-pointer transition">
            <span className="text-[11px] font-bold text-white">
              {bundle.enabled ? 'Bundle Active' : 'Bundle Disabled'}
            </span>
            <input
              type="checkbox"
              checked={bundle.enabled}
              onChange={e => setBundle(prev => ({ ...prev, enabled: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </label>
        </div>

        {/* Recipient Email Address Bar */}
        <div className="pt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Mail className="w-4 h-4 text-blue-300 shrink-0" />
            <label className="text-[11px] text-blue-200 font-semibold shrink-0">Send Notifications to:</label>
            <input
              type="email"
              value={bundle.recipientEmail}
              onChange={e => setBundle(prev => ({ ...prev, recipientEmail: e.target.value }))}
              placeholder="Enter delivery email..."
              className="bg-black/30 border border-white/20 rounded-lg px-2.5 py-1 text-white text-xs font-mono font-bold focus:outline-none focus:border-blue-400 flex-1 max-w-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 transition border border-white/15 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Digest</span>
            </button>

            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSendingEmail || !bundle.enabled}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-600/30 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingEmail ? 'Sending Email...' : 'Send Test Email Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 Pillars Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        {/* PILLAR 1: WORKOUT ROUTINE REMINDER */}
        <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs">1. Workout Routine Alert</h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Scheduled session & exercise plan</p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={bundle.workoutReminder.enabled}
              onChange={e =>
                setBundle(prev => ({
                  ...prev,
                  workoutReminder: { ...prev.workoutReminder, enabled: e.target.checked }
                }))
              }
              className="w-4 h-4 text-orange-600 rounded"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" /> Reminder Time:
              </label>
              <input
                type="time"
                value={bundle.workoutReminder.preferredTime}
                onChange={e =>
                  setBundle(prev => ({
                    ...prev,
                    workoutReminder: { ...prev.workoutReminder, preferredTime: e.target.value }
                  }))
                }
                className="px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">
                Today's Target Split
              </label>
              <input
                type="text"
                value={bundle.workoutReminder.splitFocus}
                onChange={e =>
                  setBundle(prev => ({
                    ...prev,
                    workoutReminder: { ...prev.workoutReminder, splitFocus: e.target.value }
                  }))
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-bold text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bundle.workoutReminder.includeWarmup}
                  onChange={e =>
                    setBundle(prev => ({
                      ...prev,
                      workoutReminder: { ...prev.workoutReminder, includeWarmup: e.target.checked }
                    }))
                  }
                  className="w-3.5 h-3.5 text-orange-600 rounded"
                />
                <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                  Include 5-min dynamic warm-up guide
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bundle.workoutReminder.includeMotivation}
                  onChange={e =>
                    setBundle(prev => ({
                      ...prev,
                      workoutReminder: { ...prev.workoutReminder, includeMotivation: e.target.checked }
                    }))
                  }
                  className="w-3.5 h-3.5 text-orange-600 rounded"
                />
                <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                  Include daily athlete motivation quote
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* PILLAR 2: DIET & WHAT TO EAT REMINDER */}
        <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs">2. Diet & "What to Eat" Alert</h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Meal timing, macros & meal suggestions</p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={bundle.dietReminder.enabled}
              onChange={e =>
                setBundle(prev => ({
                  ...prev,
                  dietReminder: { ...prev.dietReminder, enabled: e.target.checked }
                }))
              }
              className="w-4 h-4 text-emerald-600 rounded"
            />
          </div>

          <div className="space-y-2.5">
            {/* Macro preview strip */}
            <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                Target: {bundle.dietReminder.dailyCalorieTarget} kcal
              </span>
              <div className="flex gap-2 text-[10px] font-bold">
                <span className="text-blue-600 dark:text-blue-400">P: {bundle.dietReminder.proteinTargetGrams}g</span>
                <span className="text-amber-600 dark:text-amber-400">C: {bundle.dietReminder.carbsTargetGrams}g</span>
                <span className="text-rose-600 dark:text-rose-400">F: {bundle.dietReminder.fatTargetGrams}g</span>
              </div>
            </div>

            {/* Meal Time Pickers */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Breakfast:</span>
                <input
                  type="time"
                  value={bundle.dietReminder.breakfastTime}
                  onChange={e =>
                    setBundle(prev => ({
                      ...prev,
                      dietReminder: { ...prev.dietReminder, breakfastTime: e.target.value }
                    }))
                  }
                  className="font-mono text-xs font-bold bg-transparent text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Lunch:</span>
                <input
                  type="time"
                  value={bundle.dietReminder.lunchTime}
                  onChange={e =>
                    setBundle(prev => ({
                      ...prev,
                      dietReminder: { ...prev.dietReminder, lunchTime: e.target.value }
                    }))
                  }
                  className="font-mono text-xs font-bold bg-transparent text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Snacks:</span>
                <input
                  type="time"
                  value={bundle.dietReminder.snackTime}
                  onChange={e =>
                    setBundle(prev => ({
                      ...prev,
                      dietReminder: { ...prev.dietReminder, snackTime: e.target.value }
                    }))
                  }
                  className="font-mono text-xs font-bold bg-transparent text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">Dinner:</span>
                <input
                  type="time"
                  value={bundle.dietReminder.dinnerTime}
                  onChange={e =>
                    setBundle(prev => ({
                      ...prev,
                      dietReminder: { ...prev.dietReminder, dinnerTime: e.target.value }
                    }))
                  }
                  className="font-mono text-xs font-bold bg-transparent text-zinc-800 dark:text-zinc-200"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={bundle.dietReminder.suggestMealIdeas}
                onChange={e =>
                  setBundle(prev => ({
                    ...prev,
                    dietReminder: { ...prev.dietReminder, suggestMealIdeas: e.target.checked }
                  }))
                }
                className="w-3.5 h-3.5 text-emerald-600 rounded"
              />
              <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                Include recommended recipe & food choices in email
              </span>
            </label>
          </div>
        </div>

        {/* PILLAR 3: HYDRATION & 1-HOUR WATER TIMER */}
        <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs">
                  3. Hydration Level & Water Timer
                </h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Live water intake level with recurring timer
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={bundle.waterReminder.enabled}
              onChange={e =>
                setBundle(prev => ({
                  ...prev,
                  waterReminder: { ...prev.waterReminder, enabled: e.target.checked }
                }))
              }
              className="w-4 h-4 text-cyan-600 rounded"
            />
          </div>

          <div className="space-y-2.5">
            {/* Live Water Gauge */}
            <div className="p-2.5 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/40 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-cyan-900 dark:text-cyan-200 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
                  Current Logged Level:
                </span>
                <span className="font-mono font-extrabold text-cyan-700 dark:text-cyan-300">
                  {waterLogged}L / {waterTarget}L ({waterPct}%)
                </span>
              </div>
              <div className="w-full bg-cyan-200 dark:bg-cyan-900/50 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${waterPct}%` }}
                />
              </div>
            </div>

            {/* Recurring Timer Interval Selector */}
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Drink Reminder Timer:
              </label>
              <select
                value={bundle.waterReminder.intervalHours}
                onChange={e =>
                  setBundle(prev => ({
                    ...prev,
                    waterReminder: { ...prev.waterReminder, intervalHours: Number(e.target.value) }
                  }))
                }
                className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-bold text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value={1}>Every 1 Hour (Recommended)</option>
                <option value={2}>Every 2 Hours</option>
                <option value={3}>Every 3 Hours</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
              <span>Active Hours:</span>
              <div className="flex items-center gap-1 font-mono font-bold">
                <input
                  type="time"
                  value={bundle.waterReminder.startTime}
                  onChange={e =>
                    setBundle(prev => ({
                      ...prev,
                      waterReminder: { ...prev.waterReminder, startTime: e.target.value }
                    }))
                  }
                  className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                />
                <span>to</span>
                <input
                  type="time"
                  value={bundle.waterReminder.endTime}
                  onChange={e =>
                    setBundle(prev => ({
                      ...prev,
                      waterReminder: { ...prev.waterReminder, endTime: e.target.value }
                    }))
                  }
                  className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PILLAR 4: MOVEMENT & WALK REMINDER */}
        <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Footprints className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs">4. Movement & Walk Alert</h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Hourly desk breaks & evening step goals</p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={bundle.walkReminder.enabled}
              onChange={e =>
                setBundle(prev => ({
                  ...prev,
                  walkReminder: { ...prev.walkReminder, enabled: e.target.checked }
                }))
              }
              className="w-4 h-4 text-purple-600 rounded"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                Desk Break Timer:
              </label>
              <select
                value={bundle.walkReminder.intervalHours}
                onChange={e =>
                  setBundle(prev => ({
                    ...prev,
                    walkReminder: { ...prev.walkReminder, intervalHours: Number(e.target.value) }
                  }))
                }
                className="px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-bold text-xs text-zinc-900 dark:text-zinc-100"
              >
                <option value={1}>Every 1 Hour (5-min walk)</option>
                <option value={2}>Every 2 Hours (10-min walk)</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" /> Daily Walk Time:
              </label>
              <input
                type="time"
                value={bundle.walkReminder.walkTime}
                onChange={e =>
                  setBundle(prev => ({
                    ...prev,
                    walkReminder: { ...prev.walkReminder, walkTime: e.target.value }
                  }))
                }
                className="px-2 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono font-bold text-xs"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-semibold">Daily Step Target:</span>
              <span className="font-mono font-black text-purple-600 dark:text-purple-400 text-xs">
                {bundle.walkReminder.dailyStepTarget.toLocaleString()} Steps
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Footer Action Buttons ─────────────────────────────────────────── */}
      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Routine digest will be sent to your verified email.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Save Routine Preferences'}</span>
          </button>
        </div>
      </div>

      {/* ── Visual Email Digest Preview Modal ─────────────────────────────── */}
      {showPreviewModal && (
        <div
          className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                  Email Digest Preview ({bundle.recipientEmail || userEmail})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            {/* Email Canvas Preview */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 font-sans text-xs">
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-3.5 rounded-xl text-white">
                <h3 className="font-black text-sm">GymBross Daily Fitness & Routine Digest</h3>
                <p className="text-[10px] text-blue-200 mt-0.5">Prepared for {userName} • Today's Schedule</p>
              </div>

              {/* Workout */}
              <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-orange-600 dark:text-orange-400">
                  <Dumbbell className="w-3.5 h-3.5" /> 1. Today's Workout ({bundle.workoutReminder.preferredTime})
                </div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">{bundle.workoutReminder.splitFocus}</p>
                <ul className="list-disc list-inside text-[11px] text-zinc-600 dark:text-zinc-400 space-y-0.5">
                  {bundle.workoutReminder.targetExercises?.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>

              {/* Diet */}
              <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <UtensilsCrossed className="w-3.5 h-3.5" /> 2. Nutrition Plan & What To Eat ({bundle.dietReminder.dailyCalorieTarget} kcal)
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                  <div>• Breakfast ({bundle.dietReminder.breakfastTime}): Oatmeal & Protein</div>
                  <div>• Lunch ({bundle.dietReminder.lunchTime}): Grilled Chicken & Rice</div>
                  <div>• Snacks ({bundle.dietReminder.snackTime}): Greek Yogurt & Berries</div>
                  <div>• Dinner ({bundle.dietReminder.dinnerTime}): Salmon & Quinoa Salad</div>
                </div>
              </div>

              {/* Water */}
              <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-cyan-600 dark:text-cyan-400">
                  <Droplets className="w-3.5 h-3.5" /> 3. Water Hydration Level & 1-Hour Timer
                </div>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Logged: <strong>{waterLogged}L / {waterTarget}L ({waterPct}%)</strong> • Drink reminder every <strong>{bundle.waterReminder.intervalHours} Hour</strong>.
                </p>
              </div>

              {/* Walk */}
              <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                  <Footprints className="w-3.5 h-3.5" /> 4. Movement & Walk Break
                </div>
                <p className="text-zinc-700 dark:text-zinc-300">
                  Take a 5-min walk every <strong>{bundle.walkReminder.intervalHours} hour</strong> • Evening walk scheduled at <strong>{bundle.walkReminder.walkTime}</strong> • Target: {bundle.walkReminder.dailyStepTarget.toLocaleString()} steps.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold transition hover:bg-zinc-300 dark:hover:bg-zinc-700"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  handleSendTestEmail();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold transition hover:bg-emerald-500 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to My Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
