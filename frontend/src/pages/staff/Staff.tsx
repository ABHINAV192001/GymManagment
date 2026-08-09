import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Shield, Award, UserPlus, Power, Loader2, Mail, Phone, FileText, X, Building2, Calendar, Clock, CheckCircle2, DollarSign, Printer, Settings, AlertCircle, MinusCircle, PlusCircle } from 'lucide-react';
import { Staff, Branch } from '../../types';
import { getStaff, getAdminBranches, createStaff, updateStaff, getUserById } from '../../lib/api/admin';
import { getUserAttendance } from '../../lib/api/attendance';
import { createPayment, getStaffSalaryComponents } from '../../lib/api/accounts';
import { downloadPayslipPdf } from '../../lib/payslipPdf';
import { usePermissions } from '../../lib/usePermissions';
import { SearchableSelect } from '../../components/shared/SearchableSelect';
import { getUsers } from '../../lib/api/admin';
import { getRoles, assignRoleToStaff } from '../../lib/api/rbac';

interface PayrollSettings {
  defaultPtPercentage: number;
  enableAbsenceDeduction: boolean;
  defaultAbsencePenalty: number;
}

const getStoredPayrollSettings = (): PayrollSettings => {
  try {
    const saved = localStorage.getItem('gym_payroll_settings');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    defaultPtPercentage: 30,
    enableAbsenceDeduction: true,
    defaultAbsencePenalty: 0,
  };
};

export const StaffManagement: React.FC = () => {
  const { selectedBranchId, triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  const { canCreate } = usePermissions();
  
  const [staff, setStaff] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [payrollSettings, setPayrollSettings] = useState<PayrollSettings>(getStoredPayrollSettings());

  const handleSavePayrollSettings = (updated: PayrollSettings) => {
    const ptPct = Number(updated.defaultPtPercentage);
    if (isNaN(ptPct) || ptPct < 0 || ptPct > 100) {
      triggerAnnouncement('Default Trainer PT Percentage must be strictly between 0% and 100%.');
      return;
    }
    const clamped = {
      ...updated,
      defaultPtPercentage: Math.max(0, Math.min(100, ptPct))
    };
    setPayrollSettings(clamped);
    try {
      localStorage.setItem('gym_payroll_settings', JSON.stringify(clamped));
    } catch (e) {}
    triggerAnnouncement('Staff payroll & absence deduction settings saved successfully.');
    setIsSettingsOpen(false);
  };
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);

  // Selected Staff Details Slide-Over State
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<any | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Payslip simulation & disbursement states
  const [payslipStaff, setPayslipStaff] = useState<Staff | null>(null);
  const [customBossCut, setCustomBossCut] = useState<number>(0);
  const [customBossCutReason, setCustomBossCutReason] = useState<string>('');
  const [staffAttendanceLogs, setStaffAttendanceLogs] = useState<any[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  
  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-08"
  const [payslipPeriod, setPayslipPeriod] = useState(currentMonth);
  
  const [payslipPaymentMode, setPayslipPaymentMode] = useState<'BANK_TRANSFER' | 'UPI' | 'CASH' | 'CARD'>('BANK_TRANSFER');
  const [payslipRefNo, setPayslipRefNo] = useState('');
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [payslipData, setPayslipData] = useState<any>(null);
  const [isCalculatingPayslip, setIsCalculatingPayslip] = useState(false);

  // Dynamic New Staff Registration State (No hardcoded magic strings)
  const [newStaff, setNewStaff] = useState({
    userId: '',
    name: '',
    email: '',
    phone: '',
    joiningDate: '',
    role: '',
    baseSalary: 30000,
    salaryType: 'FIXED' as 'FIXED' | 'HYBRID' | 'COMMISSION',
    commissionRate: 15,
    certifications: '',
    specializations: '',
    branchId: '',
    documents: '',
    remarks: '',
    isPersonalTrainer: false,
    ptTrainerPercentage: 0,
  });

  const fetchStaffData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const effectiveBranchId = selectedBranchId !== 'ALL' ? selectedBranchId : undefined;
      const [stf, brs, usersRes, rolesRes] = await Promise.all([
        getStaff(effectiveBranchId),
        getAdminBranches(),
        getUsers({ size: 1000 }),
        getRoles()
      ]);
      setStaff(Array.isArray(stf) ? stf : []);
      setBranches(Array.isArray(brs) ? brs : []);
      setUsersList(usersRes?.members || []);
      
      // rolesRes might be an array or paginated object, extract the array
      const rolesArray = Array.isArray(rolesRes) ? rolesRes : (rolesRes?.content || []);
      setRolesList(rolesArray);
    } catch (err: any) {
      triggerAnnouncement(`Failed to load staff data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranchId, triggerAnnouncement]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Set default branch ID dynamically when branches load
  useEffect(() => {
    if (branches.length > 0 && !newStaff.branchId) {
      setNewStaff(prev => ({ ...prev, branchId: branches[0].id }));
    }
  }, [branches]);

  const filteredStaff = staff.filter((s) => {
    const matchesSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.phone || '').includes(search);
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    const matchesBranch = selectedBranchId === 'ALL' || s.branchId === selectedBranchId;
    return matchesSearch && matchesRole && matchesBranch && s.status !== 'TERMINATED';
  });

  // Handle staff row/card click -> calls GET /users/{id}
  const handleSelectStaff = async (staffMember: Staff) => {
    try {
      setIsLoadingDetail(true);
      setSelectedStaffDetail({ ...staffMember }); // show quick drawer state
      const detailedUser = await getUserById(staffMember.id);
      
      // Fetch attendance logs for detailed history
      try {
        const attRes = await getUserAttendance(staffMember.id);
        const logs = Array.isArray(attRes?.logs) ? attRes.logs : [];
        setSelectedStaffDetail({
          ...detailedUser,
          attendanceLogs: logs.length > 0 ? logs : ((detailedUser as any)?.attendanceLogs || []),
          attendanceCount: attRes?.totalElements ?? detailedUser?.attendanceCount ?? logs.length
        });
      } catch (attErr) {
        setSelectedStaffDetail(detailedUser);
      }
    } catch (err: any) {
      triggerAnnouncement(`Failed to load staff profile: ${err.message}`);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.phone) return;

    if (newStaff.isPersonalTrainer && newStaff.ptTrainerPercentage !== undefined && newStaff.ptTrainerPercentage !== null) {
      const ptVal = Number(newStaff.ptTrainerPercentage);
      if (isNaN(ptVal) || ptVal < 0 || ptVal > 100) {
        triggerAnnouncement('PT Income Sharing Percentage must be strictly between 0% and 100%.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const targetBranchId = newStaff.branchId || (branches[0]?.id || (selectedBranchId !== 'ALL' ? selectedBranchId : undefined));
      const created = await createStaff({
        userId: newStaff.userId,
        branchId: targetBranchId !== 'ALL' ? targetBranchId : undefined,
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role as any,
        status: 'ACTIVE',
        baseSalary: Number(newStaff.baseSalary),
        specializations: newStaff.specializations ? [newStaff.specializations] : [],
        joiningDate: newStaff.joiningDate || new Date().toISOString().split('T')[0],
        documents: newStaff.documents,
        remarks: newStaff.remarks,
        isPersonalTrainer: newStaff.isPersonalTrainer,
        ptTrainerPercentage: newStaff.ptTrainerPercentage,
      } as any);

      if (newStaff.role) {
        await assignRoleToStaff(created.id, newStaff.role);
      }

      triggerAnnouncement(`Staff member ${newStaff.name} onboarded successfully!`);
      setStaff(prev => [...prev, created]);
      setIsFormOpen(false);
      setNewStaff({
        userId: '',
        name: '',
        email: '',
        phone: '',
        joiningDate: '',
        role: '',
        baseSalary: 30000,
        salaryType: 'FIXED',
        commissionRate: 15,
        certifications: '',
        specializations: '',
        branchId: branches[0]?.id || '',
        documents: '',
        remarks: '',
        isPersonalTrainer: false,
        ptTrainerPercentage: 0,
      });
    } catch (err: any) {
      triggerAnnouncement(`Failed to onboard staff: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (s: Staff) => {
    try {
      const newStatus = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateStaff(s.id, { status: newStatus });
      setStaff(prev => prev.map(x => x.id === s.id ? { ...x, status: newStatus } : x));
      if (selectedStaffDetail && selectedStaffDetail.id === s.id) {
        setSelectedStaffDetail(prev => prev ? { ...prev, status: newStatus, isActive: newStatus === 'ACTIVE' } : null);
      }
      triggerAnnouncement(`Updated status for ${s.name} to ${newStatus}`);
    } catch (err: any) {
      triggerAnnouncement(`Failed to update status: ${err.message}`);
    }
  };

  useEffect(() => {
    async function fetchPayslip() {
      if (payslipStaff) {
        try {
          setIsCalculatingPayslip(true);
          setIsLoadingAttendance(true);
          const [data, attRes] = await Promise.all([
            getStaffSalaryComponents(payslipStaff.id, payslipPeriod).catch(() => null),
            getUserAttendance(payslipStaff.id).catch(() => ({ logs: [], totalElements: 0 }))
          ]);
          setPayslipData(data);
          setStaffAttendanceLogs(attRes?.logs || []);
        } catch (err: any) {
          triggerAnnouncement(`Failed to calculate payslip: ${err.message}`);
          setPayslipData(null);
          setStaffAttendanceLogs([]);
        } finally {
          setIsCalculatingPayslip(false);
          setIsLoadingAttendance(false);
        }
      } else {
        setPayslipData(null);
        setStaffAttendanceLogs([]);
        setCustomBossCut(0);
        setCustomBossCutReason('');
      }
    }
    fetchPayslip();
  }, [payslipStaff, payslipPeriod]);

  // Dynamic summary stats calculation (0 hardcoded values)
  const activeStaffList = staff.filter(s => s.status !== 'TERMINATED' && s.status !== 'INACTIVE');
  const totalActiveStaff = activeStaffList.length;
  const totalMonthlyPayroll = activeStaffList.reduce((sum, s) => sum + (s.baseSalary || s.salary || 0), 0);
  const avgBaseSalary = totalActiveStaff > 0 ? Math.round(totalMonthlyPayroll / totalActiveStaff) : 0;
  const totalTrainersCount = activeStaffList.filter(s => s.role === 'TRAINER').length;

  // Dynamic calculation helper for working days & absence deductions based on staff joiningDate/createdAt
  const calculateStaffWorkingDaysAndAbsences = (staffMember: any, period: string, presentCount: number) => {
    if (!staffMember) return { expectedWorkingDays: 0, absentDays: 0, joinedThisMonth: false, joiningDateStr: '' };

    const [yearStr, monthStr] = (period || new Date().toISOString().slice(0, 7)).split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const rawJoining = staffMember.joiningDate || staffMember.startDate || staffMember.createdAt;
    const joiningDate = rawJoining ? new Date(rawJoining) : firstDayOfMonth;
    
    firstDayOfMonth.setHours(0, 0, 0, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);
    joiningDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (joiningDate > lastDayOfMonth) {
      return { 
        expectedWorkingDays: 0, 
        absentDays: 0, 
        joinedThisMonth: false, 
        joiningDateStr: joiningDate.toISOString().split('T')[0] 
      };
    }

    const calcStartDate = joiningDate > firstDayOfMonth ? joiningDate : firstDayOfMonth;
    const calcEndDate = today < lastDayOfMonth ? today : lastDayOfMonth;

    if (calcEndDate < calcStartDate) {
      return { 
        expectedWorkingDays: 0, 
        absentDays: 0, 
        joinedThisMonth: joiningDate >= firstDayOfMonth,
        joiningDateStr: joiningDate.toISOString().split('T')[0]
      };
    }

    let workingDaysCount = 0;
    const curr = new Date(calcStartDate);
    while (curr <= calcEndDate) {
      const dayOfWeek = curr.getDay();
      if (dayOfWeek !== 0) { // Exclude Sundays
        workingDaysCount++;
      }
      curr.setDate(curr.getDate() + 1);
    }

    const absentDays = Math.max(0, workingDaysCount - presentCount);
    const joinedThisMonth = joiningDate >= firstDayOfMonth;

    return { 
      expectedWorkingDays: workingDaysCount, 
      absentDays, 
      joinedThisMonth,
      joiningDateStr: joiningDate.toISOString().split('T')[0]
    };
  };

  const handleDisburseSalary = async () => {
    if (!payslipStaff) return;
    try {
      setIsDisbursing(true);
      const refCode = payslipRefNo || `PAYROLL-${Date.now().toString().slice(-6)}`;

      const baseSalary = payslipData?.baseSalary ?? (payslipStaff.baseSalary || payslipStaff.salary || 5000);
      const ptCommission = payslipData?.ptCommission ?? 0;
      const dailyRate = Math.round(baseSalary / 30);
      
      const presentCount = staffAttendanceLogs.length;
      const { absentDays } = calculateStaffWorkingDaysAndAbsences(payslipStaff, payslipPeriod, presentCount);
      const leaveDeduction = payrollSettings.enableAbsenceDeduction ? Math.round(absentDays * dailyRate) : 0;
      const absencePenalty = Math.round(absentDays * payrollSettings.defaultAbsencePenalty);
      const bossCut = Number(customBossCut) || 0;
      const totalDeductions = leaveDeduction + absencePenalty + bossCut;
      const gross = baseSalary + ptCommission;
      const finalNetPay = Math.max(0, gross - totalDeductions);

      await createPayment({
        paymentType: 'SALARY',
        staffId: payslipStaff.id,
        amount: Math.round(finalNetPay),
        currency: 'INR',
        paymentMode: payslipPaymentMode,
        referenceNo: refCode,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'COMPLETED',
        notes: `Salary payout for ${payslipStaff.name} (${payslipPeriod}) - Net: ₹${finalNetPay} (Base: ₹${baseSalary}, PT Cut: ₹${ptCommission}, Leave Cut: ₹${leaveDeduction}, Custom Cut: ₹${bossCut}${customBossCutReason ? ` - ${customBossCutReason}` : ''})`,
      });

      triggerAnnouncement(`Salary payment of ₹${Math.round(finalNetPay).toLocaleString()} recorded for ${payslipStaff.name} and posted to Ledgers.`);

      // Trigger automatic PDF payslip download
      downloadPayslipPdf(payslipStaff, {
        base: baseSalary,
        sessions: 0,
        rate: payslipStaff.ptTrainerPercentage || payrollSettings.defaultPtPercentage || 30,
        commissionVal: ptCommission,
        gross: gross,
        pfDeduction: 0,
        ptTax: 0,
        leaveDeduction: leaveDeduction + absencePenalty,
        customDeduction: bossCut,
        netPay: finalNetPay,
        payPeriod: payslipPeriod,
        paymentMode: payslipPaymentMode,
        referenceNo: refCode,
        paidDate: new Date().toISOString().split('T')[0],
      });

      setPayslipStaff(null);
    } catch (err: any) {
      triggerAnnouncement(`Failed to record salary payment: ${err.message}`);
    } finally {
      setIsDisbursing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Payroll & Staff Summary Metrics Header (0 Hardcoded Values) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Staff payroll metrics">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-zinc-500 uppercase">Active Staff Roster</p>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">{totalActiveStaff} Members</h4>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-zinc-500 uppercase">Monthly Payroll Outflow</p>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">₹{totalMonthlyPayroll.toLocaleString()}</h4>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-zinc-500 uppercase">Average Monthly Base</p>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">₹{avgBaseSalary.toLocaleString()}</h4>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-zinc-500 uppercase">Certified Trainers</p>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">{totalTrainersCount} Active</h4>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Top Header & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 items-center justify-between shadow-sm">
        <div className="flex flex-1 gap-3 w-full items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search staff by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              aria-label="Search staff"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium"
            aria-label="Filter staff by job role"
          >
            <option value="ALL">All Roles</option>
            <option value="TRAINER">Personal Trainers</option>
            <option value="BRANCH_ADMIN">Branch Administrators</option>
            <option value="RECEPTIONIST">Front Desk Receptionists</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-zinc-200 dark:border-zinc-800"
            title="Configure Staff & Payroll Cut-off Settings"
          >
            <Settings className="w-4 h-4 text-zinc-500" /> Payroll Settings
          </button>

          {canCreate('users') && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm shadow-blue-500/20 active:scale-[0.98] shrink-0"
            >
              <UserPlus className="w-4 h-4" /> Onboard Staff
            </button>
          )}
        </div>
      </div>

      {/* Grid listing */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span>Loading staff directory...</span>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 space-y-3">
          <Shield className="w-10 h-10 text-zinc-400 mx-auto opacity-40" />
          <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">No staff members found</p>
          <p className="text-xs text-zinc-500">Onboard new team members or adjust search filters.</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" aria-label="Staff directory">
          {filteredStaff.map((s) => {
            const branchName = branches.find(b => b.id === s.branchId)?.name || 'Headquarters';
            const isActive = s.status !== 'INACTIVE';

            return (
              <div
                key={s.id}
                onClick={() => handleSelectStaff(s)}
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between hover:border-blue-500/50 dark:hover:border-blue-500/50 cursor-pointer transition group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-indigo-500/20 shrink-0">
                        {(s.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {s.name || 'Unknown'}
                          </h3>
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {(s.role || 'STAFF').replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 truncate max-w-[120px]">
                      {branchName}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                    <p className="flex items-center gap-2 font-mono"><Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> {s.email || '—'}</p>
                    <p className="flex items-center gap-2 font-mono"><Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> {s.phone || '—'}</p>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-4 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    ₹{(s.baseSalary || s.salary || 0).toLocaleString()} / mo
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(s)}
                      title={isActive ? 'Deactivate Staff' : 'Activate Staff'}
                      className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition flex items-center gap-1 ${
                        isActive 
                          ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' 
                          : 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <Power className="w-3 h-3" /> {isActive ? 'Active' : 'Inactive'}
                    </button>

                    <button
                      onClick={() => setPayslipStaff(s)}
                      className="px-3 py-1.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition flex items-center gap-1 shadow-sm shadow-emerald-500/20"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Pay Salary
                    </button>

                    <button
                      onClick={() => setPayslipStaff(s)}
                      className="px-2.5 py-1.5 text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-lg transition flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> Payslip
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </section>
      )}

      {/* Staff Profile & Payroll Detail Slide-Over Drawer */}
      {selectedStaffDetail && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setSelectedStaffDetail(null)}>
          <div className="w-full max-w-xl bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-y-auto p-6 space-y-6 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
            
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-blue-500/20">
                    {(selectedStaffDetail.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{selectedStaffDetail.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">{selectedStaffDetail.userCode || selectedStaffDetail.code || 'STAFF'}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedStaffDetail.status === 'Active' || selectedStaffDetail.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {selectedStaffDetail.status || (selectedStaffDetail.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </div>
                  </div>
                </div>

                <button onClick={() => setSelectedStaffDetail(null)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoadingDetail ? (
                <div className="py-12 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span>Loading full staff profile...</span>
                </div>
              ) : (
                <>
                  {/* Quick Stat Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Monthly Salary</p>
                      <p className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                        ₹{(selectedStaffDetail.baseSalary || selectedStaffDetail.salary || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Attendance Count</p>
                      <p className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                        {selectedStaffDetail.attendanceCount || selectedStaffDetail.attendanceLogs?.length || 0} days
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Role</p>
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1 uppercase">
                        {(selectedStaffDetail.role || 'STAFF').replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Personal & Branch Info */}
                  <div className="space-y-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-900 pb-2">Employment & Branch Info</h3>
                    
                    <div className="grid grid-cols-2 gap-3 text-zinc-600 dark:text-zinc-400">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-semibold block">First Name</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{selectedStaffDetail.firstName || selectedStaffDetail.name?.split(' ')[0] || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 font-semibold block">Last Name</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{selectedStaffDetail.lastName || selectedStaffDetail.name?.split(' ').slice(1).join(' ') || '—'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 font-semibold block">Assigned Serving Branch</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {selectedStaffDetail.branchName || branches.find(b => b.id === selectedStaffDetail.branchId)?.name || 'Headquarters'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 font-semibold block">Phone Number</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-100">{selectedStaffDetail.phone || selectedStaffDetail.phoneNumber || '—'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-zinc-400 font-semibold block">Email Address</span>
                        <span className="font-mono text-zinc-900 dark:text-zinc-100">{selectedStaffDetail.email || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance History Section */}
                  <div className="space-y-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs">
                    <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2">
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-blue-500" /> Attendance History
                      </h3>
                      <span className="text-[10px] font-bold text-zinc-400 font-mono">
                        Total Recorded: {selectedStaffDetail.attendanceCount || selectedStaffDetail.attendanceLogs?.length || 0}
                      </span>
                    </div>

                    {!selectedStaffDetail.attendanceLogs || selectedStaffDetail.attendanceLogs.length === 0 ? (
                      <p className="text-[11px] text-zinc-400 py-3 text-center">No recent attendance check-in logs found for this staff member.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {selectedStaffDetail.attendanceLogs.map((log: any, idx: number) => (
                          <div key={log.id || idx} className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-900 text-xs font-mono">
                            <div>
                              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                                {new Date(log.checkInTime).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-[10px] text-zinc-400 font-sans">Method: {log.method || 'MANUAL'}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              {log.status || 'PRESENT'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-2">
              <button
                onClick={() => {
                  const s = selectedStaffDetail;
                  setSelectedStaffDetail(null);
                  setPayslipStaff(s);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
              >
                <DollarSign className="w-4 h-4" /> Calculate & Pay Salary
              </button>

              <button
                onClick={() => {
                  setPayslipStaff(selectedStaffDetail);
                }}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> View Payslip
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Onboard Staff Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setIsFormOpen(false)}>
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-xs" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Onboard New Staff Member</h3>
                <p className="text-[11px] text-zinc-500">Register employee and assign branch permissions</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">Select User (to onboard as staff) *</label>
                <SearchableSelect
                  placeholder="Search user..."
                  options={usersList.map((u) => ({
                    value: u.id,
                    label: u.name || `${u.firstName} ${u.lastName}`.trim(),
                    sublabel: u.email || u.phone
                  }))}
                  value={newStaff.userId}
                  onChange={(val) => {
                    const selectedUser = usersList.find(u => u.id === val);
                    if (selectedUser) {
                      setNewStaff({ 
                        ...newStaff, 
                        userId: val, 
                        name: selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}`.trim(),
                        email: selectedUser.email || '',
                        phone: selectedUser.phone || '',
                        joiningDate: selectedUser.startDate || new Date().toISOString().split('T')[0]
                      });
                    } else {
                      setNewStaff({ ...newStaff, userId: val, name: '', email: '', phone: '', joiningDate: '' });
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={newStaff.name}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    readOnly
                    value={newStaff.phone}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">Date of Joining</label>
                  <input
                    type="date"
                    readOnly
                    value={newStaff.joiningDate}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">Job Role</label>
                  <SearchableSelect
                    placeholder="Search & Select Role..."
                    options={rolesList.map(r => ({
                      value: r.id,
                      label: r.name
                    }))}
                    value={newStaff.role}
                    onChange={(val) => setNewStaff({ ...newStaff, role: val as string })}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">Assigned Branch</label>
                  <SearchableSelect
                    placeholder="Search & Select Branch..."
                    options={branches.map(b => ({
                      value: b.id,
                      label: b.name,
                      sublabel: b.branchCode,
                    }))}
                    value={newStaff.branchId}
                    onChange={(val) => setNewStaff({ ...newStaff, branchId: val })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">Base Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={newStaff.baseSalary}
                    onChange={(e) => setNewStaff({ ...newStaff, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">Specialization / Skills</label>
                  <input
                    type="text"
                    placeholder="e.g. HIIT, Bodybuilding"
                    value={newStaff.specializations}
                    onChange={(e) => setNewStaff({ ...newStaff, specializations: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isPersonalTrainer"
                  checked={newStaff.isPersonalTrainer}
                  onChange={(e) => setNewStaff({ ...newStaff, isPersonalTrainer: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPersonalTrainer" className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  Assign as Personal Trainer (PT)
                </label>
              </div>

              {newStaff.isPersonalTrainer && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      PT Income Sharing Percentage (%)
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400 font-semibold">Range: 0% - 100%</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Enter percentage (0 - 100)"
                    value={newStaff.ptTrainerPercentage === undefined || newStaff.ptTrainerPercentage === null || Number.isNaN(newStaff.ptTrainerPercentage) ? '' : newStaff.ptTrainerPercentage}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setNewStaff({ ...newStaff, ptTrainerPercentage: '' as any });
                        return;
                      }
                      const parsed = parseInt(raw, 10);
                      if (isNaN(parsed)) return;
                      const clamped = Math.max(0, Math.min(100, parsed));
                      setNewStaff({ ...newStaff, ptTrainerPercentage: clamped });
                    }}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Allowed numbers strictly between 0 and 100.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">Upload Documents (Text/Links)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Aadhar: 1234, Pan: 5678"
                    value={newStaff.documents}
                    onChange={(e) => setNewStaff({ ...newStaff, documents: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Highly experienced in yoga"
                    value={newStaff.remarks}
                    onChange={(e) => setNewStaff({ ...newStaff, remarks: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 resize-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-sm shadow-blue-500/20 flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  Register Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff & Payroll Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setIsSettingsOpen(false)}>
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-xs" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-500" /> Staff Payroll & Absence Settings
                </h3>
                <p className="text-[11px] text-zinc-500">Configure global PT revenue cuts and leave deduction rules</p>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    Default Trainer PT Commission Cut (%)
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400 font-semibold">Range: 0% - 100%</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Enter percentage (0 - 100)"
                  value={payrollSettings.defaultPtPercentage === undefined || payrollSettings.defaultPtPercentage === null || Number.isNaN(payrollSettings.defaultPtPercentage) ? '' : payrollSettings.defaultPtPercentage}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                      setPayrollSettings({ ...payrollSettings, defaultPtPercentage: '' as any });
                      return;
                    }
                    const parsed = parseInt(raw, 10);
                    if (isNaN(parsed)) return;
                    const clamped = Math.max(0, Math.min(100, parsed));
                    setPayrollSettings({ ...payrollSettings, defaultPtPercentage: clamped });
                  }}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <p className="text-[10px] text-zinc-400 mt-1">Default cut percentage paid to trainers from member PT packages.</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <input
                  type="checkbox"
                  id="enableAbsenceDeduction"
                  checked={payrollSettings.enableAbsenceDeduction}
                  onChange={(e) => setPayrollSettings({ ...payrollSettings, enableAbsenceDeduction: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="enableAbsenceDeduction" className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  Enable Pro-Rata Absence Leave Deductions (Base Salary / 30 per day)
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Additional Standard Penalty per Unexcused Absence (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={payrollSettings.defaultAbsencePenalty}
                  onChange={(e) => setPayrollSettings({ ...payrollSettings, defaultAbsencePenalty: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold"
                  placeholder="e.g. 100"
                />
                <p className="text-[10px] text-zinc-400 mt-1">Extra penalty deducted for every missed work day.</p>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePayrollSettings(payrollSettings)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-sm"
                >
                  Save Payroll Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary Payslip & Pay Salary Modal */}
      {payslipStaff && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="payslip-heading" onClick={() => setPayslipStaff(null)}>
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <div>
                <h3 id="payslip-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" /> Calculate & Pay Salary
                </h3>
                <p className="text-[10px] text-zinc-500">Staff Member: {payslipStaff.name} ({(payslipStaff.role || 'STAFF').replace('_', ' ')})</p>
              </div>
              <button onClick={() => setPayslipStaff(null)} className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payslip content and params adjustment */}
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">Pay Period / Month</label>
                  <input
                    type="month"
                    value={payslipPeriod}
                    onChange={(e) => setPayslipPeriod(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">Disbursement Mode</label>
                  <select
                    value={payslipPaymentMode}
                    onChange={(e) => setPayslipPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-semibold"
                  >
                    <option value="BANK_TRANSFER">Bank Direct Transfer (IMPS/NEFT)</option>
                    <option value="UPI">UPI Payment</option>
                    <option value="CASH">Cash Payment</option>
                    <option value="CARD">Debit / Credit Card</option>
                  </select>
                </div>
              </div>

              {/* Render dynamic payslip calculations */}
              {isCalculatingPayslip || isLoadingAttendance ? (
                <div className="flex justify-center items-center py-6 text-zinc-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-xs">Fetching salary components and attendance records...</span>
                </div>
              ) : (() => {
                const base = payslipData?.baseSalary ?? (payslipStaff.baseSalary || payslipStaff.salary || 5000);
                const ptCommission = payslipData?.ptCommission ?? 0;
                const ptRate = payslipStaff.ptTrainerPercentage || payrollSettings.defaultPtPercentage || 30;
                const dailyRate = Math.round(base / 30);
                
                const presentCount = staffAttendanceLogs.length;
                const { expectedWorkingDays, absentDays, joinedThisMonth, joiningDateStr } = calculateStaffWorkingDaysAndAbsences(payslipStaff, payslipPeriod, presentCount);
                const leaveDeduction = payrollSettings.enableAbsenceDeduction ? Math.round(absentDays * dailyRate) : 0;
                const absencePenalty = Math.round(absentDays * payrollSettings.defaultAbsencePenalty);
                const bossCut = Number(customBossCut) || 0;
                const totalDeductions = leaveDeduction + absencePenalty + bossCut;
                const gross = base + ptCommission;
                const netPay = Math.max(0, gross - totalDeductions);

                return (
                  <div className="space-y-4 text-xs">
                    {/* Itemized Calculation Table */}
                    <div className="space-y-2 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                      <div className="flex justify-between font-bold border-b pb-2 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                        <span>Salary Component</span>
                        <span className="text-right font-mono">Amount (INR)</span>
                      </div>

                      <div className="space-y-2 pt-1 font-mono">
                        <div className="flex justify-between">
                          <span className="text-zinc-700 dark:text-zinc-300">Base Monthly Salary</span>
                          <span className="font-bold">₹{base.toLocaleString()}</span>
                        </div>

                        {(payslipStaff.isPersonalTrainer || payslipStaff.role === 'TRAINER') && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                            <span>PT Commission Cut ({ptRate}% share)</span>
                            <span className="font-bold">+ ₹{ptCommission.toLocaleString()}</span>
                          </div>
                        )}

                        <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-100 border-t pt-2 border-zinc-200 dark:border-zinc-800">
                          <span>Gross Earnings</span>
                          <span>₹{gross.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deductions & Leave Section */}
                    <div className="space-y-3 border border-red-200 dark:border-red-900/40 rounded-xl p-4 bg-red-50/40 dark:bg-red-950/20 text-red-900 dark:text-red-300">
                      <h4 className="font-bold flex items-center justify-between text-xs border-b border-red-200 dark:border-red-900/40 pb-2">
                        <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-red-500" /> Attendance & Leave Deductions</span>
                        <div className="flex items-center gap-2">
                          {joinedThisMonth && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Joined On {joiningDateStr}
                            </span>
                          )}
                          <span className="font-mono text-[11px] font-bold text-red-700 dark:text-red-400">
                            {absentDays} Days Missed (of {expectedWorkingDays} expected days)
                          </span>
                        </div>
                      </h4>

                      <div className="space-y-2 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span>Absence Leave Cut ({absentDays} days @ ₹{dailyRate}/day)</span>
                          <span className="font-bold text-red-600 dark:text-red-400">- ₹{leaveDeduction.toLocaleString()}</span>
                        </div>

                        {absencePenalty > 0 && (
                          <div className="flex justify-between">
                            <span>Absence Penalty Cut</span>
                            <span className="font-bold text-red-600 dark:text-red-400">- ₹{absencePenalty.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Boss / Admin Custom Deduction Input */}
                      <div className="pt-3 border-t border-red-200 dark:border-red-900/40 space-y-2 font-sans">
                        <label className="block font-bold text-zinc-900 dark:text-zinc-100 text-[11px]">
                          Additional Boss / Admin Penalty Cut (₹)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            min="0"
                            placeholder="Amount e.g. 200"
                            value={customBossCut || ''}
                            onKeyDown={(e) => {
                              if (['e', 'E', '+', '-'].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => setCustomBossCut(Math.max(0, Number(e.target.value)))}
                            className="px-3 py-1.5 border border-red-300 dark:border-red-800 bg-white dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono font-bold"
                          />
                          <input
                            type="text"
                            placeholder="Reason e.g. Late arrival / Fine"
                            value={customBossCutReason}
                            onChange={(e) => setCustomBossCutReason(e.target.value)}
                            className="px-3 py-1.5 border border-red-300 dark:border-red-800 bg-white dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 text-[11px]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Net Pay Highlight Card */}
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center font-bold text-emerald-900 dark:text-emerald-300">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider block text-emerald-700 dark:text-emerald-400">Calculated Net Salary Outflow</span>
                        <span className="text-xs font-normal text-emerald-800 dark:text-emerald-400 mt-0.5 block">
                          Base ₹{base.toLocaleString()} {ptCommission > 0 ? `+ PT Cut ₹${ptCommission.toLocaleString()}` : ''} - Deductions ₹{totalDeductions.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                        ₹{netPay.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center gap-3">
              <button
                onClick={() => {
                  const base = payslipData?.baseSalary ?? (payslipStaff.baseSalary || payslipStaff.salary || 5000);
                  const ptCommission = payslipData?.ptCommission ?? 0;
                  const dailyRate = Math.round(base / 30);
                  const presentCount = staffAttendanceLogs.length;
                  const { absentDays } = calculateStaffWorkingDaysAndAbsences(payslipStaff, payslipPeriod, presentCount);
                  const leaveDeduction = payrollSettings.enableAbsenceDeduction ? Math.round(absentDays * dailyRate) : 0;
                  const absencePenalty = Math.round(absentDays * payrollSettings.defaultAbsencePenalty);
                  const bossCut = Number(customBossCut) || 0;
                  const gross = base + ptCommission;
                  const netPay = Math.max(0, gross - (leaveDeduction + absencePenalty + bossCut));

                  downloadPayslipPdf(payslipStaff, {
                    base: base,
                    sessions: 0,
                    rate: payslipStaff.ptTrainerPercentage || payrollSettings.defaultPtPercentage || 30,
                    commissionVal: ptCommission,
                    gross: gross,
                    pfDeduction: 0,
                    ptTax: 0,
                    leaveDeduction: leaveDeduction + absencePenalty,
                    customDeduction: bossCut,
                    netPay: netPay,
                    payPeriod: payslipPeriod,
                    paymentMode: payslipPaymentMode,
                    referenceNo: payslipRefNo || `PAYSLIP-${payslipStaff.id.slice(0, 6).toUpperCase()}`,
                    paidDate: new Date().toISOString().split('T')[0],
                  });
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Download PDF Payslip
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPayslipStaff(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisburseSalary}
                  disabled={isDisbursing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDisbursing ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                  Disburse & Post to Ledger
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
