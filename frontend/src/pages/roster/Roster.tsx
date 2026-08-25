import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Calendar, Plus, X, Clock, RefreshCw, Sparkles, ChevronLeft, ChevronRight,
  User, Building2, Pencil, Trash2, Search, Phone, Mail, Badge, Hash,
  ChevronDown, CheckCircle2, AlertCircle, CalendarRange,
} from 'lucide-react';
import {
  StaffShift, getShiftsByOrgAndDateRange, createShift, updateShift, deleteShift,
  CreateShiftRequest,
} from '../../lib/api/roster';
import { getStaff, getAdminBranches } from '../../lib/api/admin';
import { getUserAttendance } from '../../lib/api/attendance';
import { getMyOrg } from '../../lib/api/organizations';
import { Staff, Branch } from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS = ['S','M','T','W','T','F','S'];

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fromYMD(s: string) { return new Date(s + 'T00:00:00'); }
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isBetween(d: Date, from: Date, to: Date) {
  const t = d.getTime();
  return t > from.getTime() && t < to.getTime();
}
function formatDisplay(d: Date | null) {
  if (!d) return '—';
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}'${String(d.getFullYear()).slice(2)}`;
}
function formatTime(iso: string) {
  if (!iso) return '—';
  const timePart = iso.includes('T') ? iso.split('T')[1] : iso;
  const [hStr, mStr] = timePart.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr ? mStr.substring(0, 2) : '00';
  if (isNaN(h)) return iso;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2,'0')}:${m} ${ampm}`;
}
function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}
function shiftDateOnly(iso: string) { return iso ? iso.split('T')[0] : ''; }

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// ─────────────────────────────────────────────────────────────────────────────
// Zoomcar-style DateRangePicker
// ─────────────────────────────────────────────────────────────────────────────

interface DRPState {
  startDate: Date | null;
  endDate: Date | null;
  hoverDate: Date | null;
  step: 'start' | 'end';
}

interface CalMonthProps {
  year: number;
  month: number;
  state: DRPState;
  today: Date;
  onDayClick: (d: Date) => void;
  onDayHover: (d: Date | null) => void;
}

const CalMonth: React.FC<CalMonthProps> = ({ year, month, state, today, onDayClick, onDayHover }) => {
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= days; i++) cells.push(new Date(year, month, i));

  const { startDate, endDate, hoverDate, step } = state;
  const rangeEnd = endDate ?? (step === 'end' && hoverDate ? hoverDate : null);

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="text-center font-black text-sm text-zinc-800 dark:text-zinc-100 mb-3">
        {MONTH_NAMES[month]} '{String(year).slice(2)}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-black text-zinc-400 pb-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((date, idx) => {
          if (!date) return <div key={`e-${idx}`} />;

          const isToday = sameDay(date, today);
          const isStart = startDate ? sameDay(date, startDate) : false;
          const isEnd = rangeEnd ? sameDay(date, rangeEnd) : false;
          const inRange = startDate && rangeEnd
            ? (startDate < rangeEnd ? isBetween(date, startDate, rangeEnd) : isBetween(date, rangeEnd, startDate))
            : false;
          const isPast = date < today && !isToday;

          let cellBg = '';
          let numCls = 'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full';

          if (isStart || isEnd) {
            numCls = 'bg-emerald-600 text-white rounded-full font-black shadow-md shadow-emerald-500/30';
          } else if (inRange) {
            cellBg = 'bg-emerald-50 dark:bg-emerald-950/30';
            numCls = 'text-emerald-700 dark:text-emerald-300 font-semibold';
          } else if (isPast) {
            numCls = 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed';
          }

          // Range connection bar
          const isStartOnly = isStart && !isEnd;
          const isEndOnly = isEnd && !isStart;
          const showLeftBar = (isEndOnly || inRange) && date.getDay() !== 0;
          const showRightBar = (isStartOnly || inRange) && date.getDay() !== 6 && idx < cells.length - 1;

          return (
            <div
              key={toYMD(date)}
              className="relative h-9 flex items-center justify-center"
            >
              {/* Range fill bars */}
              {showLeftBar && (
                <div className="absolute left-0 right-1/2 top-1 bottom-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-l-full" />
              )}
              {showRightBar && (
                <div className="absolute left-1/2 right-0 top-1 bottom-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-r-full" />
              )}
              <button
                type="button"
                disabled={isPast}
                onClick={() => !isPast && onDayClick(date)}
                onMouseEnter={() => !isPast && onDayHover(date)}
                onMouseLeave={() => onDayHover(null)}
                className={`relative z-10 w-8 h-8 flex items-center justify-center text-[13px] transition-all duration-100 ${numCls} ${isToday && !isStart && !isEnd ? 'ring-2 ring-emerald-400 rounded-full' : ''}`}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface DateRangePickerProps {
  value: { from: string; to: string } | null;
  onApply: (from: string, to: string) => void;
  onCancel: () => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onApply, onCancel }) => {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [leftYear, setLeftYear] = useState(today.getFullYear());
  const [leftMonth, setLeftMonth] = useState(today.getMonth());
  const [drp, setDrp] = useState<DRPState>(() => ({
    startDate: value?.from ? fromYMD(value.from) : null,
    endDate: value?.to ? fromYMD(value.to) : null,
    hoverDate: null,
    step: value?.from && value?.to ? 'start' : value?.from ? 'end' : 'start',
  }));

  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;
  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;

  const prevMonth = () => {
    if (leftMonth === 0) { setLeftYear(y => y - 1); setLeftMonth(11); }
    else setLeftMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (leftMonth === 11) { setLeftYear(y => y + 1); setLeftMonth(0); }
    else setLeftMonth(m => m + 1);
  };

  const handleDayClick = (date: Date) => {
    setDrp(prev => {
      if (prev.step === 'start') {
        return { startDate: date, endDate: null, hoverDate: null, step: 'end' };
      } else {
        // If clicked before start, swap
        const [s, e] = prev.startDate && date < prev.startDate
          ? [date, prev.startDate]
          : [prev.startDate, date];
        return { startDate: s, endDate: e, hoverDate: null, step: 'start' };
      }
    });
  };

  const handleHover = (date: Date | null) => {
    if (drp.step === 'end') setDrp(prev => ({ ...prev, hoverDate: date }));
  };

  const handleReset = () => {
    setDrp({ startDate: null, endDate: null, hoverDate: null, step: 'start' });
  };

  const canApply = drp.startDate && drp.endDate;

  const headerLabel = () => {
    if (!drp.startDate) return 'Select start date';
    if (!drp.endDate) return 'Select end date';
    return `${formatDisplay(drp.startDate)}  →  ${formatDisplay(drp.endDate)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarRange className="w-5 h-5 text-white" />
            <span className="text-white font-black text-sm tracking-wide">{headerLabel()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-white/70 hover:text-white text-xs font-black uppercase tracking-widest transition px-3 py-1 rounded-lg hover:bg-white/10"
            >
              RESET
            </button>
            <button onClick={onCancel} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step prompt */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800">
          <div className={`flex-1 py-2.5 text-center text-xs font-black transition ${drp.step === 'start' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-zinc-400'}`}>
            📅 START DATE {drp.startDate ? `— ${formatDisplay(drp.startDate)}` : '(click to select)'}
          </div>
          <div className={`flex-1 py-2.5 text-center text-xs font-black transition ${drp.step === 'end' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-zinc-400'}`}>
            📅 END DATE {drp.endDate ? `— ${formatDisplay(drp.endDate)}` : drp.step === 'end' ? '(click to select)' : '—'}
          </div>
        </div>

        {/* Calendars */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-12 flex-1 justify-center">
              <CalMonth year={leftYear} month={leftMonth} state={drp} today={today} onDayClick={handleDayClick} onDayHover={handleHover} />
              <CalMonth year={rightYear} month={rightMonth} state={drp} today={today} onDayClick={handleDayClick} onDayHover={handleHover} />
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canApply}
            onClick={() => canApply && onApply(toYMD(drp.startDate!), toYMD(drp.endDate!))}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface StaffRow {
  staffId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  userCode: string;
  branchName: string;
  shifts: StaffShift[];
  totalAttendance: number;
  attendanceLoading: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const map: Record<string, string> = {
    EMPLOYEE: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    TRAINER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    MANAGER: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
    ADMIN: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    ORG_ADMIN: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  };
  const cls = map[role?.toUpperCase()] ?? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${cls}`}>
      <Badge className="w-2.5 h-2.5" />{role || '—'}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Staff Detail Drawer
// ─────────────────────────────────────────────────────────────────────────────

interface DrawerProps {
  row: StaffRow;
  staff: Staff[];
  branches: Branch[];
  orgId: string;
  onClose: () => void;
  onShiftSaved: (shift: StaffShift, isNew: boolean) => void;
  onShiftDeleted: (shiftId: string) => void;
}

const StaffDetailDrawer: React.FC<DrawerProps> = ({
  row, staff, branches, orgId, onClose, onShiftSaved, onShiftDeleted,
}) => {
  const [editingShift, setEditingShift] = useState<StaffShift | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const blankForm = () => ({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00', endTime: '17:00', taskDescription: '',
    branchId: row.shifts[0]?.branchId ?? '',
  });
  const [form, setForm] = useState(blankForm);

  const openEdit = (shift: StaffShift) => {
    setForm({
      date: shiftDateOnly(shift.startTime),
      startTime: shift.startTime.includes('T') ? shift.startTime.split('T')[1].substring(0,5) : '',
      endTime: shift.endTime.includes('T') ? shift.endTime.split('T')[1].substring(0,5) : '',
      taskDescription: shift.taskDescription ?? '',
      branchId: shift.branchId ?? '',
    });
    setEditingShift(shift);
    setIsAddOpen(false);
  };

  const openAdd = () => { setForm(blankForm()); setEditingShift(null); setIsAddOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: CreateShiftRequest = {
        staff: { id: row.staffId },
        startTime: `${form.date}T${form.startTime}:00`,
        endTime: `${form.date}T${form.endTime}:00`,
        taskDescription: form.taskDescription,
        orgId: orgId || undefined,
        branchId: form.branchId || undefined,
      };
      const saved = editingShift?.id
        ? await updateShift(editingShift.id, payload)
        : await createShift(payload);
      onShiftSaved(saved, !editingShift?.id);
      setEditingShift(null); setIsAddOpen(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (shiftId: string) => {
    if (!window.confirm('Delete this shift?')) return;
    setDeleting(shiftId);
    try { await deleteShift(shiftId); onShiftDeleted(shiftId); }
    finally { setDeleting(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col overflow-hidden border-l border-violet-200/30 dark:border-violet-800/20"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-700 to-purple-800 px-5 py-4 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-white font-black text-base">{row.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <RoleBadge role={row.role} />
              {row.branchName && (
                <span className="text-violet-200 text-[10px] font-semibold flex items-center gap-1">
                  <Building2 className="w-3 h-3" />{row.branchName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-violet-200 text-[11px] flex-wrap">
              {row.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{row.email}</span>}
              {row.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{row.phone}</span>}
            </div>
            {row.userCode && (
              <span className="text-violet-300 text-[10px] font-mono flex items-center gap-1 mt-1">
                <Hash className="w-3 h-3" />{row.userCode}
              </span>
            )}
            <span className="mt-1 inline-block bg-violet-500/30 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {row.shifts.length} shifts · {row.totalAttendance} present
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inline form */}
        {(isAddOpen || editingShift) && (
          <form onSubmit={handleSave} className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-3 shrink-0">
            <p className="text-xs font-black text-zinc-700 dark:text-zinc-300">{editingShift ? '✏️ Edit Shift' : '➕ New Shift'}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 block mb-1">Date</label>
                <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 block mb-1">Start</label>
                <input type="time" required value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 block mb-1">End</label>
                <input type="time" required value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 block mb-1">Branch</label>
                <select value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="">-- Default --</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 block mb-1">Task</label>
                <input value={form.taskDescription} onChange={e => setForm(f => ({ ...f, taskDescription: e.target.value }))}
                  placeholder="e.g. Front Desk, Training Floor…"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => { setEditingShift(null); setIsAddOpen(false); }}
                className="flex-1 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-600 text-xs font-bold hover:bg-zinc-100 transition">Cancel</button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black disabled:opacity-50 flex items-center justify-center gap-1.5 transition">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {editingShift ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {/* Shifts list */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
            <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">Shifts in Range ({row.shifts.length})</span>
            <button onClick={openAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black transition">
              <Plus className="w-3 h-3" /> Add Shift
            </button>
          </div>
          {row.shifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <Calendar className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-semibold">No shifts in this range</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {row.shifts.map(shift => (
                <li key={shift.id} className={`px-5 py-3.5 flex items-start gap-3 group transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${editingShift?.id === shift.id ? 'bg-violet-50 dark:bg-violet-950/30' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{formatDate(shift.startTime)}</span>
                      {shift.branchId && (
                        <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-0.5">
                          <Building2 className="w-2.5 h-2.5" />
                          {shift.staff?.branch?.name ?? branches.find(b => b.id === shift.branchId)?.name ?? ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-violet-600 dark:text-violet-400">
                      <Clock className="w-3 h-3" />
                      {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
                    </div>
                    {shift.taskDescription && (
                      <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">📝 {shift.taskDescription}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(shift)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => shift.id && handleDelete(shift.id)} disabled={deleting === shift.id}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition disabled:opacity-40" title="Delete">
                      {deleting === shift.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Roster component
// ─────────────────────────────────────────────────────────────────────────────

export const Roster: React.FC = () => {
  const { triggerAnnouncement, selectedBranchId } = useOutletContext<{
    triggerAnnouncement: (msg: string) => void;
    selectedBranchId: string;
  }>();

  // Default range = this month
  const now = new Date();
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}-01`;
  const defaultTo = toYMD(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: defaultFrom, to: defaultTo });
  const [showPicker, setShowPicker] = useState(false);

  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [orgId, setOrgId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [selectedRow, setSelectedRow] = useState<StaffRow | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, number>>({});
  const [attendanceLoading, setAttendanceLoading] = useState<Set<string>>(new Set());

  // Quick-add modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    staffId: '', branchId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00', endTime: '17:00', taskDescription: '',
  });

  // ── Load data ─────────────────────────────────────────────────────────────

  const load = useCallback(async (oid: string, from: string, to: string) => {
    setIsLoading(true);
    try {
      const [s, stf, brs] = await Promise.all([
        getShiftsByOrgAndDateRange(oid, from, to),
        getStaff(),
        getAdminBranches(),
      ]);
      setBranches(Array.isArray(brs) ? brs : []);
      setStaff(Array.isArray(stf) ? stf : []);
      setShifts(Array.isArray(s) ? s : []);
    } catch (err: any) {
      triggerAnnouncement(`Failed to load roster: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [triggerAnnouncement]);

  useEffect(() => {
    getMyOrg().then(org => {
      if (org?.id) { setOrgId(org.id); load(org.id, dateRange.from, dateRange.to); }
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (orgId) load(orgId, dateRange.from, dateRange.to);
  }, [dateRange, orgId, load]);

  useEffect(() => {
    if (selectedBranchId && selectedBranchId !== 'ALL') setFilterBranch(selectedBranchId);
  }, [selectedBranchId]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSelectedRow(null); setIsModalOpen(false); setShowPicker(false); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // ── Attendance ────────────────────────────────────────────────────────────

  const fetchAttendance = useCallback(async (sid: string) => {
    if (attendanceMap[sid] !== undefined || attendanceLoading.has(sid)) return;
    setAttendanceLoading(prev => new Set(prev).add(sid));
    try {
      const r = await getUserAttendance(sid);
      setAttendanceMap(prev => ({ ...prev, [sid]: r.totalElements }));
    } catch {
      setAttendanceMap(prev => ({ ...prev, [sid]: 0 }));
    } finally {
      setAttendanceLoading(prev => { const n = new Set(prev); n.delete(sid); return n; });
    }
  }, [attendanceMap, attendanceLoading]);

  // ── Build rows ────────────────────────────────────────────────────────────

  const staffRows: StaffRow[] = useMemo(() => {
    const map = new Map<string, StaffRow>();
    const activeBranch = filterBranch !== 'ALL' ? filterBranch : (selectedBranchId !== 'ALL' ? selectedBranchId : 'ALL');

    for (const shift of shifts) {
      const sid = shift.staff?.id ?? ''; if (!sid) continue;
      const shiftBranch = shift.branchId ?? shift.staff?.branch?.id ?? '';
      if (activeBranch !== 'ALL' && shiftBranch !== activeBranch) continue;

      if (!map.has(sid)) {
        const stf = staff.find(s => s.id === sid);
        const branchId = shift.branchId ?? shift.staff?.branch?.id ?? stf?.branchId ?? '';
        const branchObj = branches.find(b => b.id === branchId);
        map.set(sid, {
          staffId: sid,
          name: shift.staff?.name ?? stf?.name ?? 'Unknown',
          role: shift.staff?.role ?? stf?.role ?? stf?.designation ?? '—',
          email: shift.staff?.email ?? stf?.email ?? '',
          phone: shift.staff?.phone ?? stf?.phone ?? '',
          userCode: shift.staff?.userCode ?? stf?.code ?? '',
          branchName: shift.staff?.branch?.name ?? branchObj?.name ?? stf?.branchName ?? '',
          shifts: [],
          totalAttendance: attendanceMap[sid] ?? 0,
          attendanceLoading: attendanceLoading.has(sid),
        });
      }
      map.get(sid)!.shifts.push(shift);
    }

    let rows = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r => r.name.toLowerCase().includes(q) || r.role.toLowerCase().includes(q) || r.branchName.toLowerCase().includes(q));
    }
    return rows;
  }, [shifts, staff, branches, filterBranch, selectedBranchId, search, attendanceMap, attendanceLoading]);

  useEffect(() => { staffRows.forEach(r => fetchAttendance(r.staffId)); }, [staffRows]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleShiftSaved = useCallback((saved: StaffShift, isNew: boolean) => {
    setShifts(prev => isNew ? [...prev, saved] : prev.map(s => s.id === saved.id ? saved : s));
    setSelectedRow(prev => {
      if (!prev) return prev;
      const updatedShifts = isNew ? [...prev.shifts, saved] : prev.shifts.map(s => s.id === saved.id ? saved : s);
      return { ...prev, shifts: updatedShifts };
    });
    triggerAnnouncement(isNew ? 'Shift added.' : 'Shift updated.');
  }, [triggerAnnouncement]);

  const handleShiftDeleted = useCallback((shiftId: string) => {
    setShifts(prev => prev.filter(s => s.id !== shiftId));
    setSelectedRow(prev => prev ? { ...prev, shifts: prev.shifts.filter(s => s.id !== shiftId) } : prev);
    triggerAnnouncement('Shift removed.');
  }, [triggerAnnouncement]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staffId) return;
    setIsSaving(true);
    try {
      const stf = staff.find(s => s.id === form.staffId);
      const saved = await createShift({
        staff: { id: form.staffId },
        startTime: `${form.date}T${form.startTime}:00`,
        endTime: `${form.date}T${form.endTime}:00`,
        taskDescription: form.taskDescription,
        orgId: orgId || undefined,
        branchId: form.branchId || stf?.branchId || undefined,
      });
      handleShiftSaved(saved, true);
      setIsModalOpen(false);
      setForm({ staffId:'', branchId:'', date: new Date().toISOString().split('T')[0], startTime:'09:00', endTime:'17:00', taskDescription:'' });
    } catch (err: any) {
      triggerAnnouncement(`Failed: ${err.message}`);
    } finally { setIsSaving(false); }
  };

  // ── Range display ─────────────────────────────────────────────────────────

  const rangeLabel = useMemo(() => {
    const f = fromYMD(dateRange.from);
    const t = fromYMD(dateRange.to);
    return `${formatDisplay(f)} → ${formatDisplay(t)}`;
  }, [dateRange]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-violet-600 dark:text-violet-400" /> Staff Shift Roster
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Date-range shift schedule with attendance summary.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-zinc-500" />
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
              className="bg-transparent border-none text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none cursor-pointer">
              <option value="ALL">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <button onClick={() => orgId && load(orgId, dateRange.from, dateRange.to)}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-sm" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition shadow-lg shadow-violet-500/20 active:scale-95">
            <Plus className="w-4 h-4" /> Assign Shift
          </button>
        </div>
      </div>

      {/* ── Zoomcar Date Range Bar ── */}
      <button
        type="button"
        onClick={() => setShowPicker(true)}
        className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-600 transition shadow-sm group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
            <CalendarRange className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-left">
            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date Range</div>
            <div className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-0.5">{rangeLabel}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest group-hover:underline">
            Change
          </span>
          <ChevronDown className="w-4 h-4 text-emerald-500" />
        </div>
      </button>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, role, branch…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500" />
      </div>

      {/* ── Table ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-zinc-400">
          <RefreshCw className="w-6 h-6 animate-spin mr-2 text-violet-600" />
          <span className="font-semibold text-sm">Loading roster…</span>
        </div>
      ) : staffRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-semibold">No shifts in this date range</p>
          <p className="text-xs mt-1 opacity-60">Click the range bar above to adjust dates, or "Assign Shift" to add one.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[780px]">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  {['#','Name','Role','Shift Times','Attendance','Dates','Details'].map((h, i) => (
                    <th key={i} className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-zinc-500 ${i === 4 ? 'text-center' : ''} ${i === 6 ? 'text-center' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {staffRows.map((row, idx) => {
                  const uniqueTimes = Array.from(new Set(row.shifts.map(s => `${formatTime(s.startTime)}–${formatTime(s.endTime)}`)));
                  const dates = row.shifts.map(s => shiftDateOnly(s.startTime)).sort().slice(0, 6);
                  const extra = row.shifts.length - dates.length;
                  return (
                    <tr key={row.staffId} className="group hover:bg-violet-50/60 dark:hover:bg-violet-950/20 transition cursor-pointer" onClick={() => setSelectedRow(row)}>
                      <td className="px-4 py-3.5 text-zinc-400 font-bold text-xs">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <div className="font-black text-zinc-900 dark:text-zinc-100 leading-tight">{row.name}</div>
                            {row.userCode && <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{row.userCode}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <RoleBadge role={row.role} />
                        {row.branchName && (
                          <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                            <Building2 className="w-2.5 h-2.5" />{row.branchName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          {uniqueTimes.slice(0, 2).map((t, i) => (
                            <div key={i} className="flex items-center gap-1 text-[11px] font-bold text-violet-600 dark:text-violet-400">
                              <Clock className="w-3 h-3 shrink-0" />{t}
                            </div>
                          ))}
                          {uniqueTimes.length > 2 && <div className="text-[10px] text-zinc-400">+{uniqueTimes.length - 2} more</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {row.attendanceLoading
                          ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400 mx-auto" />
                          : (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-lg font-black text-zinc-900 dark:text-zinc-100 leading-none">{attendanceMap[row.staffId] ?? '—'}</span>
                              <span className="text-[9px] text-zinc-400 font-semibold">sessions</span>
                            </div>
                          )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {dates.map((d, i) => (
                            <span key={i} className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center justify-center">
                              {new Date(d).getDate()}
                            </span>
                          ))}
                          {extra > 0 && (
                            <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[9px] font-black flex items-center justify-center">+{extra}</span>
                          )}
                          <span className="text-[10px] text-zinc-400 self-center ml-1 font-semibold">({row.shifts.length})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button onClick={e => { e.stopPropagation(); setSelectedRow(row); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-violet-100 dark:group-hover:bg-violet-950/50 text-zinc-600 dark:text-zinc-400 group-hover:text-violet-700 dark:group-hover:text-violet-300 text-[10px] font-black transition">
                          View <ChevronDown className="w-3 h-3 -rotate-90" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-semibold">
            <span>{staffRows.length} staff · {shifts.length} shifts · {rangeLabel}</span>
            <span>Click a row to view / edit shifts</span>
          </div>
        </div>
      )}

      {/* ── Date Range Picker ── */}
      {showPicker && (
        <DateRangePicker
          value={dateRange}
          onApply={(from, to) => { setDateRange({ from, to }); setShowPicker(false); }}
          onCancel={() => setShowPicker(false)}
        />
      )}

      {/* ── Quick Add Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-violet-600 to-purple-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                <span className="font-black text-base">Assign Staff Shift</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleQuickAdd} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Staff Member *</label>
                <select required value={form.staffId}
                  onChange={e => { const s = staff.find(x => x.id === e.target.value); setForm(f => ({ ...f, staffId: e.target.value, branchId: s?.branchId ?? f.branchId })); }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="">Select staff…</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name} — {s.designation ?? s.role ?? 'Staff'}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Branch</label>
                <select value={form.branchId} onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="">-- Default --</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Date *</label>
                <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Start *</label>
                  <input type="time" required value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">End *</label>
                  <input type="time" required value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">Task</label>
                <input value={form.taskDescription} onChange={e => setForm(f => ({ ...f, taskDescription: e.target.value }))}
                  placeholder="e.g. Training Floor, Front Desk…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">Cancel</button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition">
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  Assign Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Staff Drawer ── */}
      {selectedRow && (
        <StaffDetailDrawer
          row={selectedRow} staff={staff} branches={branches} orgId={orgId}
          onClose={() => setSelectedRow(null)}
          onShiftSaved={handleShiftSaved}
          onShiftDeleted={handleShiftDeleted}
        />
      )}
    </div>
  );
};
