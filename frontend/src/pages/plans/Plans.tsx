import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Award, ShieldCheck, Check, Plus, X, DollarSign, Dumbbell } from 'lucide-react';
import { Plan } from '../../types';
import { getPlans, createPlan } from '../../lib/api/plans';

export const Plans: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  const [plans, setPlans] = useState<Plan[]>([]);
  
  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch((err) => triggerAnnouncement(`Failed to load plans: ${err.message}`));
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    durationDays: 30,
    price: 3000,
    planType: 'STANDARD' as any,
    gymAccess: true,
    classAccess: false,
    ptSessions: 0,
    dietPlanAccess: false,
    appAccess: true,
  });

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.price) return;

    try {
      const created = await createPlan({
        name: newPlan.name,
        description: newPlan.description,
        durationDays: Number(newPlan.durationDays),
        price: Number(newPlan.price),
        planType: newPlan.planType,
        features: {
          gymAccess: newPlan.gymAccess,
          classAccess: newPlan.classAccess,
          ptSessions: Number(newPlan.ptSessions),
          dietPlanAccess: newPlan.dietPlanAccess,
          appAccess: newPlan.appAccess,
        },
        is_active: true,
      });

      setPlans([...plans, created]);
      setIsOpen(false);
      triggerAnnouncement(`Plan ${created.name} added to subscription offerings.`);
    } catch (err: any) {
      triggerAnnouncement(`Failed to create plan: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Membership Tier Configuration</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Control pricing, package features, and feature toggles.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow"
        >
          <Plus className="w-4 h-4" /> Create Custom Plan
        </button>
      </div>

      {/* Grid catalog */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Plans Catalog">
        {plans.map((p) => (
          <div
            key={p.id}
            className="p-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between hover:border-blue-500 transition relative overflow-hidden"
          >
            {p.planType === 'PRIME_PT' && (
              <span className="absolute right-0 top-0 bg-blue-500 text-white text-[9px] uppercase font-bold px-3 py-1 rounded-bl-lg">
                PT Focus
              </span>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-blue-500" />
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">{p.name}</h4>
              </div>
              <p className="text-xs text-zinc-500 mb-4">{p.description}</p>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">₹{p.price.toLocaleString()}</span>
                <span className="text-xs text-zinc-400">/ {p.durationDays} days</span>
              </div>

              {/* Feature checkboxes list */}
              <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300 mb-6">
                <span className="block text-[10px] uppercase font-bold text-zinc-400 mb-2">What's Included</span>
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${p.features.gymAccess ? 'text-emerald-500' : 'text-zinc-300'}`} />
                  <span className={p.features.gymAccess ? 'font-bold' : 'line-through text-zinc-400'}>Full Gym Floor Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${p.features.classAccess ? 'text-emerald-500' : 'text-zinc-300'}`} />
                  <span className={p.features.classAccess ? 'font-bold' : 'line-through text-zinc-400'}>Studio Group Classes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${p.features.ptSessions > 0 ? 'text-emerald-500' : 'text-zinc-300'}`} />
                  <span className={p.features.ptSessions > 0 ? 'font-bold' : 'line-through text-zinc-400'}>
                    {p.features.ptSessions > 0 ? `${p.features.ptSessions} PT Sessions Included` : 'No Personal Coach'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${p.features.dietPlanAccess ? 'text-emerald-500' : 'text-zinc-300'}`} />
                  <span className={p.features.dietPlanAccess ? 'font-bold' : 'line-through text-zinc-400'}>Diet & Macro Consultation</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 text-center text-[10px] text-zinc-400 font-mono">
              CURRENCY: {p.currency} | ID: {p.id.toUpperCase()}
            </div>
          </div>
        ))}
      </section>

      {/* Creation Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="plan-modal-heading">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs text-zinc-700 dark:text-zinc-300">
            <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <h4 id="plan-modal-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Create New Custom Plan</h4>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                  placeholder="e.g. 6 Months Body Transformation"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Brief Description</label>
                <input
                  type="text"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                  placeholder="What makes this plan unique?"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Duration (days)</label>
                  <input
                    type="number"
                    value={newPlan.durationDays}
                    onChange={(e) => setNewPlan({ ...newPlan, durationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t pt-3 border-zinc-100 dark:border-zinc-900">
                <span className="block font-bold text-zinc-500 mb-1">Included Privileges</span>
                <div className="flex justify-between items-center">
                  <span>Full Gym Floor Access</span>
                  <input
                    type="checkbox"
                    checked={newPlan.gymAccess}
                    onChange={(e) => setNewPlan({ ...newPlan, gymAccess: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 border-zinc-300 dark:border-zinc-700 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>Group Studio Classes</span>
                  <input
                    type="checkbox"
                    checked={newPlan.classAccess}
                    onChange={(e) => setNewPlan({ ...newPlan, classAccess: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 border-zinc-300 dark:border-zinc-700 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>Assigned PT Session Count</span>
                  <input
                    type="number"
                    value={newPlan.ptSessions}
                    onChange={(e) => setNewPlan({ ...newPlan, ptSessions: Number(e.target.value) })}
                    className="w-16 px-1.5 py-1 text-center border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-md text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>Nutrition & Diet Coach Access</span>
                  <input
                    type="checkbox"
                    checked={newPlan.dietPlanAccess}
                    onChange={(e) => setNewPlan({ ...newPlan, dietPlanAccess: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 border-zinc-300 dark:border-zinc-700 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
                >
                  Create Package Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
