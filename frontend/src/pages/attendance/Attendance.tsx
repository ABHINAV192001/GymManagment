import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserCheck, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { Member } from '../../types';
import { checkIn } from '../../lib/api/attendance';
import { getUsers } from '../../lib/api/admin';

export const Attendance: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    getUsers()
      .then(setMembers)
      .catch(err => triggerAnnouncement(`Failed to load members: ${err.message}`));
  }, [triggerAnnouncement]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCheckin, setActiveCheckin] = useState<Member | null>(null);
  const [checkinTime, setCheckinTime] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setActiveCheckin(null);
    setCheckinTime(null);

    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    // Search for member matching name or phone
    const member = members.find((m) => {
      return m.name.toLowerCase().includes(q) || m.phone.includes(q);
    });

    if (!member) {
      setErrorMsg('No registered member matched that name or contact phone.');
      triggerAnnouncement('Scan failed. Member not found in database.');
      return;
    }

    if (!member.isActive) {
      setErrorMsg(`Access denied! Membership for ${member.name} is inactive.`);
      triggerAnnouncement(`Access denied for ${member.name}. Membership inactive.`);
      return;
    }

    try {
      const log = await checkIn(member.id, member.branchId);
      setActiveCheckin(member);
      setCheckinTime(log?.checkInTime || new Date().toISOString());
      setSearchQuery('');
      triggerAnnouncement(`Access Granted. ${member.name} checked in successfully.`);
    } catch (err: any) {
      setErrorMsg(`Check-in failed: ${err.message}`);
      triggerAnnouncement('API error during check-in.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Search Input Box & Scan Camera simulation */}
      <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm mb-2 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-500" /> Member Entrance Desk
          </h3>
          <p className="text-xs text-zinc-500 mb-6">Enter a client's name, barcode, or mobile number to record check-in logs instantly.</p>

          <form onSubmit={handleManualCheckIn} className="space-y-4">
            <div className="relative text-xs">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Enter client phone number or full name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold"
                aria-label="Scan search input"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
            >
              Simulate Desk Scan (Trigger Check-in)
            </button>
          </form>

          {errorMsg && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 mt-4 flex gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-semibold">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* High contrast laser check-in barcode simulator overlay */}
        <div className="p-6 rounded-xl border-4 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 relative overflow-hidden h-40 flex flex-col justify-center items-center mt-6">
          <div className="absolute top-0 bottom-0 left-0 right-0 border border-blue-400 opacity-20 pointer-events-none" />
          <div className="w-4/5 h-0.5 bg-red-500 animate-pulse relative z-10" /> {/* Laser line simulation */}
          <span className="text-[10px] font-mono font-extrabold text-zinc-400 tracking-wider uppercase mt-4">
            Place Barcode / App QR Code under screen
          </span>
        </div>
      </div>

      {/* Check-in result status dashboard feedback */}
      <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm mb-4">Check-in verification feedback</h3>

        {activeCheckin ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/15 flex gap-4 items-start">
              <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">ACCESS GRANTED</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  <strong>Client Name:</strong> <span className="font-bold">{activeCheckin.name}</span>
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  <strong>Contact Mobile:</strong> <span className="font-mono">{activeCheckin.phone}</span>
                </p>
              </div>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-900 border-t border-zinc-100 dark:border-zinc-900/50 pt-2 text-xs space-y-3">
              <div className="pt-2">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase">Check-in recorded at</span>
                <p className="font-bold mt-0.5 text-zinc-800 dark:text-zinc-200">
                  <span className="text-blue-600 dark:text-blue-400">{checkinTime ? new Date(checkinTime).toLocaleString() : '—'}</span>
                </p>
              </div>

              {activeCheckin.trainerName && (
                <div className="pt-3">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase">Assigned Trainer</span>
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">{activeCheckin.trainerName}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-64 text-center text-zinc-400 space-y-2">
            <UserCheck className="w-12 h-12 text-zinc-300" />
            <p className="text-xs font-bold">Scanning terminal is idle.</p>
            <p className="text-[10px] text-zinc-400 max-w-xs">Scan or enter member credentials on the left to confirm active access status.</p>
          </div>
        )}
      </div>
    </div>
  );
};
