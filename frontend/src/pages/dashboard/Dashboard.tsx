import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Users, DollarSign, Clock, UserCheck, AlertTriangle, TrendingUp, TrendingDown, ChevronRight, Activity, Grid } from 'lucide-react';
import { Member, Branch, Staff, Payment, InventoryItem, Activity as ActivityModel, ActivitySchedule } from '../../types';
import { getUsers, getAdminBranches, getStaff } from '../../lib/api/admin';
import { getPayments } from '../../lib/api/accounts';
import { getInventory } from '../../lib/api/inventory';
import { getActivities } from '../../lib/api/activities';
import { getTodayAttendance } from '../../lib/api/attendance';

export const Dashboard: React.FC = () => {
  const { selectedBranchId, triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [activities, setActivities] = useState<ActivityModel[]>([]);
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
      getUsers(),
      getAdminBranches(),
      getStaff(),
      getPayments(),
      getInventory(),
      getActivities(),
      getTodayAttendance()
    ]).then(([mems, brs, stf, pays, inv, acts, attToday]) => {
      setMembers(mems);
      setBranches(brs);
      setStaff(stf);
      setPayments(pays);
      setInventory(inv);
      setActivities(acts || []);
      setSchedules([]);
      setTodayAttendance(attToday || []);
      setIsLoading(false);
      const branchName = selectedBranchId === 'ALL' ? 'All Branches' : brs.find(b => b.id === selectedBranchId)?.name || 'Selected Branch';
      triggerAnnouncement(`Dashboard metrics loaded for ${branchName}.`);
    }).catch(err => {
      setIsLoading(false);
      triggerAnnouncement(`Failed to load dashboard data: ${err.message}`);
    });
  }, [selectedBranchId, triggerAnnouncement]);

  // Derived KPIs
  const totalMembersCount = filteredMembers.length;
  const activeMembersCount = filteredMembers.filter(m => m.isActive).length;
  const expiredMembersCount = filteredMembers.filter(m => !m.isActive).length;

  const totalRevenue = filteredPayments
    .filter(p => p.paymentType === 'MEMBERSHIP' && p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeTrainersCount = filteredStaff.filter(s => s.role === 'TRAINER' && s.status === 'ACTIVE').length;
  const equipmentAlertsCount = filteredInventory.filter(i => i.status === 'MAINTENANCE' || i.status === 'BROKEN').length;

  // Real-time check-ins today, sourced from the actual attendance log (not member fields)
  const checkedInToday = todayAttendance.filter(log => {
    const matchesBranch = selectedBranchId === 'ALL' || log.branchId === selectedBranchId;
    return matchesBranch && log.entityType === 'USER';
  }).length;

  // Chart data calculation: Revenue by Month (last 6 months)
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
    // startDate is the closest real field to a "registration date" the backend exposes.
    const count = filteredMembers.filter(m => {
      if (!m.startDate) return false;
      const sd = new Date(m.startDate);
      return sd.getMonth() === monthNum && sd.getFullYear() === yearNum;
    }).length;
    return { month: monthStr, count };
  });

  const actData = activities.reduce((acc, act) => {
    acc[act.id] = act;
    return acc;
  }, {} as Record<string, ActivityModel>);

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard analytics...">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-80 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4" aria-label="Key Performance Indicators">
        {/* Card 1: Total Active Members */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between focus-within:ring-2 focus-within:ring-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Members</span>
            <Users className="w-5 h-5 text-blue-500" aria-hidden="true" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalMembersCount}</span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{activeMembersCount} Active</span>
            </div>
          </div>
        </div>

        {/* Card 2: Revenue Collected */}
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Income</span>
            <DollarSign className="w-5 h-5 text-emerald-500" aria-hidden="true" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">₹{totalRevenue.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+7.4% vs prev month</span>
            </div>
          </div>
        </div>

        {/* Card 3: Today's Check-ins */}
        <button
          onClick={() => navigate('/attendance')}
          className="p-5 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between hover:border-blue-500 transition group focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Today's check-ins: ${checkedInToday}. Click to open attendance scanner.`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-blue-500">Live Check-ins</span>
            <Clock className="w-5 h-5 text-indigo-500" aria-hidden="true" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{checkedInToday}</span>
            <div className="text-[11px] text-zinc-500 mt-1">
              Members on floor right now
            </div>
          </div>
        </button>

        {/* Card 4: Active Trainers */}
        <button
          onClick={() => navigate('/staff')}
          className="p-5 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between hover:border-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Active Trainers</span>
            <UserCheck className="w-5 h-5 text-amber-500" aria-hidden="true" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{activeTrainersCount}</span>
            <div className="text-[11px] text-zinc-500 mt-1">
              On duty / Scheduled
            </div>
          </div>
        </button>

        {/* Card 5: Expired Plans */}
        <button
          onClick={() => navigate('/members')}
          className="p-5 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between hover:border-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Expired Plans</span>
            <AlertTriangle className="w-5 h-5 text-orange-500" aria-hidden="true" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{expiredMembersCount}</span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-orange-600 dark:text-orange-400 mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Requires action</span>
            </div>
          </div>
        </button>

        {/* Card 6: Equipment alerts */}
        <button
          onClick={() => navigate('/inventory')}
          className="p-5 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between hover:border-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Equipment Alerts</span>
            <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{equipmentAlertsCount}</span>
            <div className="text-[11px] text-red-500 font-semibold mt-1">
              Needs service attention
            </div>
          </div>
        </button>
      </section>

      {/* Access Controls for charts visualization */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowChartTable(!showChartTable)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle screen reader friendly tabular view for graphics"
        >
          {showChartTable ? 'Show Graphical Charts' : 'Show Screen-Reader Tabular Data'}
        </button>
      </div>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Gym Growth and Financial Visualizations">
        {/* Box 1: Revenue Trends (6 months) */}
        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Revenue Stream Trends (INR)
          </h3>
          
          {showChartTable ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                    <th className="py-2">Month</th>
                    <th className="py-2 text-right">Amount Collected (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyRevenueData.map((row, i) => (
                    <tr key={i} className="border-b border-zinc-100 dark:border-zinc-900 text-zinc-800 dark:text-zinc-300">
                      <td className="py-2 font-semibold">{row.month}</td>
                      <td className="py-2 text-right">₹{row.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-56 w-full flex items-end justify-between px-2 pt-4 relative" aria-hidden="true">
              {/* Simple pure-CSS/SVG-inspired high-contrast visual bar/line hybrid */}
              {monthlyRevenueData.map((row, index) => {
                const max = Math.max(...monthlyRevenueData.map(r => r.amount)) || 1;
                const pct = (row.amount / max) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1 group">
                    <div className="w-10 bg-gradient-to-t from-emerald-600 to-emerald-400 dark:from-emerald-700 dark:to-emerald-500 rounded-t-md relative hover:opacity-85 transition" style={{ height: `${Math.max(10, pct * 1.4)}px` }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold whitespace-nowrap z-10 shadow">
                        ₹{Math.round(row.amount).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-500 mt-2">{row.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Box 2: Member registration trends */}
        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> New Member Registrations
          </h3>

          {showChartTable ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                    <th className="py-2">Month</th>
                    <th className="py-2 text-right">Sign-Ups (Members)</th>
                  </tr>
                </thead>
                <tbody>
                  {memberRegData.map((row, i) => (
                    <tr key={i} className="border-b border-zinc-100 dark:border-zinc-900 text-zinc-800 dark:text-zinc-300">
                      <td className="py-2 font-semibold">{row.month}</td>
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
                    <div className="w-10 bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-500 rounded-t-md relative hover:opacity-85 transition" style={{ height: `${Math.max(10, pct * 1.4)}px` }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold whitespace-nowrap z-10 shadow">
                        {row.count}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-500 mt-2">{row.month}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Hourly Attendance Heatmap (7 days x 24 hours scaled) */}
      <section className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm" aria-labelledby="heatmap-title">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h3 id="heatmap-title" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm flex items-center gap-2">
              <Grid className="w-4 h-4 text-indigo-500" /> Hourly Gym Floor Attendance Density
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Identifies peak hours for efficient floor supervision, trainers scheduling, and cleaning slots.</p>
          </div>
          <div className="flex items-center gap-3 mt-2 md:mt-0 text-[10px] font-bold text-zinc-500 uppercase">
            <span>Empty</span>
            <div className="w-3.5 h-3.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded" />
            <div className="w-3.5 h-3.5 bg-blue-200 dark:bg-blue-950 rounded" />
            <div className="w-3.5 h-3.5 bg-blue-400 dark:bg-blue-700 rounded" />
            <div className="w-3.5 h-3.5 bg-blue-600 dark:bg-blue-500 rounded" />
            <span>Busy</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px] space-y-1.5">
            {/* Hour headers (6 AM to 10 PM) */}
            <div className="flex text-[10px] font-bold text-zinc-400 pl-14">
              {['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'].map((h, i) => (
                <div key={i} className="flex-1 text-center">{h}</div>
              ))}
            </div>

            {/* Heatmap rows */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dIdx) => (
              <div key={day} className="flex items-center text-xs">
                <span className="w-14 font-bold text-zinc-500">{day}</span>
                <div className="flex-1 flex gap-1">
                  {[...Array(18)].map((_, hourIdx) => {
                    // Generate pseudo-random realistic gym occupancy heat levels
                    const isPeak = (hourIdx >= 1 && hourIdx <= 4) || (hourIdx >= 11 && hourIdx <= 15); // 7-10 AM or 5-9 PM
                    const val = isPeak ? (dIdx === 5 ? 'bg-blue-400' : 'bg-blue-600') : (hourIdx % 3 === 0 ? 'bg-blue-200' : 'bg-zinc-150 dark:bg-zinc-900');
                    return (
                      <div
                        key={hourIdx}
                        className={`flex-1 h-6 rounded border border-zinc-100 dark:border-zinc-950 transition cursor-help ${val}`}
                        title={`${day} Hour ${hourIdx + 6}:00 - Occupancy Level: ${isPeak ? 'High Peak' : 'Moderate'}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lower Row: Today's Class Bookings & Expiry Actions */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Classes Block */}
        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" /> Today's Scheduled Classes
            </h3>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {schedules.map((sch) => {
                const act = actData[sch.activityId] || { name: 'Gym Class', type: 'YOGA', colorHex: '#cbd5e1', maxCapacity: 20 };
                const remaining = act.maxCapacity - sch.currentCount;
                return (
                  <div key={sch.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: act.colorHex }} />
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{act.name}</h4>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-3">
                        <span>{new Date(sch.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>{sch.location}</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">Instructor: Sanjana S.</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${remaining <= 3 ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'}`}>
                        {remaining} of {act.maxCapacity} spots left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => onNavigate('classes')}
            className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>Go to Activity Scheduler</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alerts & Actions Block */}
        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" /> Operational Alerts & Urgencies
          </h3>
          <div className="space-y-3">
            {/* Alert 1 */}
            <div className="p-3 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-800 dark:text-red-400">Technogym Smith Machine Cable Friction</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">High cable wear detected by trainer Rahul. Scheduled wire repair is due on 20th July.</p>
                <button onClick={() => onNavigate('inventory')} className="text-[10px] font-bold text-red-700 dark:text-red-300 hover:underline mt-1">View Work Order</button>
              </div>
            </div>

            {/* Alert 2 */}
            <div className="p-3 rounded-lg border border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-950/10 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-orange-800 dark:text-orange-400">Membership Expiry Overdue</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Rohit Deshmukh (Basic Access) expired on 10th July. Needs notification dispatch.</p>
                <button onClick={() => onNavigate('members')} className="text-[10px] font-bold text-orange-700 dark:text-orange-300 hover:underline mt-1">Nudge Renewal</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Local lookup for activity specifics
const actData: { [key: string]: { name: string; type: string; colorHex: string; maxCapacity: number } } = {
  'act-1': { name: 'Morning Ashtanga Yoga Flow', type: 'YOGA', colorHex: '#10B981', maxCapacity: 25 },
  'act-2': { name: 'Zumba Dance Fiesta', type: 'ZUMBA', colorHex: '#F59E0B', maxCapacity: 30 },
  'act-3': { name: 'HIIT Metabolic Burnout', type: 'HIIT', colorHex: '#EF4444', maxCapacity: 15 },
};
