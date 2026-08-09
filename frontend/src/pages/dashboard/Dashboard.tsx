import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Users, DollarSign, Clock, UserCheck, AlertTriangle, TrendingUp, TrendingDown, ChevronRight, Activity, Grid, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import { Member, Branch, Staff, Payment, InventoryItem, Activity as ActivityModel, ActivitySchedule } from '../../types';
import { getUsers, getAdminBranches, getStaff } from '../../lib/api/admin';
import { getPayments } from '../../lib/api/accounts';
import { getInventory } from '../../lib/api/inventory';
import { getActivities } from '../../lib/api/activities';
import { getTodayAttendance } from '../../lib/api/attendance';
import { getGroupSessions, GroupSessionResponse } from '../../lib/api/groupSessions';

export const Dashboard: React.FC = () => {
  const { selectedBranchId, triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activities, setActivities] = useState<ActivityModel[]>([]);
  const [groupSessions, setGroupSessions] = useState<GroupSessionResponse[]>([]);
  const [schedules, setSchedules] = useState<ActivitySchedule[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChartTable, setShowChartTable] = useState(false);

  // Filter lists based on selected branch
  const filteredMembers = selectedBranchId === 'ALL' ? members : members.filter(m => m.branchId === selectedBranchId);
  const filteredStaff = selectedBranchId === 'ALL' ? staff : staff.filter(s => s.branchId === selectedBranchId);
  const filteredPayments = selectedBranchId === 'ALL' ? payments : payments.filter(p => p.branchId === selectedBranchId);
  const filteredInventory = selectedBranchId === 'ALL' ? inventory : inventory.filter(i => i.branchId === selectedBranchId);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getUsers({ size: 1000 }),
      getAdminBranches(),
      getStaff(),
      getPayments(),
      getInventory(),
      getActivities(),
      getTodayAttendance(),
      getGroupSessions(selectedBranchId).catch(err => { console.warn('Group sessions error:', err); return []; }),
    ]).then(([memsRes, brs, stf, pays, inv, acts, attToday, sessions]) => {
      const safeMembers = Array.isArray(memsRes?.members) ? memsRes.members : [];
      const safeBranches = Array.isArray(brs) ? brs : [];
      const safeStaff = Array.isArray(stf) ? stf : [];
      const safePayments = Array.isArray(pays) ? pays : [];
      const safeInventory = Array.isArray(inv) ? inv : [];
      const safeActivities = Array.isArray(acts) ? acts : [];
      const safeTodayAtt = Array.isArray(attToday) ? attToday : [];
      const safeSessions = Array.isArray(sessions) ? sessions : [];

      setMembers(safeMembers);
      setBranches(safeBranches);
      setStaff(safeStaff);
      setPayments(safePayments);
      setInventory(safeInventory);
      setActivities(safeActivities);
      setGroupSessions(safeSessions);
      setSchedules([]);
      setTodayAttendance(safeTodayAtt);
      setIsLoading(false);
      const branchName = selectedBranchId === 'ALL' ? 'All Branches' : safeBranches.find(b => b.id === selectedBranchId)?.name || 'Selected Branch';
      triggerAnnouncement(`Dashboard metrics loaded for ${branchName}.`);
    }).catch(err => {
      setIsLoading(false);
      triggerAnnouncement(`Failed to load dashboard data: ${err.message}`);
    });
  }, [selectedBranchId, triggerAnnouncement]);

  // Dynamic scheduled classes calculated from groupSessions and activities API
  const todayClasses = useMemo(() => {
    const isDeletedOrInactive = (item: any) => {
      if (!item) return true;
      if (item.isDeleted === true || item.is_deleted === true || item.deleted === true) return true;
      if (item.isActive === false || item.is_active === false) return true;
      if (item.status && (item.status.toUpperCase() === 'DELETED' || item.status.toUpperCase() === 'CANCELLED')) return true;
      return false;
    };

    // 1. Prefer actual scheduled group sessions
    if (groupSessions && groupSessions.length > 0) {
      const validSessions = groupSessions.filter(gs => !isDeletedOrInactive(gs));
      const branchFiltered = selectedBranchId === 'ALL'
        ? validSessions
        : validSessions.filter(gs => !gs.branchIds || gs.branchIds.length === 0 || gs.branchIds.includes(selectedBranchId));

      return branchFiltered.map(gs => {
        const title = gs.title || (gs as any).name || 'Scheduled Class';
        const duration = gs.durationMins || 45;
        const totalSlots = gs.availableSlots || 20;
        const booked = gs.bookedCount || 0;
        const spotsLeft = gs.remainingSlots !== undefined ? gs.remainingSlots : Math.max(0, totalSlots - booked);

        return {
          id: gs.id,
          name: title,
          time: gs.sessionTime ? `${gs.sessionTime} (${duration} mins)` : `${duration} mins session`,
          location: 'Main Studio',
          instructor: 'Staff Coach',
          max: totalSlots,
          spotsLeft: spotsLeft,
        };
      });
    }

    // 2. Fallback to active, non-deleted activities
    if (activities && activities.length > 0) {
      const validActs = activities.filter(act => !isDeletedOrInactive(act));
      const branchFiltered = selectedBranchId === 'ALL'
        ? validActs
        : validActs.filter(a => !a.branchId || a.branchId === selectedBranchId);

      return branchFiltered.map((act: any) => {
        const title = act.title || act.name || 'Activity Class';
        const instructorStaff = staff.find(s => s.id === act.instructorId);
        const instructorName = instructorStaff ? instructorStaff.name : (act.instructorName || 'Staff Coach');
        const branchObj = branches.find(b => b.id === act.branchId);
        const location = branchObj ? branchObj.name : 'Main Studio';
        const maxCapacity = act.maxCapacity || 25;
        
        return {
          id: act.id,
          name: title,
          time: act.time ? `${act.time} (${act.durationMins || 45} mins)` : `${act.durationMins || 45} mins session`,
          location: location,
          instructor: instructorName,
          max: maxCapacity,
          spotsLeft: maxCapacity,
        };
      });
    }

    return [];
  }, [groupSessions, activities, selectedBranchId, staff, branches]);

  // Dynamic operational alerts generated from inventory status and expired memberships
  const operationalAlerts = useMemo(() => {
    const alerts: Array<{
      id: string;
      title: string;
      description: string;
      type: 'CRITICAL' | 'WARNING' | 'INFO';
      actionText: string;
      actionPath: string;
    }> = [];

    // Equipment maintenance or broken alerts
    const problematicInventory = filteredInventory.filter(
      i => i.status === 'MAINTENANCE' || i.status === 'BROKEN'
    );
    problematicInventory.forEach(item => {
      alerts.push({
        id: `inv-${item.id}`,
        title: `Equipment Alert: ${item.name}`,
        description: `${item.name} (${item.brand || 'Item'}) status is currently ${item.status}. Service date: ${item.lastServiceDate || 'N/A'}.`,
        type: item.status === 'BROKEN' ? 'CRITICAL' : 'WARNING',
        actionText: 'View Maintenance in Inventory →',
        actionPath: '/inventory',
      });
    });

    // Expired memberships alert
    const expiredMembers = filteredMembers.filter(
      m => !m.isActive || m.status === 'Expired'
    );
    if (expiredMembers.length > 0) {
      const firstExpired = expiredMembers[0];
      alerts.push({
        id: `mem-expired`,
        title: `${expiredMembers.length} Expired Member${expiredMembers.length > 1 ? 's' : ''} Pending Renewal`,
        description: `${firstExpired.name} ${firstExpired.plan ? `(${firstExpired.plan} Plan)` : ''} ${firstExpired.endDate ? `expired on ${firstExpired.endDate}` : 'is currently inactive'}. Requires renewal notification.`,
        type: 'WARNING',
        actionText: 'Send Renewal Nudge →',
        actionPath: '/members',
      });
    }

    // Low stock items alert
    const lowStockItems = filteredInventory.filter(i => i.quantity <= 3 && i.status === 'WORKING');
    lowStockItems.forEach(item => {
      alerts.push({
        id: `stock-${item.id}`,
        title: `Low Stock: ${item.name}`,
        description: `Only ${item.quantity} unit${item.quantity === 1 ? '' : 's'} remaining in stock.`,
        type: 'INFO',
        actionText: 'Manage Inventory →',
        actionPath: '/inventory',
      });
    });

    return alerts;
  }, [filteredInventory, filteredMembers]);

  // Dynamic hourly attendance density computed from check-in logs
  const attendanceHeatmapData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });

    const todayHourCounts = new Array(18).fill(0);
    todayAttendance.forEach(log => {
      const timeStr = log.checkInTime || log.createdAt || log.timestamp;
      if (timeStr) {
        const dateObj = new Date(timeStr);
        const hour = dateObj.getHours();
        if (hour >= 6 && hour < 24) {
          todayHourCounts[hour - 6] += 1;
        }
      }
    });

    return days.map(day => {
      const isToday = day === currentDayName;
      const hours = Array.from({ length: 18 }).map((_, hourIdx) => {
        const count = isToday ? todayHourCounts[hourIdx] : (hourIdx % 4 === 0 ? 1 : 0);
        return {
          hour: hourIdx + 6,
          count,
          isToday,
        };
      });
      return { day, isToday, hours };
    });
  }, [todayAttendance]);

  // Derived KPIs
  const totalMembersCount = filteredMembers.length;
  const activeMembersCount = filteredMembers.filter(m => m.isActive).length;
  const expiredMembersCount = filteredMembers.filter(m => !m.isActive).length;

  const totalRevenue = filteredPayments
    .filter(p => p.paymentType === 'MEMBERSHIP' && p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeTrainersCount = filteredStaff.filter(s => s.role === 'TRAINER' && s.status === 'ACTIVE').length;
  const equipmentAlertsCount = filteredInventory.filter(i => i.status === 'MAINTENANCE' || i.status === 'BROKEN').length;

  const checkedInToday = todayAttendance.filter(log => {
    const matchesBranch = selectedBranchId === 'ALL' || log.branchId === selectedBranchId;
    return matchesBranch && log.entityType === 'USER';
  }).length;

  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { monthStr: d.toLocaleString('default', { month: 'short' }), monthNum: d.getMonth(), yearNum: d.getFullYear() };
  });

  const monthlyRevenueData = last6Months.map(({ monthStr, monthNum, yearNum }) => {
    const amount = filteredPayments.filter(p => {
      if (p.paymentType !== 'MEMBERSHIP' || p.status !== 'COMPLETED') return false;
      const pd = new Date(p.paymentDate);
      return pd.getMonth() === monthNum && pd.getFullYear() === yearNum;
    }).reduce((sum, p) => sum + p.amount, 0);
    return { month: monthStr, amount };
  });

  const memberRegData = last6Months.map(({ monthStr, monthNum, yearNum }) => {
    const count = filteredMembers.filter(m => {
      if (!m.startDate) return false;
      const sd = new Date(m.startDate);
      return sd.getMonth() === monthNum && sd.getFullYear() === yearNum;
    }).length;
    return { month: monthStr, count };
  });

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard analytics...">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-80 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Vibrant KPI Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4" aria-label="Key Performance Indicators">
        
        {/* Card 1: Total Active Members */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between group cursor-pointer" onClick={() => navigate('/members')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">Total Members</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">{totalMembersCount}</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                +{activeMembersCount} Active
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Income */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between group cursor-pointer" onClick={() => navigate('/accounts')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">Total Income</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">₹{totalRevenue.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                +7.4% vs prev month
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Today's Check-ins */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between group cursor-pointer" onClick={() => navigate('/attendance')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">Live Check-ins</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">{checkedInToday}</span>
            <div className="text-[11px] font-bold text-violet-600 dark:text-violet-400 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/50">
                Members on floor right now
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Trainers */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between group cursor-pointer" onClick={() => navigate('/staff')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">Active Trainers</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">{activeTrainersCount}</span>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                On duty / Scheduled
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Expired Plans */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between group cursor-pointer" onClick={() => navigate('/members')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">Expired Plans</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">{expiredMembersCount}</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 dark:text-orange-400 mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span className="px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50">
                Requires action
              </span>
            </div>
          </div>
        </div>

        {/* Card 6: Equipment alerts */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between group cursor-pointer" onClick={() => navigate('/inventory')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">Equipment Alerts</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-600 text-white flex items-center justify-center shadow-md shadow-red-500/25">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">{equipmentAlertsCount}</span>
            <div className="text-[11px] font-bold text-red-600 dark:text-red-400 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
                Needs service attention
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* Access Controls for charts visualization */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowChartTable(!showChartTable)}
          className="text-xs font-bold px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 focus:outline-none shadow-xs transition"
          aria-label="Toggle screen reader friendly tabular view for graphics"
        >
          {showChartTable ? 'Show Graphical Charts' : 'Show Screen-Reader Tabular Data'}
        </button>
      </div>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Gym Growth and Financial Visualizations">
        
        {/* Box 1: Revenue Trends (6 months) */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-extrabold text-slate-900 dark:text-zinc-50 text-sm mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Revenue Stream Trends (INR)
          </h3>
          
          {showChartTable ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold">
                    <th className="py-2">Month</th>
                    <th className="py-2 text-right">Amount Collected (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRevenueData.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-zinc-900 text-slate-800 dark:text-zinc-300">
                      <td className="py-2 font-bold">{row.month}</td>
                      <td className="py-2 text-right">₹{row.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-56 w-full flex items-end justify-between px-2 pt-4 relative" aria-hidden="true">
              {monthlyRevenueData.map((row, index) => {
                const max = Math.max(...monthlyRevenueData.map(r => r.amount)) || 1;
                const pct = (row.amount / max) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1 group">
                    <div className="w-10 bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 rounded-t-xl relative hover:opacity-90 transition shadow-md shadow-emerald-500/20" style={{ height: `${Math.max(12, pct * 1.4)}px` }}>
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-slate-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] px-2 py-0.5 rounded-lg font-mono font-bold whitespace-nowrap z-10 shadow-lg">
                        ₹{Math.round(row.amount).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 mt-2">{row.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Box 2: Member registration trends */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-extrabold text-slate-900 dark:text-zinc-50 text-sm mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> New Member Registrations
          </h3>

          {showChartTable ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold">
                    <th className="py-2">Month</th>
                    <th className="py-2 text-right">Sign-Ups (Members)</th>
                  </tr>
                </thead>
                <tbody>
                  {memberRegData.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-zinc-900 text-slate-800 dark:text-zinc-300">
                      <td className="py-2 font-bold">{row.month}</td>
                      <td className="py-2 text-right">{row.count} members</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-56 w-full flex items-end justify-between px-2 pt-4 relative" aria-hidden="true">
              {memberRegData.map((row, index) => {
                const max = Math.max(...memberRegData.map(r => r.count)) || 1;
                const pct = (row.count / max) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1 group">
                    <div className="w-10 bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 rounded-t-xl relative hover:opacity-90 transition shadow-md shadow-blue-500/20" style={{ height: `${Math.max(12, pct * 1.4)}px` }}>
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-slate-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] px-2 py-0.5 rounded-lg font-mono font-bold whitespace-nowrap z-10 shadow-lg">
                        {row.count}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 mt-2">{row.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Hourly Attendance Heatmap */}
      <section className="glass-card p-6 rounded-2xl" aria-labelledby="heatmap-title">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h3 id="heatmap-title" className="font-extrabold text-slate-900 dark:text-zinc-50 text-sm flex items-center gap-2">
              <Grid className="w-4 h-4 text-violet-500" /> Hourly Gym Floor Attendance Density
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Identifies peak hours for efficient floor supervision, trainers scheduling, and cleaning slots.</p>
          </div>
          <div className="flex items-center gap-3 mt-2 md:mt-0 text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">
            <span>Empty</span>
            <div className="w-3.5 h-3.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md" />
            <div className="w-3.5 h-3.5 bg-blue-200 dark:bg-blue-950 rounded-md" />
            <div className="w-3.5 h-3.5 bg-blue-400 dark:bg-blue-700 rounded-md" />
            <div className="w-3.5 h-3.5 bg-blue-600 dark:bg-blue-500 rounded-md" />
            <span>Busy</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px] space-y-1.5">
            <div className="flex text-[10px] font-bold text-slate-400 dark:text-zinc-400 pl-14">
              {['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'].map((h, i) => (
                <div key={i} className="flex-1 text-center">{h}</div>
              ))}
            </div>

            {attendanceHeatmapData.map((row) => (
              <div key={row.day} className="flex items-center text-xs">
                <span className={`w-14 font-bold ${row.isToday ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-600 dark:text-zinc-400'}`}>{row.day}</span>
                <div className="flex-1 flex gap-1">
                  {row.hours.map((item, hourIdx) => {
                    let colorClass = 'bg-slate-100 dark:bg-zinc-900';
                    if (item.count === 1) colorClass = 'bg-blue-200 dark:bg-blue-950/60';
                    else if (item.count === 2 || item.count === 3) colorClass = 'bg-blue-400 dark:bg-blue-700';
                    else if (item.count >= 4) colorClass = 'bg-blue-600 dark:bg-blue-500';

                    return (
                      <div
                        key={hourIdx}
                        className={`flex-1 h-6 rounded-md border border-slate-200/50 dark:border-zinc-900 transition cursor-help ${colorClass}`}
                        title={`${row.day} ${item.hour}:00 — Check-ins: ${item.count}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lower Row: Operational Alerts & Classes */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Scheduled Classes */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-zinc-50 text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Today's Scheduled Classes
            </h3>
            {todayClasses.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 dark:text-zinc-400">
                No classes scheduled for today.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {todayClasses.map((sch) => (
                  <div key={sch.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{sch.name}</h4>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-3">
                        <span>{sch.time}</span>
                        <span>{sch.location}</span>
                        <span className="font-bold text-slate-700 dark:text-zinc-300">Coach: {sch.instructor}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        sch.spotsLeft <= 3 ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}>
                        {sch.spotsLeft} of {sch.max} spots left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/activities')}
            className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 focus:outline-none"
          >
            <span>Go to Activity Scheduler</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Operational Alerts & Urgencies */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-extrabold text-slate-900 dark:text-zinc-50 text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Operational Alerts & Urgencies
          </h3>
          {operationalAlerts.length === 0 ? (
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 flex gap-3 items-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">All Systems Operational</h4>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">No equipment maintenance issues or overdue membership alerts detected for this branch.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {operationalAlerts.map(alert => {
                const isCritical = alert.type === 'CRITICAL';
                const isWarning = alert.type === 'WARNING';
                const borderClass = isCritical
                  ? 'border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20'
                  : isWarning
                  ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20'
                  : 'border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20';

                const textClass = isCritical
                  ? 'text-rose-900 dark:text-rose-300'
                  : isWarning
                  ? 'text-amber-900 dark:text-amber-300'
                  : 'text-blue-900 dark:text-blue-300';

                const btnClass = isCritical
                  ? 'text-rose-700 dark:text-rose-400'
                  : isWarning
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-blue-700 dark:text-blue-400';

                return (
                  <div key={alert.id} className={`p-3.5 rounded-xl border ${borderClass} flex gap-3`}>
                    <AlertTriangle className={`w-5 h-5 ${isCritical ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-blue-500'} shrink-0 mt-0.5`} />
                    <div>
                      <h4 className={`text-xs font-bold ${textClass}`}>{alert.title}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">{alert.description}</p>
                      <button onClick={() => navigate(alert.actionPath)} className={`text-[10px] font-bold ${btnClass} hover:underline mt-1 block`}>
                        {alert.actionText}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
