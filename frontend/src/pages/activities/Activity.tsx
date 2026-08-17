import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Clock, User, Plus, X, Users, Bell, Building2, Send, CheckCircle2, Shield, Ban, Trash2, Edit3 } from 'lucide-react';
import { Activity, ActivitySchedule, Branch } from '../../types';
import { getActivities, deleteActivity } from '../../lib/api/activities';
import { getAdminBranches } from '../../lib/api/admin';
import { getRoles } from '../../lib/api/rbac';
import { createGroupSession, getGroupSessions, cancelGroupSession, bookGroupSession, updateGroupSession, deleteGroupSession, voteGroupSession, GroupSessionResponse } from '../../lib/api/groupSessions';
import { usePermissions } from '../../lib/usePermissions';

export const Activities: React.FC = () => {
  const { triggerAnnouncement, selectedBranchId } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  const { canCreate, canEdit, canDelete, canBookSpot } = usePermissions();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [schedules, setSchedules] = useState<ActivitySchedule[]>([]);
  const [groupSessions, setGroupSessions] = useState<GroupSessionResponse[]>([]);
  const [availableRoles, setAvailableRoles] = useState<{ id: string; label: string }[]>([]);

  useEffect(() => {
    const pActs = getActivities().catch(err => { console.warn(err); return []; });
    const pBrs = getAdminBranches().catch(err => { console.warn(err); return []; });
    const pRoles = getRoles().catch(err => { console.warn(err); return []; });
    const pSessions = getGroupSessions(selectedBranchId).catch(err => { console.warn(err); return []; });

    Promise.all([pActs, pBrs, pRoles, pSessions])
      .then(([acts, brs, roles, sessions]) => {
        setActivities(Array.isArray(acts) ? acts : []);
        setBranches(Array.isArray(brs) ? brs : []);
        // Map API roles to { id, label } shape
        const rawRoles = Array.isArray(roles) ? roles : (roles?.content ?? []);
        setAvailableRoles(rawRoles.map((r: any) => ({
          id: r.name ?? r.id,
          label: r.displayName ?? r.name ?? r.id,
        })));
        setGroupSessions(Array.isArray(sessions) ? sessions : []);
      })
      .catch(err => triggerAnnouncement(`Failed to load activity data: ${err.message}`));
  }, [triggerAnnouncement, selectedBranchId]);

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<GroupSessionResponse | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const handleOpenCancel = (gs: GroupSessionResponse) => {
    setCancelTarget(gs);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    setIsCancelling(true);
    try {
      const updated = await cancelGroupSession(cancelTarget.id, cancelReason.trim());
      setGroupSessions(prev => prev.map(gs => gs.id === updated.id ? updated : gs));
      triggerAnnouncement(`Session "${cancelTarget.title}" cancelled.`);
      setCancelTarget(null);
      setCancelReason('');
    } catch (err: any) {
      triggerAnnouncement(`Failed to cancel: ${err.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  // New Group Session Form State
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    time: '08:00',
    durationMins: 45,
    date: new Date().toISOString().split('T')[0],
    availableSlots: 20,
    selectedRoles: [] as string[],
    selectedBranchIds: [] as string[],
  });

  // Toggle role selection
  const handleToggleRole = (roleId: string) => {
    setNewSession(prev => {
      const exists = prev.selectedRoles.includes(roleId);
      if (exists) {
        return { ...prev, selectedRoles: prev.selectedRoles.filter(r => r !== roleId) };
      } else {
        return { ...prev, selectedRoles: [...prev.selectedRoles, roleId] };
      }
    });
  };

  // Toggle branch selection
  const handleToggleBranch = (branchId: string) => {
    setNewSession(prev => {
      const exists = prev.selectedBranchIds.includes(branchId);
      if (exists) {
        return { ...prev, selectedBranchIds: prev.selectedBranchIds.filter(b => b !== branchId) };
      } else {
        return { ...prev, selectedBranchIds: [...prev.selectedBranchIds, branchId] };
      }
    });
  };

  // Select all branches
  const handleSelectAllBranches = () => {
    if (newSession.selectedBranchIds.length === branches.length) {
      setNewSession(prev => ({ ...prev, selectedBranchIds: [] }));
    } else {
      setNewSession(prev => ({ ...prev, selectedBranchIds: branches.map(b => b.id) }));
    }
  };

  // Select all roles
  const handleSelectAllRoles = () => {
    if (newSession.selectedRoles.length === availableRoles.length) {
      setNewSession(prev => ({ ...prev, selectedRoles: [] }));
    } else {
      setNewSession(prev => ({ ...prev, selectedRoles: availableRoles.map(r => r.id) }));
    }
  };


  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.title || !newSession.date || !newSession.time) return;

    setIsSubmitting(true);
    try {
      const saved = await createGroupSession({
        title: newSession.title,
        description: newSession.description,
        sessionDate: newSession.date,
        sessionTime: newSession.time,
        durationMins: newSession.durationMins,
        availableSlots: newSession.availableSlots,
        branchIds: newSession.selectedBranchIds,
        notifyRoles: newSession.selectedRoles,
      });

      // Prepend the newly saved session to the list
      setGroupSessions(prev => [saved, ...prev]);
      setIsOpen(false);

      const targetRolesText = newSession.selectedRoles.length > 0
        ? newSession.selectedRoles.join(', ')
        : 'All Roles';
      const targetBranchesText = newSession.selectedBranchIds.length > 0
        ? `${newSession.selectedBranchIds.length} branch(es)`
        : 'All Branches';

      triggerAnnouncement(`Session "${saved.title}" saved to DB! Notification dispatched to [${targetRolesText}] across [${targetBranchesText}].`);

      setNewSession({
        title: '',
        description: '',
        time: '08:00',
        durationMins: 45,
        date: new Date().toISOString().split('T')[0],
        availableSlots: 20,
        selectedRoles: [],
        selectedBranchIds: [],
      });
    } catch (err: any) {
      triggerAnnouncement(`Failed to save session: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit session state
  const [editTarget, setEditTarget] = useState<GroupSessionResponse | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    time: '08:00',
    durationMins: 45,
    date: new Date().toISOString().split('T')[0],
    availableSlots: 20,
    selectedRoles: [] as string[],
    selectedBranchIds: [] as string[],
  });

  const handleOpenEdit = (gs: GroupSessionResponse) => {
    setEditTarget(gs);
    setEditForm({
      title: gs.title,
      description: gs.description || '',
      time: gs.sessionTime?.slice(0, 5) || '08:00',
      durationMins: gs.durationMins || 45,
      date: gs.sessionDate || new Date().toISOString().split('T')[0],
      availableSlots: gs.availableSlots || 20,
      selectedRoles: gs.notifyRoles || [],
      selectedBranchIds: gs.branchIds || [],
    });
  };

  const handleUpdateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editForm.title) return;
    setIsSubmitting(true);
    try {
      const updated = await updateGroupSession(editTarget.id, {
        title: editForm.title,
        description: editForm.description,
        sessionDate: editForm.date,
        sessionTime: editForm.time,
        durationMins: editForm.durationMins,
        availableSlots: editForm.availableSlots,
        branchIds: editForm.selectedBranchIds,
        notifyRoles: editForm.selectedRoles,
      });
      setGroupSessions(prev => prev.map(gs => gs.id === updated.id ? updated : gs));
      triggerAnnouncement(`Session "${updated.title}" updated successfully.`);
      setEditTarget(null);
    } catch (err: any) {
      triggerAnnouncement(`Failed to update session: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSoftDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete activity "${title}"?`)) return;
    try {
      await Promise.all([
        deleteGroupSession(id).catch(e => console.warn('Group session delete:', e)),
        deleteActivity(id).catch(e => console.warn('Activity delete:', e)),
      ]);
      setGroupSessions(prev => prev.filter(gs => gs.id !== id));
      triggerAnnouncement(`Activity "${title}" deleted successfully.`);
    } catch (err: any) {
      setGroupSessions(prev => prev.filter(gs => gs.id !== id));
      triggerAnnouncement(`Activity "${title}" deleted.`);
    }
  };

  const handleVoteAction = async (gs: GroupSessionResponse, voteType: 'IN' | 'OUT') => {
    if (voteType === 'IN' && (gs.myVote === 'IN' || gs.isBookedByMe)) {
      triggerAnnouncement(`You have already marked IN for "${gs.title}"!`);
      return;
    }
    if (voteType === 'OUT' && gs.myVote === 'OUT') {
      triggerAnnouncement(`You have already marked OUT for "${gs.title}".`);
      return;
    }
    try {
      const updatedSession = await voteGroupSession(gs.id, voteType);
      setGroupSessions(prev => prev.map(item => item.id === updatedSession.id ? updatedSession : item));
      triggerAnnouncement(`Voted ${voteType} for "${gs.title}"!`);
    } catch (err: any) {
      triggerAnnouncement(`Voting failed: ${err.message || 'Error recorded'}`);
    }
  };

  const handleBookSpot = async (sessionId: string) => {
    try {
      const updatedSession = await bookGroupSession(sessionId);
      setGroupSessions(groupSessions.map(gs => gs.id === updatedSession.id ? updatedSession : gs));
      triggerAnnouncement('Successfully booked a spot in the session!');
    } catch (err: any) {
      triggerAnnouncement(`Failed to book spot: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col md:flex-row justify-between items-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 gap-4 shadow-sm">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Zumba, Yoga & HIIT Group Timetable</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Schedule activities, target specific roles, and manage IN / OUT attendance.</p>
        </div>
        {canCreate('activity') && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm shadow-blue-500/20 active:scale-[0.98] transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Schedule New Activity
          </button>
        )}
      </div>

      {/* Main class schedules listing */}
      {groupSessions.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 space-y-3">
          <Calendar className="w-10 h-10 text-zinc-400 mx-auto opacity-40" />
          <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">No group activities scheduled</p>
          <p className="text-xs text-zinc-500">Schedule a new activity to notify members and staff.</p>
          {canCreate('activity') && (
            <button
              onClick={() => setIsOpen(true)}
              className="mt-2 px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-xl border border-blue-200 dark:border-blue-800 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Schedule First Activity
            </button>
          )}
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Class Timetable Slots">
          {groupSessions.map((gs) => {
            const isFull = gs.remainingSlots <= 0;
            const statusColor = gs.status === 'CANCELLED'
              ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
              : gs.status === 'DELETED'
                ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400'
                : isFull
                  ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400'
                  : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400';

            const userIn = gs.myVote === 'IN' || gs.isBookedByMe;
            const userOut = gs.myVote === 'OUT';

            return (
              <div
                key={gs.id}
                className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${gs.status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-500'}`} />
                      <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">{gs.status}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                        {gs.status === 'CANCELLED' ? 'CANCELLED' : isFull ? 'FULLY BOOKED' : 'OPEN'}
                      </span>

                      {/* Edit / Delete Action Buttons */}
                      <div className="flex items-center gap-1">
                        {canEdit('activity') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(gs);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition"
                            title="Edit Activity"
                          >
                            <Edit3 className="w-4 h-4 text-blue-500" />
                          </button>
                        )}
                        {canDelete('activity') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSoftDelete(gs.id, gs.title);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                            title="Delete Activity"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">{gs.title}</h4>
                  {gs.description && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{gs.description}</p>}

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-4 text-xs text-zinc-600 dark:text-zinc-400">
                    <p className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      {gs.sessionTime?.slice(0, 5)} ({gs.durationMins} mins)
                    </p>
                    <p className="flex items-center gap-1.5 font-mono">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      {gs.sessionDate}
                    </p>
                    {gs.notifyRoles && gs.notifyRoles.length > 0 && (
                      <p className="flex items-center gap-1.5 col-span-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        <Bell className="w-3.5 h-3.5" /> Target Roles: {gs.notifyRoles.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* IN / OUT Voting Section */}
                <div className="pt-4 border-t border-zinc-150 dark:border-zinc-900 mt-4 flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase">Capacity</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {gs.remainingSlots} of {gs.availableSlots} seats free
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* IN Button */}
                    <button
                      onClick={() => handleVoteAction(gs, 'IN')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                        userIn
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border-zinc-200 dark:border-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      }`}
                      title={userIn ? 'You are marked IN' : 'Mark IN for activity'}
                    >
                      {userIn ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                      IN ({gs.bookedCount})
                    </button>

                    {/* OUT Button */}
                    <button
                      onClick={() => handleVoteAction(gs, 'OUT')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border ${
                        userOut
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-red-600 dark:text-red-400 border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40'
                      }`}
                      title={userOut ? 'You are marked OUT' : 'Mark OUT for activity'}
                    >
                      {userOut ? <X className="w-3.5 h-3.5" /> : null}
                      OUT ({gs.outCount || 0})
                    </button>

                    {/* Cancel button — only for SCHEDULED sessions */}
                    {gs.status === 'SCHEDULED' && canDelete('activity') && (
                      <button
                        onClick={() => handleOpenCancel(gs)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1 transition"
                      >
                        <Ban className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Show cancellation reason if session was cancelled */}
                {gs.status === 'CANCELLED' && gs.cancellationReason && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900">
                    <span className="block text-[10px] font-bold text-red-500 uppercase mb-0.5">Cancellation Reason</span>
                    <p className="text-xs text-red-700 dark:text-red-400">{gs.cancellationReason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* ── Cancel Session Reason Modal ─────────────────────────────────── */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setCancelTarget(null)}>
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-red-50 dark:bg-red-950/30 flex justify-between items-start">
              <div>
                <h4 className="font-bold text-red-800 dark:text-red-300 text-sm flex items-center gap-2">
                  <Ban className="w-4 h-4" /> Cancel Session
                </h4>
                <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">This will cancel <span className="font-bold">{cancelTarget.title}</span> on {cancelTarget.sessionDate}</p>
              </div>
              <button onClick={() => setCancelTarget(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reason Form */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 text-xs">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Instructor unavailable, venue maintenance, low attendance..."
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                  autoFocus
                />
                <p className="text-[10px] text-zinc-400 mt-1">{cancelReason.length}/500 characters</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCancelTarget(null)}
                  className="flex-1 px-4 py-2.5 text-xs font-bold border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
                >
                  Keep Session
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={!cancelReason.trim() || isCancelling}
                  className="flex-1 px-4 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-sm shadow-red-500/20 flex items-center justify-center gap-2 transition"
                >
                  <Ban className="w-3.5 h-3.5" />
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Activity Modal ─────────────────────────────────── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setEditTarget(null)}>
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs text-zinc-700 dark:text-zinc-300 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Edit Activity</h4>
                <p className="text-[11px] text-zinc-500">Update activity timetable, target roles, and rules</p>
              </div>
              <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSessionSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Description / Rules</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min="15"
                    value={editForm.durationMins}
                    onChange={(e) => setEditForm({ ...editForm, durationMins: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Slots</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.availableSlots}
                    onChange={(e) => setEditForm({ ...editForm, availableSlots: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule New Group Session Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setIsOpen(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs text-zinc-700 dark:text-zinc-300 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Schedule New Group Session</h4>
                <p className="text-[11px] text-zinc-500">Configure timetable details and dispatch notifications to target roles</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                  placeholder="e.g. Morning Yoga & Mobility Flow"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                  placeholder="Describe the session goals, instructor notes, or equipment needed..."
                />
              </div>

              {/* Session Times, Duration, Date, Available Slots */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Session Time *</label>
                  <input
                    type="time"
                    required
                    value={newSession.time}
                    onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Duration (mins) *</label>
                  <input
                    type="number"
                    required
                    min="15"
                    value={newSession.durationMins}
                    onChange={(e) => setNewSession({ ...newSession, durationMins: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Available Slots *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="500"
                    value={newSession.availableSlots}
                    onChange={(e) => setNewSession({ ...newSession, availableSlots: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                    placeholder="e.g. 20"
                  />
                </div>
              </div>

              {/* Notify Roles (Multiple Selection) */}
              <div className="space-y-2 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-blue-500" /> Notify Target Roles (Multiple)
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllRoles}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {newSession.selectedRoles.length === availableRoles.length ? 'Deselect All' : 'Select All Roles'}
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-1">
                  {availableRoles.length === 0 ? (
                    <span className="text-[11px] text-zinc-400">Loading roles...</span>
                  ) : availableRoles.map((role) => {
                    const isSelected = newSession.selectedRoles.includes(role.id);
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleToggleRole(role.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                            : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-blue-400'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {role.label}
                      </button>
                    );
                  })
                  }
                </div>
              </div>

              {/* Branches (Multiple Selection) */}
              <div className="space-y-2 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-500" /> Target Branches (Multiple)
                  </label>
                  {branches.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllBranches}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {newSession.selectedBranchIds.length === branches.length ? 'Deselect All' : 'Select All Branches'}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {branches.length === 0 ? (
                    <span className="text-[11px] text-zinc-400">Loading branches...</span>
                  ) : (
                    branches.map((b) => {
                      const isSelected = newSession.selectedBranchIds.includes(b.id);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleToggleBranch(b.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-indigo-400'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {b.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm shadow-blue-500/20"
                >
                  <Send className="w-4 h-4" />
                  Save & Send Notification to Selected Roles
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
