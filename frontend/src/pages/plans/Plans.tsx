import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Award, Check, Plus, X, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Plan } from '../../types';
import { getPlans, createPlan, updatePlan, deletePlan } from '../../lib/api/plans';
import { usePermissions } from '../../lib/usePermissions';

interface ParsedPlanData {
  cleanDescription: string;
  includedFeatures: string[];
  excludedFeatures: string[];
}

function parsePlanDescription(desc?: string): ParsedPlanData {
  if (!desc) {
    return {
      cleanDescription: 'Standard gym membership tier offering full facility access.',
      includedFeatures: ['Full Gym Floor Access', 'Locker Room & Shower Access'],
      excludedFeatures: ['Personal Trainer Not Included']
    };
  }

  if (desc.includes('---FEATURES---')) {
    const parts = desc.split('---FEATURES---');
    const cleanDescription = parts[0].trim();
    try {
      const parsed = JSON.parse(parts[1].trim());
      return {
        cleanDescription: cleanDescription || 'Standard gym membership tier.',
        includedFeatures: Array.isArray(parsed.included) && parsed.included.length > 0 
          ? parsed.included 
          : ['Full Gym Floor Access'],
        excludedFeatures: Array.isArray(parsed.excluded) ? parsed.excluded : []
      };
    } catch {
      return {
        cleanDescription: cleanDescription || desc,
        includedFeatures: ['Full Gym Floor Access'],
        excludedFeatures: []
      };
    }
  }

  return {
    cleanDescription: desc,
    includedFeatures: ['Full Gym Floor Access', 'Locker Room & Shower Access'],
    excludedFeatures: []
  };
}

function encodePlanDescription(cleanDesc: string, included: string[], excluded: string[]): string {
  const meta = JSON.stringify({
    included: included.filter(x => x && x.trim().length > 0),
    excluded: excluded.filter(x => x && x.trim().length > 0)
  });
  return `${cleanDesc.trim()}\n---FEATURES---\n${meta}`;
}

export const Plans: React.FC = () => {
  const outletContext = useOutletContext<{ selectedBranchId?: string; triggerAnnouncement?: (msg: string) => void }>() || {};
  const triggerAnnouncement = outletContext.triggerAnnouncement || (() => {});
  const { canCreate, canEdit, canDelete } = usePermissions();
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Plan Form State
  const [isOpen, setIsOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: 3000,
    durationMonths: 1,
    includedFeatures: ['Full Gym Floor Access', 'Locker Room & Shower'],
    excludedFeatures: ['Personal Trainer Not Included'],
  });

  // Edit Plan Form State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<{
    id: string;
    name: string;
    description: string;
    price: number;
    durationMonths: number;
    includedFeatures: string[];
    excludedFeatures: string[];
  } | null>(null);

  // Delete Plan Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const fetchPlans = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      triggerAnnouncement(`Failed to load plans: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [triggerAnnouncement]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Handle Create Plan Submit
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.price) return;

    try {
      setIsSubmitting(true);
      const durationDays = Number(newPlan.durationMonths) * 30;
      const fullDescription = encodePlanDescription(
        newPlan.description,
        newPlan.includedFeatures,
        newPlan.excludedFeatures
      );

      const created = await createPlan({
        name: newPlan.name,
        description: fullDescription,
        durationDays: durationDays,
        price: Number(newPlan.price),
        planType: 'STANDARD',
        is_active: true,
      });

      setPlans((prev) => [...prev, created]);
      setIsOpen(false);
      setNewPlan({
        name: '',
        description: '',
        price: 3000,
        durationMonths: 1,
        includedFeatures: ['Full Gym Floor Access', 'Locker Room & Shower'],
        excludedFeatures: ['Personal Trainer Not Included'],
      });
      triggerAnnouncement(`Plan "${created.name || newPlan.name}" created successfully.`);
    } catch (err: any) {
      triggerAnnouncement(`Failed to create plan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (plan: Plan) => {
    const parsed = parsePlanDescription(plan.description);
    const months = Math.max(1, Math.round((plan.durationDays || 30) / 30));
    setEditingPlan({
      id: plan.id,
      name: plan.name || '',
      description: parsed.cleanDescription,
      price: plan.price || 0,
      durationMonths: months,
      includedFeatures: parsed.includedFeatures.length > 0 ? [...parsed.includedFeatures] : ['Full Gym Floor Access'],
      excludedFeatures: [...parsed.excludedFeatures],
    });
    setIsEditOpen(true);
  };

  // Handle Update Plan Submit
  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editingPlan.name || !editingPlan.price) return;

    try {
      setIsSubmitting(true);
      const durationDays = Number(editingPlan.durationMonths) * 30;
      const fullDescription = encodePlanDescription(
        editingPlan.description,
        editingPlan.includedFeatures,
        editingPlan.excludedFeatures
      );

      const updated = await updatePlan(editingPlan.id, {
        name: editingPlan.name,
        description: fullDescription,
        durationDays: durationDays,
        price: Number(editingPlan.price),
      });

      setPlans((prev) => prev.map(p => p.id === editingPlan.id ? { ...p, ...updated } : p));
      setIsEditOpen(false);
      setEditingPlan(null);
      triggerAnnouncement(`Plan "${editingPlan.name}" updated successfully.`);
    } catch (err: any) {
      triggerAnnouncement(`Failed to update plan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Plan
  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    try {
      setIsSubmitting(true);
      await deletePlan(planToDelete.id);
      setPlans((prev) => prev.filter(p => p.id !== planToDelete.id));
      triggerAnnouncement(`Plan "${planToDelete.name}" deleted successfully.`);
      setIsDeleteOpen(false);
      setPlanToDelete(null);
    } catch (err: any) {
      triggerAnnouncement(`Failed to delete plan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Membership Tier Configuration</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Control pricing, package features, and membership tier offerings.</p>
        </div>
        {canCreate('plans') && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm shadow-blue-500/20 active:scale-[0.98] transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Custom Plan
          </button>
        )}
      </div>

      {/* Grid Catalog */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span>Loading membership plans...</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 space-y-3">
          <Award className="w-10 h-10 text-zinc-400 mx-auto opacity-40" />
          <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">No plans available</p>
          <p className="text-xs text-zinc-500">Create custom membership tiers for your gym.</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Plans Catalog">
          {plans.map((p) => {
            const parsed = parsePlanDescription(p.description);
            const priceNum = p?.price != null ? Number(p.price) : 0;
            const durationDays = p?.durationDays != null ? Number(p.durationDays) : 30;
            const durationMonths = Math.max(1, Math.round(durationDays / 30));
            const durationLabel = durationDays % 30 === 0 
              ? `${durationMonths} ${durationMonths === 1 ? 'Month' : 'Months'}` 
              : `${durationDays} Days`;
            const planName = p?.name || 'Unnamed Plan';

            return (
              <div
                key={p.id}
                className="p-6 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between hover:border-blue-500/50 transition relative overflow-hidden group shadow-sm"
              >
                <div>
                  {/* Plan Card Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">{planName}</h4>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1">
                      {canEdit('plans') && (
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Plan"
                          className="p-1.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete('plans') && (
                        <button
                          onClick={() => { setPlanToDelete(p); setIsDeleteOpen(true); }}
                          title="Delete Plan"
                          className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 mb-4 min-h-[32px]">{parsed.cleanDescription}</p>

                  {/* Price & Duration */}
                  <div className="mb-6 flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">₹{priceNum.toLocaleString()}</span>
                    <span className="text-xs text-zinc-400 font-medium">/ {durationLabel}</span>
                  </div>

                  {/* What You Will Get */}
                  <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 mb-4">
                    <span className="block text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">What you will get</span>
                    {parsed.includedFeatures.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* What You Will NOT Get */}
                  {parsed.excludedFeatures.length > 0 && (
                    <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 mb-6 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                      <span className="block text-[10px] uppercase font-bold text-red-500 dark:text-red-400 tracking-wider">What you will not get</span>
                      {parsed.excludedFeatures.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-zinc-400">
                          <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <span className="line-through text-zinc-400">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action Bar */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-2 text-[10px] font-mono">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="px-3 py-1.5 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-800 transition flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => { setPlanToDelete(p); setIsDeleteOpen(true); }}
                    className="px-3 py-1.5 font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 rounded-lg border border-red-200 dark:border-red-800 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Create Plan Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setIsOpen(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs text-zinc-700 dark:text-zinc-300 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Create New Membership Plan</h4>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Plan Name */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                  placeholder="e.g. Gold Annual Transformation"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                  placeholder="Brief summary of membership benefits"
                />
              </div>

              {/* What you will get with this plan (+ button) */}
              <div className="space-y-2 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-950 bg-emerald-50/40 dark:bg-emerald-950/10">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-emerald-700 dark:text-emerald-400">What you will get with this plan</label>
                  <button
                    type="button"
                    onClick={() => setNewPlan({ ...newPlan, includedFeatures: [...newPlan.includedFeatures, ''] })}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Feature
                  </button>
                </div>
                
                {newPlan.includedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const updated = [...newPlan.includedFeatures];
                        updated[idx] = e.target.value;
                        setNewPlan({ ...newPlan, includedFeatures: updated });
                      }}
                      className="flex-1 px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                      placeholder={`Included feature #${idx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = newPlan.includedFeatures.filter((_, i) => i !== idx);
                        setNewPlan({ ...newPlan, includedFeatures: updated });
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* What you will NOT get with this plan (+ button) */}
              <div className="space-y-2 p-3.5 rounded-xl border border-red-200 dark:border-red-950 bg-red-50/40 dark:bg-red-950/10">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-red-700 dark:text-red-400">What you will not get with this plan</label>
                  <button
                    type="button"
                    onClick={() => setNewPlan({ ...newPlan, excludedFeatures: [...newPlan.excludedFeatures, ''] })}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Limitation
                  </button>
                </div>

                {newPlan.excludedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const updated = [...newPlan.excludedFeatures];
                        updated[idx] = e.target.value;
                        setNewPlan({ ...newPlan, excludedFeatures: updated });
                      }}
                      className="flex-1 px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                      placeholder={`Limitation / Exclusion #${idx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = newPlan.excludedFeatures.filter((_, i) => i !== idx);
                        setNewPlan({ ...newPlan, excludedFeatures: updated });
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Price & Duration in Months */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Duration (in Months) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newPlan.durationMonths}
                    onChange={(e) => setNewPlan({ ...newPlan, durationMonths: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1 font-mono">Calculated: {Number(newPlan.durationMonths) * 30} days</p>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex justify-end gap-2">
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {isEditOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setIsEditOpen(false)}>
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs text-zinc-700 dark:text-zinc-300 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Edit Membership Plan</h4>
              <button onClick={() => setIsEditOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlan} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                <input
                  type="text"
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* What you will get (+ button) */}
              <div className="space-y-2 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-950 bg-emerald-50/40 dark:bg-emerald-950/10">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-emerald-700 dark:text-emerald-400">What you will get with this plan</label>
                  <button
                    type="button"
                    onClick={() => setEditingPlan({ ...editingPlan, includedFeatures: [...editingPlan.includedFeatures, ''] })}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Feature
                  </button>
                </div>
                
                {editingPlan.includedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const updated = [...editingPlan.includedFeatures];
                        updated[idx] = e.target.value;
                        setEditingPlan({ ...editingPlan, includedFeatures: updated });
                      }}
                      className="flex-1 px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = editingPlan.includedFeatures.filter((_, i) => i !== idx);
                        setEditingPlan({ ...editingPlan, includedFeatures: updated });
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* What you will NOT get (+ button) */}
              <div className="space-y-2 p-3.5 rounded-xl border border-red-200 dark:border-red-950 bg-red-50/40 dark:bg-red-950/10">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-red-700 dark:text-red-400">What you will not get with this plan</label>
                  <button
                    type="button"
                    onClick={() => setEditingPlan({ ...editingPlan, excludedFeatures: [...editingPlan.excludedFeatures, ''] })}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Limitation
                  </button>
                </div>

                {editingPlan.excludedFeatures.map((feat, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const updated = [...editingPlan.excludedFeatures];
                        updated[idx] = e.target.value;
                        setEditingPlan({ ...editingPlan, excludedFeatures: updated });
                      }}
                      className="flex-1 px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = editingPlan.excludedFeatures.filter((_, i) => i !== idx);
                        setEditingPlan({ ...editingPlan, excludedFeatures: updated });
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Duration (in Months) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingPlan.durationMonths}
                    onChange={(e) => setEditingPlan({ ...editingPlan, durationMonths: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1 font-mono">Calculated: {Number(editingPlan.durationMonths) * 30} days</p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteOpen && planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setIsDeleteOpen(false)}>
          <div className="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-xs text-zinc-700 dark:text-zinc-300 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2.5 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Delete Membership Tier</h4>
                <p className="text-[11px] text-zinc-500">This action soft-deletes the plan offering.</p>
              </div>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete <strong className="text-zinc-900 dark:text-zinc-100">{planToDelete.name}</strong>?
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
