import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Building, Mail, UserCog, Users, CheckCircle, Plus, LayoutGrid, List, X, 
  Edit, Trash2, AlertTriangle, Power
} from 'lucide-react';
import { Branch, Member, Staff } from '../../types';
import { getBranches, createBranch, updateBranch, deleteBranch, updateBranchStatus } from '../../lib/api/branches';
import { getUsers, getStaff } from '../../lib/api/admin';

export const Branches: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Branch State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    adminUserId: '',
  });

  // Edit Branch State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);
  const [editBranchData, setEditBranchData] = useState({
    name: '',
    branchCode: '',
    adminUserId: '',
  });

  // Delete Branch State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const refreshBranches = async () => {
    try {
      const [b, m, s] = await Promise.all([getBranches(), getUsers(), getStaff()]);
      setBranches(b);
      setMembers(m);
      setStaff(s);
    } catch (err: any) {
      triggerAnnouncement('Failed to refresh branches data: ' + err.message);
    }
  };

  useEffect(() => {
    refreshBranches();
  }, [triggerAnnouncement]);

  const filteredBranches = branches.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.branchCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' ||
                          (statusFilter === 'ACTIVE' && b.isActive) ||
                          (statusFilter === 'INACTIVE' && !b.isActive);
    return matchesSearch && matchesStatus;
  });

  const getBranchMetrics = (branchId: string) => {
    const branchMembers = members.filter((m) => m.branchId === branchId);
    const branchStaff = staff.filter((s) => s.branchId === branchId);
    return {
      membersCount: branchMembers.length,
      trainersCount: branchStaff.filter((s) => s.role === 'TRAINER').length,
    };
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name) return;
    if (!newBranch.adminUserId) {
      triggerAnnouncement('Please assign a branch admin before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const brandNew = await createBranch({
        name: newBranch.name,
        adminUserId: newBranch.adminUserId,
      });

      await refreshBranches();
      setIsWizardOpen(false);
      setNewBranch({ name: '', adminUserId: '' });
      triggerAnnouncement(`Branch "${brandNew.name}" registered successfully.`);
    } catch (err: any) {
      triggerAnnouncement(`Failed to create branch: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (branch: Branch) => {
    setBranchToEdit(branch);
    setEditBranchData({
      name: branch.name || '',
      branchCode: branch.branchCode || '',
      adminUserId: branch.adminUserId || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchToEdit || !editBranchData.name) return;

    setIsSubmitting(true);
    try {
      await updateBranch(branchToEdit.id, {
        name: editBranchData.name,
        branchCode: editBranchData.branchCode || undefined,
        adminUserId: editBranchData.adminUserId || undefined,
      });

      await refreshBranches();
      setIsEditModalOpen(false);
      setBranchToEdit(null);
      triggerAnnouncement(`Branch "${editBranchData.name}" updated successfully.`);
    } catch (err: any) {
      triggerAnnouncement(`Failed to update branch: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (branch: Branch) => {
    setBranchToDelete(branch);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!branchToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteBranch(branchToDelete.id);
      await refreshBranches();
      triggerAnnouncement(`Branch "${branchToDelete.name}" and associated staff/members soft-deleted successfully.`);
      setIsDeleteConfirmOpen(false);
      setBranchToDelete(null);
    } catch (err: any) {
      triggerAnnouncement(`Failed to delete branch: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    try {
      const newStatus = !branch.isActive;
      await updateBranchStatus(branch.id, newStatus);
      await refreshBranches();
      triggerAnnouncement(`Branch "${branch.name}" status set to ${newStatus ? 'ACTIVE' : 'INACTIVE'}.`);
    } catch (err: any) {
      triggerAnnouncement(`Failed to toggle branch status: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search branches by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[240px] text-xs px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-2 focus:outline-blue-500"
            aria-label="Search branch directory"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-2 focus:outline-blue-500"
            aria-label="Filter by operational status"
          >
            <option value="ALL">All Statuses ({branches.length})</option>
            <option value="ACTIVE">Active Only ({branches.filter(b => b.isActive).length})</option>
            <option value="INACTIVE">Inactive Only ({branches.filter(b => !b.isActive).length})</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid/Table Toggle */}
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 p-0.5 bg-zinc-100 dark:bg-zinc-900">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 shadow text-blue-500' : 'text-zinc-400 hover:text-zinc-600'}`}
              aria-label="Switch to Card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-white dark:bg-zinc-800 shadow text-blue-500' : 'text-zinc-400 hover:text-zinc-600'}`}
              aria-label="Switch to List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow transition focus:outline-2 focus:outline-blue-500"
            aria-haspopup="dialog"
          >
            <Plus className="w-4 h-4" /> Add Branch
          </button>
        </div>
      </div>

      {/* Main branches layout */}
      {viewMode === 'grid' ? (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Branch list grid">
          {filteredBranches.map((branch) => {
            const { membersCount, trainersCount } = getBranchMetrics(branch.id);
            return (
              <div
                key={branch.id}
                className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between group hover:border-zinc-300 dark:hover:border-zinc-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-500" />
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{branch.name}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        branch.isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                      }`}>
                        {branch.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>

                      {/* Action Buttons */}
                      <button
                        onClick={() => handleToggleStatus(branch)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                        title={branch.isActive ? 'Deactivate Branch' : 'Activate Branch'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(branch)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                        title="Edit Branch"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(branch)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-xs text-zinc-600 dark:text-zinc-400">
                    <p className="flex items-center gap-2">
                      <UserCog className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{branch.username}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{branch.adminEmail}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                      <Users className="w-4 h-4 text-blue-500" /> {membersCount} Members
                    </span>
                    <span className="text-zinc-400">|</span>
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {trainersCount} Trainers
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">CODE: {branch.branchCode}</span>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm" aria-label="Branch list list">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 font-semibold">
                <th className="p-4">Branch Code</th>
                <th className="p-4">Branch Name</th>
                <th className="p-4">Branch Admin</th>
                <th className="p-4">Admin Email</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="p-4 font-mono font-semibold text-zinc-800 dark:text-zinc-200">{branch.branchCode}</td>
                  <td className="p-4 font-bold text-zinc-900 dark:text-zinc-50">{branch.name}</td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">{branch.username}</td>
                  <td className="p-4 text-zinc-600 dark:text-zinc-400">{branch.adminEmail}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                      branch.isActive
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'
                    }`}>
                      {branch.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleStatus(branch)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
                        title={branch.isActive ? 'Deactivate Branch' : 'Activate Branch'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(branch)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                        title="Edit Branch"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(branch)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Add Branch Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="wizard-title">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsWizardOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-zinc-950 shadow-2xl flex flex-col justify-between border-l border-zinc-200 dark:border-zinc-800">

              <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
                <div>
                  <h3 id="wizard-title" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Register New Branch</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Setup branch location & assign admin</p>
                </div>
                <button
                  onClick={() => setIsWizardOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBranch} className="flex-1 p-6 overflow-y-auto space-y-4 text-xs text-zinc-700 dark:text-zinc-300">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                    placeholder="e.g. FitLife Andheri East"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Assign Branch Admin *</label>
                  <select
                    required
                    value={newBranch.adminUserId}
                    onChange={(e) => setNewBranch({ ...newBranch, adminUserId: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">Select an existing staff member (from Staff API)...</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.username ? `${s.username} (${s.name})` : s.name} - {s.role}
                      </option>
                    ))}
                  </select>
                </div>
              </form>

              <div className="p-6 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateBranch}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Branch'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {isEditModalOpen && branchToEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="edit-branch-title">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 id="edit-branch-title" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">
                    Edit Branch Details
                  </h3>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateBranch} className="p-6 space-y-4 text-xs text-zinc-700 dark:text-zinc-300">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={editBranchData.name}
                    onChange={(e) => setEditBranchData({ ...editBranchData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Branch Code (Read Only)</label>
                  <input
                    type="text"
                    disabled
                    value={editBranchData.branchCode}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80 rounded-xl text-zinc-500 font-mono select-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Assign Branch Admin</label>
                  <select
                    value={editBranchData.adminUserId}
                    onChange={(e) => setEditBranchData({ ...editBranchData, adminUserId: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">Keep current branch admin</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.username ? `${s.username} (${s.name})` : s.name} - {s.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
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
      {isDeleteConfirmOpen && branchToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="delete-branch-dialog">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDeleteConfirmOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
              
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="delete-branch-dialog" className="font-bold text-zinc-900 dark:text-zinc-50 text-base">
                    Delete Branch Location
                  </h3>
                  <p className="text-xs text-zinc-500">Soft-delete branch & associated staff/members</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-xs text-red-800 dark:text-red-300">
                Are you sure you want to delete branch <strong className="font-bold">{branchToDelete.name}</strong> (<span className="font-mono">{branchToDelete.branchCode}</span>)?
                <p className="mt-1 font-normal text-[11px]">This will soft-delete the branch and automatically soft-delete all users, members, and staff assigned to this branch location.</p>
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
                  {isSubmitting ? 'Deleting...' : 'Yes, Soft-Delete Branch'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
