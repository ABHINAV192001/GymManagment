import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Settings as Gear, DollarSign, Calendar, ShieldCheck, Check, Info, X } from 'lucide-react';
import { Organization, Branch } from '../../types';
import { getMyOrg, updateMyOrg } from '../../lib/api/organizations';
import { getBranches, updateBranch } from '../../lib/api/branches';

export const Settings: React.FC = () => {
  const { selectedBranchId, triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  const [org, setOrg] = useState<Organization | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [ptPercentage, setPtPercentage] = useState<number>(0);

  const [orgForm, setOrgForm] = useState({
    orgCode: '',
    username: '',
    name: '',
    ownerEmail: '',
    phone: '',
    gst: '',
    logoUrl: '',
    password: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [gracePeriod, setGracePeriod] = useState('7');
  const [defaultCheckin, setDefaultCheckin] = useState('QR');
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    Promise.all([
      getMyOrg(),
      getBranches()
    ])
      .then(([orgData, branchesData]) => {
        setOrg(orgData);
        setOrgForm({
          orgCode: orgData?.orgCode || '',
          username: orgData?.username || '',
          name: orgData?.name || 'FitLife Health Clubs',
          ownerEmail: orgData?.ownerEmail || 'corporate@fitlife.com',
          phone: orgData?.phone || '9999999999',
          gst: orgData?.gst || '27XXXXX8912C1ZS',
          logoUrl: orgData?.logoUrl || '',
          password: '',
        });

        setBranches(branchesData);
        const currentBranch = branchesData.find((b: Branch) => b.id === selectedBranchId);
        if (currentBranch) {
          setBranch(currentBranch);
          setPtPercentage(currentBranch.defaultPtTrainerPercentage || 0);
        } else if (branchesData.length > 0) {
          setBranch(branchesData[0]);
          setPtPercentage(branchesData[0].defaultPtTrainerPercentage || 0);
        }
      })
      .catch(err => triggerAnnouncement(`Failed to load settings: ${err.message}`));
  }, [selectedBranchId, triggerAnnouncement]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setShowPasswordModal(true);
  };

  const confirmUpdateSettings = async () => {
    if (!orgForm.password) {
      triggerAnnouncement('Password is required to confirm changes');
      return;
    }

    try {
      const updated = await updateMyOrg({
        orgCode: orgForm.orgCode,
        username: orgForm.username,
        name: orgForm.name,
        ownerEmail: orgForm.ownerEmail,
        phone: orgForm.phone,
        gst: orgForm.gst,
        logoUrl: orgForm.logoUrl,
        password: orgForm.password,
      });
      setOrg(updated);
      setOrgForm(prev => ({ ...prev, password: '' }));
      setShowPasswordModal(false);
      window.dispatchEvent(new Event('gymos_org_updated'));
      triggerAnnouncement('Global organizational preferences updated.');
    } catch (err: any) {
      triggerAnnouncement(`Failed to update org details: ${err.message}`);
    }
  };

  const handleUpdateBranchSettings = async () => {
    if (!branch) return;
    try {
      const updated = await updateBranch(branch.id, {
        name: branch.name,
        branchCode: branch.branchCode,
        adminUserId: branch.adminUserId,
        defaultPtTrainerPercentage: ptPercentage
      });
      setBranches(prev => prev.map(b => b.id === updated.id ? updated : b));
      setBranch(updated);
      triggerAnnouncement('Branch preferences updated.');
    } catch (err: any) {
      triggerAnnouncement(`Failed to update branch settings: ${err.message}`);
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

            <div>
              <label className="block font-semibold mb-1">Organization Logo</label>
              <div className="flex items-center gap-4">
                {orgForm.logoUrl && (
                  <img src={orgForm.logoUrl} alt="Logo Preview" className="w-12 h-12 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setOrgForm({ ...orgForm, logoUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-zinc-800 dark:file:text-zinc-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={orgForm.ownerEmail}
                  onChange={(e) => setOrgForm({ ...orgForm, ownerEmail: e.target.value })}
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
                value={orgForm.gst}
                onChange={(e) => setOrgForm({ ...orgForm, gst: e.target.value })}
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
              <p className="text-[10px] text-zinc-500 mt-1">Note: This is currently a visual placeholder and does not lock members out automatically yet.</p>
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
            
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <label className="block font-semibold mb-1">Select Branch to Configure</label>
              <select
                value={branch?.id || ''}
                onChange={(e) => {
                  const b = branches.find(br => br.id === e.target.value);
                  if (b) {
                    setBranch(b);
                    setPtPercentage(b.defaultPtTrainerPercentage || 0);
                  }
                }}
                className="w-full px-3 py-2 mb-3 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.branchCode})</option>
                ))}
              </select>

              <label className="block font-semibold mb-1">Default PT Income Share (%)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={ptPercentage}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    const num = Number(val);
                    if (num >= 0 && num <= 100) {
                      setPtPercentage(num);
                    }
                  }}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                />
                <button
                  type="button"
                  onClick={handleUpdateBranchSettings}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg whitespace-nowrap"
                >
                  Save Branch
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Updates the default PT percentage for the selected branch.</p>
            </div>
          </div>

        </div>

      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => {
          setShowPasswordModal(false);
          setOrgForm(prev => ({ ...prev, password: '' }));
        }}>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Confirm Password *</h3>
              <button onClick={() => {
                  setShowPasswordModal(false);
                  setOrgForm(prev => ({ ...prev, password: '' }));
                }} className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Please enter your password to authorize these changes.</p>
            <input
              type="password"
              required
              value={orgForm.password}
              onChange={(e) => setOrgForm({ ...orgForm, password: e.target.value })}
              className="w-full px-3 py-2 mb-4 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter password to confirm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmUpdateSettings();
                if (e.key === 'Escape') {
                  setShowPasswordModal(false);
                  setOrgForm(prev => ({ ...prev, password: '' }));
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setOrgForm(prev => ({ ...prev, password: '' }));
                }}
                className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateSettings}
                className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
