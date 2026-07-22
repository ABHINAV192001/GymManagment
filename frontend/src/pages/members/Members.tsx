import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Search, X, DollarSign, UserPlus, Printer, Mail, Phone as PhoneIcon, 
  Edit, Trash2, Calendar, User, CheckCircle2, AlertTriangle, 
  CreditCard, Eye, Award, Activity, Building2, Sparkles, ShieldCheck, AlertCircle
} from 'lucide-react';
import { Member, Branch, Staff, Payment } from '../../types';
import { getUsers, createUser, updateUser, deleteUser, getAdminBranches, getStaff } from '../../lib/api/admin';
import { getPayments, createPayment } from '../../lib/api/accounts';
import { getRoles as getRbacRoles } from '../../lib/api/rbac';

export const Members: React.FC = () => {
  const { selectedBranchId, triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [availableRoles, setAvailableRoles] = useState<{ id: string; name: string }[]>([]);

  const refreshMembers = () => getUsers().then(setMembers);

  useEffect(() => {
    Promise.all([getUsers(), getAdminBranches(), getStaff(), getPayments(), getRbacRoles()])
      .then(([mems, brs, stf, pays, rbacRoles]) => {
        setMembers(mems);
        setBranches(brs);
        setStaff(stf);
        setPayments(pays);
        if (Array.isArray(rbacRoles)) {
          setAvailableRoles(rbacRoles);
        }
      })
      .catch(err => triggerAnnouncement(`Failed to load members data: ${err.message}`));
  }, []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'card'>('overview');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration Form State — role selected from Roles API
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    role: '',
    isStaff: false,
    name: '',
    email: '',
    phone: '',
    dob: '',
    amountPaid: '',
    startDate: new Date().toISOString().split('T')[0],
    trainerCode: '',
  });

  // Validation & Error state
  const [formErrors, setFormErrors] = useState<{ role?: string; name?: string; phone?: string; email?: string }>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  // Edit Member State
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editMemberData, setEditMemberData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    startDate: '',
    amountPaid: '',
    attendanceCount: '0',
    trainerCode: '',
    branchId: '',
    role: 'USER',
  });

  // Delete Member State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Record Payment state
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER'>('UPI');

  // Form Validation Logic
  const validateMemberForm = (data: { name: string; phone: string; email?: string; role?: string }) => {
    const errors: { name?: string; phone?: string; email?: string; role?: string } = {};

    if (!data.role || data.role.trim() === '') {
      errors.role = 'Please select a user role first.';
    }

    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }

    const cleanPhone = data.phone ? data.phone.trim() : '';
    if (!cleanPhone) {
      errors.phone = 'Phone number is required.';
    } else if (!/^[0-9]{10}$/.test(cleanPhone)) {
      errors.phone = 'Phone number must be exactly 10 digits (e.g. 9876543210).';
    }

    if (data.email && data.email.trim() !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.email = 'Please enter a valid email address (e.g. user@domain.com).';
      }
    }

    return errors;
  };

  // Open Edit Modal with current member data
  const openEditModal = (member: Member, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditMemberData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      dob: member.dob || '',
      startDate: member.startDate || new Date().toISOString().split('T')[0],
      amountPaid: member.amountPaid != null ? String(member.amountPaid) : '0',
      attendanceCount: member.attendanceCount != null ? String(member.attendanceCount) : '0',
      trainerCode: member.trainerCode || '',
      branchId: member.branchId || '',
      role: member.role || 'USER',
    });
    setIsEditFormOpen(true);
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (member: Member, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMemberToDelete(member);
    setIsDeleteConfirmOpen(true);
  };

  // Filters
  const filteredMembers = members.filter((m) => {
    const matchesBranch = selectedBranchId === 'ALL' || m.branchId === selectedBranchId;
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.phone.includes(search) || 
                          (m.email && m.email.toLowerCase().includes(search.toLowerCase())) ||
                          (m.userCode && m.userCode.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' ||
                          (statusFilter === 'ACTIVE' && m.isActive) ||
                          (statusFilter === 'INACTIVE' && !m.isActive);
    return matchesBranch && matchesSearch && matchesStatus;
  });

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitAttempted(true);

    const errors = validateMemberForm(newMember);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormErrorMessage('Please resolve the highlighted validation errors above.');
      return;
    }

    setFormErrorMessage(null);
    setIsSubmitting(true);
    try {
      await createUser({
        role: newMember.role,
        isStaff: newMember.isStaff,
        name: newMember.name.trim(),
        email: newMember.email ? newMember.email.trim() : undefined,
        phone: newMember.phone.trim(),
        dob: newMember.dob || undefined,
        amountPaid: newMember.amountPaid ? Number(newMember.amountPaid) : undefined,
        startDate: newMember.startDate || undefined,
        trainerCode: newMember.trainerCode || undefined,
        branchId: selectedBranchId === 'ALL' ? undefined : selectedBranchId,
      });

      await refreshMembers();
      setIsFormOpen(false);
      const registeredName = newMember.name;
      setNewMember({ role: '', isStaff: false, name: '', email: '', phone: '', dob: '', amountPaid: '', startDate: new Date().toISOString().split('T')[0], trainerCode: '' });
      setFormErrors({});
      setTouchedFields({});
      setIsSubmitAttempted(false);
      triggerAnnouncement(`${registeredName} registered successfully with role "${newMember.role}".`);
    } catch (err: any) {
      setFormErrorMessage(err.message);
      triggerAnnouncement(`Registration Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const errors = validateMemberForm({
      name: editMemberData.name,
      phone: editMemberData.phone,
      email: editMemberData.email,
      role: editMemberData.role,
    });

    if (Object.keys(errors).length > 0) {
      triggerAnnouncement(`Validation error: ${Object.values(errors)[0]}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUser(selectedMember.id, {
        name: editMemberData.name.trim(),
        email: editMemberData.email ? editMemberData.email.trim() : undefined,
        phone: editMemberData.phone.trim(),
        dob: editMemberData.dob || undefined,
        startDate: editMemberData.startDate || undefined,
        amountPaid: editMemberData.amountPaid ? Number(editMemberData.amountPaid) : 0,
        attendanceCount: editMemberData.attendanceCount ? Number(editMemberData.attendanceCount) : 0,
        trainerCode: editMemberData.trainerCode || undefined,
        branchId: editMemberData.branchId || undefined,
        role: editMemberData.role || 'USER',
      });

      await refreshMembers();

      const updatedTrainerName = staff.find(s => s.code === editMemberData.trainerCode)?.name || selectedMember.trainerName;
      const updated: Member = {
        ...selectedMember,
        name: editMemberData.name,
        email: editMemberData.email,
        phone: editMemberData.phone,
        dob: editMemberData.dob,
        startDate: editMemberData.startDate,
        amountPaid: editMemberData.amountPaid ? Number(editMemberData.amountPaid) : 0,
        attendanceCount: editMemberData.attendanceCount ? Number(editMemberData.attendanceCount) : 0,
        trainerCode: editMemberData.trainerCode,
        trainerName: updatedTrainerName,
        branchId: editMemberData.branchId,
        role: editMemberData.role,
      };
      setSelectedMember(updated);
      setIsEditFormOpen(false);
      triggerAnnouncement(`Member profile for "${editMemberData.name}" updated successfully.`);
    } catch (err: any) {
      triggerAnnouncement(`Update Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteUser(memberToDelete.id);
      await refreshMembers();
      if (selectedMember?.id === memberToDelete.id) {
        setSelectedMember(null);
      }
      triggerAnnouncement(`Member "${memberToDelete.name}" deleted successfully.`);
      setIsDeleteConfirmOpen(false);
      setMemberToDelete(null);
    } catch (err: any) {
      triggerAnnouncement(`Delete Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Record payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !payAmount) return;

    const pAmt = Number(payAmount);
    setIsSubmitting(true);
    try {
      const newPay = await createPayment({
        branchId: selectedMember.branchId,
        userId: selectedMember.id,
        paymentType: 'MEMBERSHIP',
        amount: pAmt,
        currency: 'INR',
        paymentMode: payMode,
        referenceNo: `TXN${Math.floor(Math.random() * 100000)}`,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'COMPLETED',
        notes: 'Manual desk payment logged in app.',
      });

      setPayments([...payments, newPay]);
      setPayAmount('');
      triggerAnnouncement(`Payment of ₹${pAmt} recorded for ${selectedMember.name}.`);
    } catch (err: any) {
      triggerAnnouncement(`Payment Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const branchName = (branchId?: string) => branches.find(b => b.id === branchId)?.name || 'Headquarters';

  return (
    <div className="space-y-6">
      {/* Directory Header & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, phone, email, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/80 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              aria-label="Search members"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/80 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            aria-label="Filter members by status"
          >
            <option value="ALL">All Statuses ({members.length})</option>
            <option value="ACTIVE">Active members ({members.filter(m => m.isActive).length})</option>
            <option value="INACTIVE">Inactive members ({members.filter(m => !m.isActive).length})</option>
          </select>
        </div>

        <button
          onClick={() => {
            setFormErrors({});
            setTouchedFields({});
            setIsSubmitAttempted(false);
            setFormErrorMessage(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-sm shadow-blue-500/20 active:scale-[0.98]"
          aria-haspopup="dialog"
        >
          <UserPlus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Directory Table Grid */}
      <section className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm" aria-label="Member List">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Member</th>
                <th className="p-4">Phone / Contact</th>
                <th className="p-4">Assigned Coach</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-400">
                    <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No members found</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => { setSelectedMember(m); setActiveTab('overview'); }}
                    className="hover:bg-blue-50/40 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors group"
                    tabIndex={0}
                    role="button"
                    aria-label={`View full profile details of ${m.name}`}
                  >
                    <td className="p-4 font-bold text-zinc-900 dark:text-zinc-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shadow-blue-500/20 shrink-0">
                          {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-zinc-900 dark:text-zinc-100 font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {m.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono">{m.userCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-300 font-mono text-xs">
                      <div>{m.phone}</div>
                      {m.email && <div className="text-[10px] text-zinc-400 font-sans truncate max-w-[150px]">{m.email}</div>}
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-300">
                      {m.trainerName ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-medium text-[11px]">
                          <Award className="w-3 h-3" /> {m.trainerName}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px] font-normal">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-400">{m.startDate || '—'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        m.isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { setSelectedMember(m); setActiveTab('overview'); }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => openEditModal(m, e)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
                          title="Edit Member"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => openDeleteModal(m, e)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Slide-over Profile Details Panel */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="member-profile-title">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedMember(null)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white dark:bg-zinc-950 shadow-2xl flex flex-col justify-between border-l border-zinc-200 dark:border-zinc-800">

              {/* Header */}
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                      {selectedMember.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 id="member-profile-title" className="font-bold text-zinc-900 dark:text-zinc-50 text-lg">
                          {selectedMember.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          selectedMember.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedMember.isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                          {selectedMember.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                        Code: <span className="font-bold text-blue-600 dark:text-blue-400">{selectedMember.userCode}</span>
                      </p>
                    </div>
                  </div>

                  {/* Header Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(selectedMember)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl border border-blue-200 dark:border-blue-800 transition"
                      title="Edit Member Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => openDeleteModal(selectedMember)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-xl border border-red-200 dark:border-red-800 transition"
                      title="Delete Member Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={() => setSelectedMember(null)}
                      className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                      aria-label="Close profile panel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Stat Micro-Cards Summary Grid */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center">
                    <span className="block text-[10px] text-zinc-400 font-medium">Paid</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      ₹{(selectedMember.amountPaid || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center">
                    <span className="block text-[10px] text-zinc-400 font-medium">Check-ins</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {selectedMember.attendanceCount || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center">
                    <span className="block text-[10px] text-zinc-400 font-medium">Coach</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block">
                      {selectedMember.trainerName || 'None'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center">
                    <span className="block text-[10px] text-zinc-400 font-medium">Branch</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block">
                      {branchName(selectedMember.branchId)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider Tabs */}
              <div className="px-6 border-b border-zinc-200 dark:border-zinc-800 flex gap-6 text-xs font-bold bg-white dark:bg-zinc-950">
                {[
                  { key: 'overview', label: 'Overview', icon: User },
                  { key: 'payments', label: 'Ledger & Payments', icon: CreditCard },
                  { key: 'card', label: 'Desk Pass Card', icon: Printer },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-3.5 border-b-2 flex items-center gap-2 transition ${
                      activeTab === tab.key
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Bodies */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-zinc-700 dark:text-zinc-300">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Personal Information Section */}
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-xs">
                          <User className="w-4 h-4 text-blue-500" /> Personal Details
                        </h4>
                        <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Contact Info</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Email Address</span>
                          {selectedMember.email ? (
                            <a href={`mailto:${selectedMember.email}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate">{selectedMember.email}</span>
                            </a>
                          ) : (
                            <span className="text-zinc-400 text-xs mt-0.5 block font-normal">Not provided</span>
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Phone Number</span>
                          <a href={`tel:${selectedMember.phone}`} className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mt-0.5 font-mono">
                            <PhoneIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{selectedMember.phone}</span>
                          </a>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Date of Birth</span>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{selectedMember.dob || 'Not provided'}</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Account Role</span>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mt-0.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{selectedMember.role || 'USER'}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Membership Details Section */}
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-xs">
                          <Award className="w-4 h-4 text-purple-500" /> Membership & Coaching
                        </h4>
                        <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Plan & Assigned Trainer</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Assigned Coach / Trainer</span>
                          <p className="font-bold text-purple-700 dark:text-purple-300 mt-0.5">
                            {selectedMember.trainerName ? (
                              <span>{selectedMember.trainerName} ({selectedMember.trainerCode})</span>
                            ) : (
                              <span className="text-zinc-400 font-normal">Floor Supervisor (Unassigned)</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Membership Start Date</span>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                            {selectedMember.startDate || 'Not recorded'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Gym Branch Location</span>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{branchName(selectedMember.branchId)}</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Total Check-in Attendance</span>
                          <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                            <Activity className="w-3.5 h-3.5" />
                            <span>{selectedMember.attendanceCount || 0} visits logged</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" /> Member Desk Ledger
                      </h4>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                        Total Paid: ₹{(selectedMember.amountPaid || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Record payment Form */}
                      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                        <h5 className="font-bold text-zinc-800 dark:text-zinc-200 mb-3 text-xs flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Log Cash / UPI Payment
                        </h5>
                        <form onSubmit={handleRecordPayment} className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">Fee Amount (INR) *</label>
                            <input
                              type="number"
                              required
                              placeholder="₹ e.g. 5000"
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">Payment Channel</label>
                            <select
                              value={payMode}
                              onChange={(e) => setPayMode(e.target.value as any)}
                              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                            >
                              <option value="UPI">UPI Instant</option>
                              <option value="CASH">Desk Cash</option>
                              <option value="CARD">Credit/Debit Card</option>
                              <option value="BANK_TRANSFER">Direct Transfer</option>
                            </select>
                          </div>
                          <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-sm shadow-emerald-600/20 disabled:opacity-50"
                          >
                            {isSubmitting ? 'Logging...' : 'Submit Transaction'}
                          </button>
                        </form>
                      </div>

                      {/* Payment History ledger */}
                      <div className="space-y-2">
                        <span className="block font-bold text-zinc-400 text-[10px] uppercase tracking-wider">Payment History</span>
                        {payments.filter(p => p.userId === selectedMember.id).length === 0 ? (
                          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 text-xs">
                            No ledger transactions recorded yet.
                          </div>
                        ) : (
                          payments.filter(p => p.userId === selectedMember.id).map((pay) => (
                            <div key={pay.id} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
                              <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-50 text-xs">
                                <span>₹{pay.amount.toLocaleString()}</span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                                  {pay.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 font-mono">Date: {pay.paymentDate} | Mode: {pay.paymentMode}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'card' && (
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-gradient-to-br from-zinc-900 to-black text-white shadow-xl max-w-md mx-auto space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold tracking-widest uppercase text-blue-400">GymOS Official Pass</span>
                          <h4 className="text-base font-black text-white">{selectedMember.name}</h4>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          {selectedMember.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 border-y border-zinc-800 py-3">
                        <div>
                          <span className="text-zinc-500 text-[9px] block">MEMBER ID</span>
                          <span className="font-mono font-bold text-white">{selectedMember.userCode}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[9px] block">BRANCH</span>
                          <span className="font-bold text-white">{branchName(selectedMember.branchId)}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[9px] block">PHONE</span>
                          <span className="font-mono text-white">{selectedMember.phone}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[9px] block">TRAINER</span>
                          <span className="text-white">{selectedMember.trainerName || 'Self'}</span>
                        </div>
                      </div>

                      <div className="text-center pt-2">
                        <div className="h-8 bg-white/10 rounded flex items-center justify-center gap-1 font-mono text-[10px] tracking-widest text-zinc-400">
                          ||||| ||| ||||||| |||| ||||| |||||
                        </div>
                        <p className="text-[9px] text-zinc-500 mt-1">Scan at front desk turnstile</p>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        onClick={() => triggerAnnouncement(`Directly printing barcode pass card for ${selectedMember.name}.`)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-blue-500/20"
                      >
                        <Printer className="w-4 h-4" /> Print Thermal Card
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Bottom Quick Action Footer */}
              <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => openDeleteModal(selectedMember)}
                  className="px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 rounded-xl transition border border-red-200 dark:border-red-800 flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Delete Member
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(selectedMember)}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                  >
                    <Edit className="w-4 h-4" /> Edit Profile
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Member Dialog Modal */}
      {isEditFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="edit-form-heading">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEditFormOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              
              {/* Header */}
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 id="edit-form-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">
                    Edit Member Profile
                  </h3>
                </div>
                <button onClick={() => setIsEditFormOpen(false)} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleUpdateMember} className="p-6 space-y-4 text-xs text-zinc-700 dark:text-zinc-300 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">User Role *</label>
                    <select
                      value={editMemberData.role}
                      onChange={(e) => setEditMemberData({ ...editMemberData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold"
                    >
                      {availableRoles.map((r) => (
                        <option key={r.id || r.name} value={r.name}>
                          {r.name.replace(/_/g, ' ')}
                        </option>
                      ))}
                      {availableRoles.length === 0 && (
                        <option value="EMPLOYEE">EMPLOYEE</option>
                      )}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editMemberData.name}
                      onChange={(e) => setEditMemberData({ ...editMemberData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Phone Number (10 Digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={editMemberData.phone}
                      onChange={(e) => setEditMemberData({ ...editMemberData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Email Address</label>
                    <input
                      type="email"
                      value={editMemberData.email}
                      onChange={(e) => setEditMemberData({ ...editMemberData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Date of Birth</label>
                    <input
                      type="date"
                      value={editMemberData.dob}
                      onChange={(e) => setEditMemberData({ ...editMemberData, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Start Date</label>
                    <input
                      type="date"
                      value={editMemberData.startDate}
                      onChange={(e) => setEditMemberData({ ...editMemberData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Total Amount Paid (INR)</label>
                    <input
                      type="number"
                      value={editMemberData.amountPaid}
                      onChange={(e) => setEditMemberData({ ...editMemberData, amountPaid: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Attendance Count</label>
                    <input
                      type="number"
                      value={editMemberData.attendanceCount}
                      onChange={(e) => setEditMemberData({ ...editMemberData, attendanceCount: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Assign Coach / Personal Trainer</label>
                  <select
                    value={editMemberData.trainerCode}
                    onChange={(e) => setEditMemberData({ ...editMemberData, trainerCode: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">Unassigned (Floor Supervisor)</option>
                    {staff.filter(s => s.role === 'TRAINER' && s.code).map((t) => (
                      <option key={t.id} value={t.code}>{t.name} ({t.code})</option>
                    ))}
                  </select>
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditFormOpen(false)}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-sm shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && memberToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-heading">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteConfirmOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
              
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="delete-dialog-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-base">
                    Delete Member Account
                  </h3>
                  <p className="text-xs text-zinc-500">This action cannot be undone.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-xs text-red-800 dark:text-red-300">
                Are you sure you want to delete member <strong className="font-bold">{memberToDelete.name}</strong> (<span className="font-mono">{memberToDelete.userCode}</span>)?
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition text-xs shadow-sm shadow-red-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Yes, Delete Member'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Registration Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="form-heading">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsFormOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-zinc-950 shadow-2xl flex flex-col justify-between border-l border-zinc-200 dark:border-zinc-800">

              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
                <div>
                  <h3 id="form-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Register New Account</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Select user role first, then fill profile details</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterMember} className="flex-1 p-6 overflow-y-auto space-y-4 text-xs text-zinc-700 dark:text-zinc-300">
                {/* Form-level Error Banner if submit attempted with errors or HTTP error */}
                {formErrorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Registration Alert</p>
                      <p className="text-[11px] mt-0.5">{formErrorMessage}</p>
                    </div>
                  </div>
                )}

                {/* 1. MANDATORY ROLE SELECTION FIELD (FIRST) */}
                <div>
                  <label className="block font-bold mb-1 text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                    <span>1. User Role *</span>
                    <span className="text-[10px] font-normal text-blue-600 dark:text-blue-400">Select Role First</span>
                  </label>
                  <select
                    required
                    value={newMember.role}
                    onChange={(e) => {
                      setNewMember({ ...newMember, role: e.target.value });
                      setFormErrors(prev => ({ ...prev, role: undefined }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, role: true }))}
                    className={`w-full px-3 py-2 border ${
                      formErrors.role && (touchedFields.role || isSubmitAttempted)
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500'
                    } bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold text-xs transition`}
                  >
                    <option value="">-- Select Role from System --</option>
                    {availableRoles.map((r) => (
                      <option key={r.id || r.name} value={r.name}>
                        {r.name.replace(/_/g, ' ')}
                      </option>
                    ))}
                    {availableRoles.length === 0 && (
                      <option value="EMPLOYEE">EMPLOYEE</option>
                    )}
                  </select>
                  <p className="mt-1 text-[10px] text-zinc-400">
                    Members added here receive Gym Member access. Staff, Trainers, & Branch Admins are managed under Staff & Payroll.
                  </p>
                  {formErrors.role && (touchedFields.role || isSubmitAttempted) && (
                    <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.role}
                    </p>
                  )}
                </div>

                {/* STAFF & PAYROLL TOGGLE */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs block">
                      Assign as Staff / Operational Personnel
                    </span>
                    <span className="text-[10px] text-zinc-500 mt-0.5 block leading-tight">
                      Enable this toggle to automatically register this user in Staff & Payroll directory and make them eligible as Branch Admin or Trainer.
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={newMember.isStaff}
                    onClick={() => setNewMember({ ...newMember, isStaff: !newMember.isStaff })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      newMember.isStaff ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        newMember.isStaff ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. FULL NAME */}
                <div>
                  <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newMember.name}
                    onChange={(e) => {
                      setNewMember({ ...newMember, name: e.target.value });
                      setFormErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, name: true }))}
                    className={`w-full px-3 py-2 border ${
                      formErrors.name && (touchedFields.name || isSubmitAttempted)
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500'
                    } bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs transition`}
                    placeholder="e.g. John Doe"
                  />
                  {formErrors.name && (touchedFields.name || isSubmitAttempted) && (
                    <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.name}
                    </p>
                  )}
                </div>

                {/* 3. PHONE NUMBER (10 DIGITS) */}
                <div>
                  <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Phone Number (10 Digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newMember.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setNewMember({ ...newMember, phone: val });
                      setFormErrors(prev => ({ ...prev, phone: undefined }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, phone: true }))}
                    className={`w-full px-3 py-2 border ${
                      formErrors.phone && (touchedFields.phone || isSubmitAttempted)
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500'
                    } bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono text-xs transition`}
                    placeholder="e.g. 9876543210"
                  />
                  {formErrors.phone && (touchedFields.phone || isSubmitAttempted) && (
                    <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* 4. EMAIL ADDRESS */}
                <div>
                  <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Email Address</label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => {
                      setNewMember({ ...newMember, email: e.target.value });
                      setFormErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
                    className={`w-full px-3 py-2 border ${
                      formErrors.email && (touchedFields.email || isSubmitAttempted)
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500'
                    } bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs transition`}
                    placeholder="e.g. john@mail.com"
                  />
                  {formErrors.email && (touchedFields.email || isSubmitAttempted) && (
                    <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Date of Birth</label>
                    <input
                      type="date"
                      value={newMember.dob}
                      onChange={(e) => setNewMember({ ...newMember, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Start Date</label>
                    <input
                      type="date"
                      value={newMember.startDate}
                      onChange={(e) => setNewMember({ ...newMember, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Initial Amount Paid (INR)</label>
                  <input
                    type="number"
                    value={newMember.amountPaid}
                    onChange={(e) => setNewMember({ ...newMember, amountPaid: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                    placeholder="e.g. 6500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Assign Coach / Trainer</label>
                  <select
                    value={newMember.trainerCode}
                    onChange={(e) => setNewMember({ ...newMember, trainerCode: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">Floor Supervisor (Self Managed)</option>
                    {staff.filter(s => s.role === 'TRAINER' && s.code).map((t) => (
                      <option key={t.id} value={t.code}>{t.name} ({t.code})</option>
                    ))}
                  </select>
                </div>
              </form>

              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegisterMember}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-sm shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Account Card'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
