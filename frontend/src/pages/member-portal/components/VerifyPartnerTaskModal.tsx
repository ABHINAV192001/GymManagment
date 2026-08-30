import React, { useState } from 'react';
import { X, Trophy, Calendar, Zap, CheckCircle } from 'lucide-react';
import { DuoChallenge } from '../../../types/duo';
import { logDuoEvent } from '../../../lib/api/duo';

interface VerifyPartnerTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: DuoChallenge | null;
  targetMember: { id: string; name: string } | null;
  onSuccess: () => void;
}

export const VerifyPartnerTaskModal: React.FC<VerifyPartnerTaskModalProps> = ({
  isOpen,
  onClose,
  challenge,
  targetMember,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);

  if (!isOpen || !challenge || !targetMember) return null;

  // Calculate current day index (1-based)
  const startDate = challenge.startDate ? new Date(challenge.startDate) : new Date();
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDayIndex = Math.max(1, Math.min(challenge.durationDays || 7, diffDays + 1));

  const tasks = challenge.tasks || [];
  const todayTask = tasks.find(t => t.dayIndex === currentDayIndex) || (tasks.length > 0 ? tasks[0] : { dayIndex: 1, dayOfWeek: 'Today', taskName: 'Daily Workout Session', points: 10 });

  const handleVerify = async () => {
    try {
      setSubmitting(true);
      await logDuoEvent(
        'WORKOUT',
        `Verified & completed task: "${todayTask.taskName}" for ${targetMember.name}`,
        targetMember.id
      );
      setCompletedToday(true);
      onSuccess();
      setTimeout(() => {
        setCompletedToday(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(err.message || `Failed to log task for ${targetMember.name}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>Partner Task Verification</span>
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Verify Task for {targetMember.name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Confirm your partner completed today's assigned challenge task to add +10 points!
          </p>
        </div>

        {/* Today's Assigned Task Highlight Card */}
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Today's Assigned Task (Day {todayTask.dayIndex})
            </span>
            <span className="px-2.5 py-1 bg-amber-500 text-white font-black text-xs rounded-xl shadow-xs">
              +10 Points
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              {todayTask.taskName}
            </h3>
            {todayTask.dayOfWeek && (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                Scheduled Day: {todayTask.dayOfWeek}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleVerify}
          disabled={submitting || completedToday}
          className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
            completedToday
              ? 'bg-emerald-500 text-white cursor-default'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {completedToday ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Completed! +10 Points Added to {targetMember.name}</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 fill-current" />
              <span>{submitting ? 'Verifying & Awarding Points...' : `Mark Complete (+10 Pts to ${targetMember.name})`}</span>
            </>
          )}
        </button>

        {/* Full Challenge Schedule Preview */}
        {tasks.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center justify-between">
              <span>Full Challenge Schedule ({tasks.length} Days)</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {tasks.map((t) => {
                const isCurrent = t.dayIndex === todayTask.dayIndex;
                return (
                  <div
                    key={t.dayIndex}
                    className={`p-2.5 rounded-xl border text-xs space-y-0.5 ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span>Day {t.dayIndex} {t.dayOfWeek ? `• ${t.dayOfWeek}` : ''}</span>
                      <span>+10 pts</span>
                    </div>
                    <p className="font-extrabold truncate text-gray-900 dark:text-white">{t.taskName}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
