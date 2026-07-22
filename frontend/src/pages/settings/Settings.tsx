import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Settings as Gear, DollarSign, Calendar, ShieldCheck, Check, Info } from 'lucide-react';
import { Organization } from '../../types';
import { getMyOrg, updateMyOrg } from '../../lib/api/organizations';

export const Settings: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ triggerAnnouncement: (msg: string) => void }>();
  const [org, setOrg] = useState<Organization | null>(null);

  const [orgForm, setOrgForm] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
  });

  const [gracePeriod, setGracePeriod] = useState('7');
  const [defaultCheckin, setDefaultCheckin] = useState('QR');
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    getMyOrg()
      .then(data => {
        setOrg(data);
        setOrgForm({
          name: data.name || 'FitLife Health Clubs',
          email: data.email || 'corporate@fitlife.com',
          phone: data.phone || '9999999999',
          gstin: data.gstin || '27XXXXX8912C1ZS',
        });
      })
      .catch(err => triggerAnnouncement(`Failed to load org details: ${err.message}`));
  }, []);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;

    try {
      const updated = await updateMyOrg({
        name: orgForm.name,
        email: orgForm.email,
        phone: orgForm.phone,
        gstin: orgForm.gstin,
      });
      setOrg(updated);
      triggerAnnouncement('Global organizational preferences updated.');
    } catch (err: any) {
      triggerAnnouncement(`Failed to update org details: ${err.message}`);
    }
  };

  if (!org) {
    return <div className="p-8 text-center text-zinc-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 text-xs text-zinc-700 dark:text-zinc-300">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Legal Organization info */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm mb-4 flex items-center gap-2">
            <Gear className="w-5 h-5 text-blue-500" /> Organizational Profile Setup
          </h3>

          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Business Legal Name *</label>
              <input
                type="text"
                required
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={orgForm.email}
                  onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Corporate Phone</label>
                <input
                  type="text"
                  value={orgForm.phone}
                  onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Central GSTIN ID Number</label>
              <input
                type="text"
                value={orgForm.gstin}
                onChange={(e) => setOrgForm({ ...orgForm, gstin: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono font-bold"
              />
            </div>

            <button
              type="submit"
              className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
            >
              Update Profile Preferences
            </button>
          </form>
        </div>

        {/* Right Column: Defaults, Grace periods and actions */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Defaults & Rules</h3>
            
            <div>
              <label className="block font-semibold mb-1">Default Entrance Check-in Method</label>
              <select
                value={defaultCheckin}
                onChange={(e) => setDefaultCheckin(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
              >
                <option value="QR">Gym App QR / Barcode Scan</option>
                <option value="BIOMETRIC">Biometric Fingerprint Scanner</option>
                <option value="PIN">Clerk Pin Entry Pad</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Payment Grace Period (days)</label>
              <input
                type="number"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Currency Code</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
              >
                <option value="INR">INR (Indian Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>
          </div>

          {/* Hard database actions */}
          <div className="p-6 rounded-xl border border-red-200 bg-red-50/20 dark:bg-red-950/10 space-y-3">
            <h3 className="font-bold text-red-800 dark:text-red-400 text-sm">System Database Maintenance</h3>
            <p className="text-zinc-500 text-[11px]">Warning: Resetting local state will wipe out all currently custom added members, workouts, and ledger files. Baselines will be restored.</p>
            <button
              onClick={() => {
                // Feature currently disabled with real DB
                triggerAnnouncement('Reset session data is disabled while using live backend.');
              }}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg focus:outline-2 focus:outline-red-500 focus:outline-offset-2"
            >
              Reset Session Data
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
