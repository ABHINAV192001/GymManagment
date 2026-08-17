import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Calendar, Plus, X, Clock, RefreshCw, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';
import { StaffShift, getShiftsByOrg, createShift, deleteShift } from '../../lib/api/roster';
import { getStaff } from '../../lib/api/admin';
import { getMyOrg } from '../../lib/api/organizations';
import { Staff } from '../../types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function isSameDay(date1: Date, isoStr: string): boolean {
  const d2 = new Date(isoStr);
  return date1.getFullYear() === d2.getFullYear() && date1.getMonth() === d2.getMonth() && date1.getDate() === d2.getDate();
}

const TASK_COLORS = [
  'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
];

export const Roster: React.FC = () => {
  const { triggerAnnouncement, selectedBranchId } = useOutletContext<{ triggerAnnouncement: (msg: string) => void; selectedBranchId: string }>();
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [orgId, setOrgId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ staffId: '', date: '', startTime: '09:00', endTime: '17:00', taskDescription: '' });

  const weekDates = getWeekDates(weekOffset);

  const load = useCallback(async (oid: string) => {
    setIsLoading(true);
    try {
      const [s, stf] = await Promise.all([getShiftsByOrg(oid), getStaff()]);
      setShifts(Array.isArray(s) ? s : []);
      setStaff(Array.isArray(stf) ? stf : []);
    } catch (err: any) {
      triggerAnnouncement(`Failed to load roster: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [triggerAnnouncement]);

  useEffect(() => {
    getMyOrg().then(org => {
      if (org?.id) { setOrgId(org.id); load(org.id); }
    });
  }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staffId || !form.date) return;
    setIsSaving(true);
    try {
      const startTime = new Date(`${form.date}T${form.startTime}:00`).toISOString();
      const endTime = new Date(`${form.date}T${form.endTime}:00`).toISOString();
      const created = await createShift({
        staff: { id: form.staffId },
        startTime,
        endTime,
        taskDescription: form.taskDescription,
        orgId,
        branchId: selectedBranchId !== 'ALL' ? selectedBranchId : undefined,
      });
      setShifts(prev => [...prev, created]);
      setIsModalOpen(false);
      triggerAnnouncement('Shift added to roster.');
      setForm({ staffId: '', date: '', startTime: '09:00', endTime: '17:00', taskDescription: '' });
    } catch (err: any) {
      triggerAnnouncement(`Failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (shift: StaffShift) => {
    if (!shift.id || !window.confirm('Remove this shift?')) return;
    try {
      await deleteShift(shift.id);
      setShifts(prev => prev.filter(s => s.id !== shift.id));
      triggerAnnouncement('Shift removed.');
    } catch (err: any) {
      triggerAnnouncement(`Error: ${err.message}`);
    }
  };

  const staffColorMap: Record<string, string> = {};
  staff.forEach((s, i) => { staffColorMap[s.id] = TASK_COLORS[i % TASK_COLORS.length]; });

  const todayLabel = new Date().toDateString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-violet-600" /> Staff Shift Roster
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage weekly staff schedules and task assignments.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => orgId && load(orgId)} className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition shadow-lg shadow-violet-500/20">
            <Plus className="w-4 h-4" /> Assign Shift
          </button>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <button onClick={() => setWeekOffset(o => o - 1)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-500">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <span className="font-black text-sm text-zinc-900 dark:text-zinc-100">
            {weekDates[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {weekDates[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {weekOffset === 0 && <span className="ml-2 text-[10px] font-black px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400">THIS WEEK</span>}
        </div>
        <button onClick={() => setWeekOffset(o => o + 1)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-500">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekly Calendar Grid (Horizontally scrollable on mobile, fluid on desktop) */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading roster…
        </div>
      ) : (
        <div className="overflow-x-auto pb-3 -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="min-w-[700px] sm:min-w-0 grid grid-cols-7 gap-2">
            {weekDates.map((date, di) => {
              const isToday = date.toDateString() === todayLabel;
              const dayShifts = shifts.filter(s => isSameDay(date, s.startTime));
              return (
                <div key={di} className={`rounded-2xl border-2 overflow-hidden min-h-[160px] ${isToday ? 'border-violet-500 shadow-lg shadow-violet-500/10' : 'border-zinc-200 dark:border-zinc-800'}`}>
                  {/* Day Header */}
                  <div className={`px-2 py-2 text-center border-b ${isToday ? 'bg-violet-600 text-white' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'}`}>
                    <div className="text-[10px] font-black uppercase tracking-wider">{SHORT_DAYS[(di + 1) % 7]}</div>
                    <div className={`text-lg font-black mt-0.5 ${isToday ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>{date.getDate()}</div>
                  </div>
                  {/* Shifts */}
                  <div className="p-1.5 space-y-1 bg-white dark:bg-zinc-950">
                    {dayShifts.length === 0 ? (
                      <div className="text-center py-4 text-[10px] text-zinc-400">No shifts</div>
                    ) : (
                      dayShifts.map(shift => {
                        const staffName = shift.staff?.name || 'Staff';
                        const staffId = (shift.staff as any)?.id || '';
                        const colorClass = staffColorMap[staffId] || TASK_COLORS[0];
                        return (
                          <div key={shift.id} className={`p-1.5 rounded-lg border text-[10px] font-semibold ${colorClass} relative group`}>
                            <div className="font-black truncate">{staffName}</div>
                            <div className="flex items-center gap-0.5 mt-0.5 opacity-80">
                              <Clock className="w-2.5 h-2.5" />
                              {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
                            </div>
                            {shift.taskDescription && <div className="mt-0.5 truncate opacity-70">{shift.taskDescription}</div>}
                            <button onClick={() => handleDelete(shift)} className="absolute top-1 right-1 hidden group-hover:block p-0.5 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-950 transition" title="Remove">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-violet-600 to-purple-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                <span className="font-black">Assign New Shift</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1 block">Staff Member *</label>
                <select required value={form.staffId} onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="">Select staff member…</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name} — {s.designation || 'Staff'}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1 block">Date *</label>
                <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1 block">Start Time *</label>
                  <input type="time" required value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1 block">End Time *</label>
                  <input type="time" required value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1 block">Task / Duty Description</label>
                <input value={form.taskDescription} onChange={e => setForm(f => ({ ...f, taskDescription: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="e.g. Training Floor, Reception, Cleaning…" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  Assign Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
