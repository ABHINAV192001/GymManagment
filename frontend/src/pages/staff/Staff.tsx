import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Shield, Award, UserCheck, Trash, Plus, FileText, X, CheckCircle, Mail, Phone, DollarSign, Calendar } from 'lucide-react';
import { Staff, Branch } from '../../types';
import { getStaff, getAdminBranches, createStaff, updateStaff } from '../../lib/api/admin';

export const StaffManagement: React.FC = () => {
  const { selectedBranchId, triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  
  const [staff, setStaff] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    Promise.all([getStaff(), getAdminBranches()])
      .then(([stf, brs]) => {
        setStaff(stf);
        setBranches(brs);
      })
      .catch(err => triggerAnnouncement(`Failed to load staff data: ${err.message}`));
  }, []);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Payslip simulation states
  const [payslipStaff, setPayslipStaff] = useState<Staff | null>(null);
  const [ptSessionsCount, setPtSessionsCount] = useState('18'); // default simulated PT sessions

  // New Staff Registration State
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'TRAINER' as 'TRAINER' | 'RECEPTIONIST' | 'BRANCH_ADMIN',
    baseSalary: 30000,
    salaryType: 'FIXED' as 'FIXED' | 'HYBRID' | 'COMMISSION',
    commissionRate: 15,
    certifications: 'ACE Certified Personal Trainer',
    specializations: 'Bodybuilding, HIIT',
    branchId: 'b-1',
  });

  const filteredStaff = staff.filter((s) => {
    const matchesSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    return matchesSearch && matchesRole && s.status !== 'TERMINATED';
  });

  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.phone) return;

    try {
      const created = await createStaff({
        branchId: newStaff.branchId || (branches[0]?.id || undefined),
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role as any,
        status: 'ACTIVE',
        baseSalary: Number(newStaff.baseSalary),
        specialization: newStaff.specializations,
        hireDate: new Date().toISOString().split('T')[0],
        performanceRating: 5.0,
      });

      setStaff([...staff, created]);
      setIsFormOpen(false);
    } catch (err: any) {
      console.error(`Failed to onboard staff: ${err.message}`);
    }
  };

  // Simulated payroll payslip calculator
  const calculatePayslipData = (s: Staff) => {
    const base = s.baseSalary || 0;
    const ptSessionRate = 400; // Average cost per personal training session
    const sessions = s.role === 'TRAINER' ? Number(ptSessionsCount) : 0;
    const rate = s.commissionRate || 0;
    const commissionVal = s.salaryType !== 'FIXED' ? (sessions * ptSessionRate * (rate / 100)) : 0;
    const gross = base + commissionVal;
    const pfDeduction = gross * 0.12; // 12% PF
    const ptTax = 200; // Professional tax
    const netPay = gross - pfDeduction - ptTax;

    return { base, sessions, ptSessionRate, rate, commissionVal, gross, pfDeduction, ptTax, netPay };
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full">
          <input
            type="text"
            placeholder="Search staff by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-xs px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
            aria-label="Search staff"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
            aria-label="Filter staff by job role"
          >
            <option value="ALL">All Roles</option>
            <option value="TRAINER">Personal Trainers</option>
            <option value="BRANCH_ADMIN">Branch Administrators</option>
            <option value="RECEPTIONIST">Front Desk Receptionists</option>
          </select>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shrink-0 w-full sm:w-auto justify-center"
          aria-haspopup="dialog"
        >
          <Plus className="w-4 h-4" /> Register Staff
        </button>
      </div>

      {/* Grid listing */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" aria-label="Staff directory">
        {filteredStaff.map((s) => {
          const branchName = branches.find(b => b.id === s.branchId)?.name || 'Headquarters';
          return (
            <div
              key={s.id}
              className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                      {(s.name || 'U').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">{s.name || 'Unknown'}</h3>
                      <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">{(s.role || 'STAFF').replace('_', ' ')}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                    {branchName.split(' ').slice(-2).join(' ')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-900/50">
                  <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-zinc-400" /> {s.email}</p>
                  <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-zinc-400" /> {s.phone}</p>
                  
                  {Array.isArray(s.certifications) && s.certifications.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" /> Certified Credentials
                      </span>
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">{s.certifications.join(', ')}</p>
                    </div>
                  )}

                  {Array.isArray(s.specializations) && s.specializations.length > 0 && (
                    <div className="pt-1.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Specialties</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.specializations.map((spec, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-[10px] text-zinc-600 dark:text-zinc-400">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action and salary logging */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-4 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-mono">Model: {s.salaryType} (₹{(s.baseSalary || s.salary || 0).toLocaleString()})</span>
                <button
                  onClick={async () => {
                        try {
                          const updated = await updateStaff(s.id, {
                            status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                          });
                          setStaff(staff.map(x => x.id === updated.id ? updated : x));
                        } catch (err: any) {
                          console.error(`Failed to update status: ${err.message}`);
                        }
                      }}
                  className="px-3 py-1.5 text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 text-zinc-700 dark:text-zinc-300 rounded transition flex items-center gap-1 focus:outline-2 focus:outline-blue-500"
                >
                  <FileText className="w-3.5 h-3.5" /> Payroll Payslip
                </button>
              </div>

            </div>
          );
        })}
      </section>

      {/* Salary Payslip Simulation Modal */}
      {payslipStaff && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="payslip-heading">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-xs text-zinc-700 dark:text-zinc-300">
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <div>
                <h3 id="payslip-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Monthly Payslip Simulation</h3>
                <p className="text-[10px] text-zinc-500">Employee: {payslipStaff.name} ({payslipStaff.role})</p>
              </div>
              <button onClick={() => setPayslipStaff(null)} className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payslip content and params adjustment */}
            <div className="p-6 space-y-6">
              {payslipStaff.role === 'TRAINER' && payslipStaff.salaryType !== 'FIXED' && (
                <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950/30">
                  <label className="block text-[11px] font-bold text-blue-800 dark:text-blue-400 mb-1.5">
                    Trainer Personal Sessions Logged this Month:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={ptSessionsCount}
                      onChange={(e) => setPtSessionsCount(e.target.value)}
                      className="w-24 px-2 py-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md text-zinc-900 dark:text-zinc-100"
                    />
                    <span className="text-[11px] text-zinc-500 flex items-center">sessions (Standard: ₹400 / session value)</span>
                  </div>
                </div>
              )}

              {/* Render dynamic payslip calculations */}
              {(() => {
                const data = calculatePayslipData(payslipStaff);
                return (
                  <div className="space-y-4 font-mono">
                    <div className="flex justify-between font-bold border-b pb-2 border-zinc-150 dark:border-zinc-800">
                      <span>Salary Component</span>
                      <span className="text-right">Amount (INR)</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Base Salary (Guaranteed)</span>
                        <span>₹{data.base.toLocaleString()}</span>
                      </div>
                      {payslipStaff.role === 'TRAINER' && payslipStaff.salaryType !== 'FIXED' && (
                        <div className="flex justify-between text-zinc-500">
                          <span>PT Commission ({data.sessions} sess. @ {data.rate}%)</span>
                          <span>+ ₹{data.commissionVal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-zinc-800 dark:text-zinc-200 border-t pt-2 border-zinc-100 dark:border-zinc-900">
                        <span>Gross Earnings</span>
                        <span>₹{data.gross.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
                      <div className="flex justify-between text-red-600 dark:text-red-400">
                        <span>Provident Fund (12% gross)</span>
                        <span>- ₹{data.pfDeduction.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-red-600 dark:text-red-400">
                        <span>Professional Tax (PT)</span>
                        <span>- ₹{data.ptTax}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 flex justify-between font-bold text-sm text-emerald-800 dark:text-emerald-400">
                      <span>Simulated Net Disbursement Pay</span>
                      <span>₹{data.netPay.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end">
              <button
                onClick={() => {
                  setPayslipStaff(null);
                  triggerAnnouncement(`Payslip generated and dispatched as email payload.`);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
              >
                Disburse & Send Payslip
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Register Staff Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="staff-form-heading">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-zinc-950 shadow-2xl flex flex-col justify-between">
              
              <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
                <h3 id="staff-form-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Register New Employee</h3>
                <button onClick={() => setIsFormOpen(false)} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterStaff} className="flex-1 p-6 overflow-y-auto space-y-4 text-xs text-zinc-700 dark:text-zinc-300">
                <div>
                  <label className="block font-semibold mb-1">Employee Name *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                    placeholder="e.g. Rahul Sen"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                    placeholder="e.g. rahul@gymos.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Role Type</label>
                    <select
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="TRAINER">Personal Trainer</option>
                      <option value="BRANCH_ADMIN">Branch Admin</option>
                      <option value="RECEPTIONIST">Receptionist desk</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Base Salary (INR)</label>
                    <input
                      type="number"
                      value={newStaff.baseSalary}
                      onChange={(e) => setNewStaff({ ...newStaff, baseSalary: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Salary Model</label>
                    <select
                      value={newStaff.salaryType}
                      onChange={(e) => setNewStaff({ ...newStaff, salaryType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="FIXED">Fixed Base Only</option>
                      <option value="HYBRID">Hybrid (Base + Sessions Commission)</option>
                    </select>
                  </div>
                </div>

                {newStaff.salaryType !== 'FIXED' && (
                  <div>
                    <label className="block font-semibold mb-1">Commission Rate (%) per session</label>
                    <input
                      type="number"
                      value={newStaff.commissionRate}
                      onChange={(e) => setNewStaff({ ...newStaff, commissionRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold mb-1">Assigned Branch Location</label>
                  <select
                    value={newStaff.branchId}
                    onChange={(e) => setNewStaff({ ...newStaff, branchId: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Specialties & Certifications</label>
                  <input
                    type="text"
                    value={newStaff.certifications}
                    onChange={(e) => setNewStaff({ ...newStaff, certifications: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                    placeholder="e.g. ACE Certified, Yoga Alliance"
                  />
                </div>
              </form>

              <div className="p-6 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegisterStaff}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
                >
                  Submit Employee Card
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
