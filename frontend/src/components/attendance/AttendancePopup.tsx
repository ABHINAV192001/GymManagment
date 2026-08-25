import React, { useState } from 'react';
import { UserCheck, Clock, Calendar, CheckCircle2, X, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { checkIn } from '../../lib/api/attendance';

interface AttendancePopupProps {
  userProfile: any;
  selectedBranchId?: string;
  onClose: () => void;
  onSuccess: (checkinTime: string) => void;
}

export const AttendancePopup: React.FC<AttendancePopupProps> = ({
  userProfile,
  selectedBranchId,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markedTime, setMarkedTime] = useState<string | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayDisplay = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleMarkAttendance = async () => {
    if (!userProfile?.id) {
      setError('User profile not loaded. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine entityType based on role / profile
      const role = (userProfile.role || '').toUpperCase();
      const entityType = role.includes('STAFF') || role.includes('TRAINER') || role.includes('EMPLOYEE') ? 'STAFF' : 'USER';
      
      const branchId = selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : userProfile.branchId;
      const res = await checkIn(userProfile.id, branchId, entityType);

      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMarkedTime(timeNow);
      
      setTimeout(() => {
        onSuccess(timeNow);
      }, 1800);
    } catch (err: any) {
      console.error('Failed to mark attendance:', err);
      // If already checked in according to backend
      if (err.message && err.message.toLowerCase().includes('already checked in')) {
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMarkedTime(timeNow);
        setTimeout(() => {
          onSuccess(timeNow);
        }, 1500);
      } else {
        setError(err.message || 'Failed to mark attendance. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform transition-all duration-300">
        
        {/* Top Gradient Banner */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
            title="Skip for now"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
            {markedTime ? (
              <CheckCircle2 className="w-10 h-10 text-white animate-bounce" />
            ) : (
              <UserCheck className="w-9 h-9 text-white animate-pulse" />
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase bg-white/20 backdrop-blur-sm text-emerald-100">
            <Sparkles className="w-3 h-3 text-amber-300" /> Daily Attendance Check
          </span>

          <h2 className="text-2xl font-black mt-2 tracking-tight">
            {getGreeting()}, {userProfile?.name ? userProfile.name.split(' ')[0] : 'there'}!
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 flex items-center justify-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {todayDisplay}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {markedTime ? (
            <div className="text-center py-4 space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                <Clock className="w-4 h-4" /> Checked In at {markedTime}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                Your attendance has been recorded for today! Have a wonderful day.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-700/50 space-y-1.5 text-center">
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Please mark your daily check-in attendance
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Logging attendance ensures your shift/session credits and activity records are accurate.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2 text-rose-600 dark:text-rose-300 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleMarkAttendance}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Marking Attendance...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Mark Attendance Now
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  disabled={loading}
                  className="w-full py-2.5 text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer text-center"
                >
                  Remind Me Later / Skip
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
