import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { UserCheck, CheckCircle, Search, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Member, Branch } from '../../types';
import { checkIn, generateBranchQr, searchAttendance } from '../../lib/api/attendance';
import { getUsers } from '../../lib/api/admin';
import { getBranches } from '../../lib/api/branches';
import { QRCodeSVG } from 'qrcode.react';
import { usePermissions } from '../../lib/usePermissions';

export const Attendance: React.FC = () => {
  const { selectedBranchId, triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  const { canCreate, canView } = usePermissions();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  
  // Search and Filter States
  const [logs, setLogs] = useState<any[]>([]);
  const [filterBranchId, setFilterBranchId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  // QR Data
  const [qrCodeData, setQrCodeData] = useState<string>('');

  // Check-in Simulation States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCheckin, setActiveCheckin] = useState<Member | null>(null);
  const [checkinTime, setCheckinTime] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Load initial data
  useEffect(() => {
    getBranches().then(setBranches).catch(console.error);
    getUsers({ size: 1000 })
      .then(res => setMembers(res.members))
      .catch(err => triggerAnnouncement(`Failed to load members: ${err.message}`));
  }, [triggerAnnouncement]);

  // Load attendance based on filters
  const loadAttendance = async () => {
    if (!canView('attendance')) return;
    try {
      const effectiveBranchId = (filterBranchId && filterBranchId !== 'ALL') ? filterBranchId : ((selectedBranchId && selectedBranchId !== 'ALL') ? selectedBranchId : null);
      const res = await searchAttendance({
        branchId: effectiveBranchId,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        search: tableSearchQuery || null,
        page,
        size: 10
      });
      setLogs(res.logs);
      setTotalElements(res.totalElements);
      setTotalPages(Math.ceil(res.totalElements / 10));
    } catch (err: any) {
      console.error('Failed to load logs', err);
    }
  };

  useEffect(() => {
    loadAttendance();
    // Polling removed to stop redundant API calls
  }, [filterBranchId, selectedBranchId, startDate, endDate, tableSearchQuery, page]);

  // Generate QR
  const handleGenerateQr = async () => {
    const branchToQr = (filterBranchId && filterBranchId !== 'ALL') ? filterBranchId : ((selectedBranchId && selectedBranchId !== 'ALL') ? selectedBranchId : null);
    if (branchToQr) {
      try {
        const qrData = await generateBranchQr(branchToQr);
        setQrCodeData(qrData);
        triggerAnnouncement('Branch QR Code generated successfully.');
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to generate branch QR code.');
      }
    } else {
      setErrorMsg('Please select a branch to generate the QR code.');
    }
  };

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
      loadAttendance(); // refresh feed on manual check-in
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
          <p className="text-xs text-zinc-500 mb-6">Generate a unique Branch Entry QR Code. Members can scan this QR in their app to securely check-in and mark attendance for the day.</p>

          {canCreate('attendance') && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGenerateQr}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
              >
                Generate Branch QR
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400 mt-4 flex gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-semibold">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Branch QR Code Display */}
        <div className="p-6 rounded-xl border-4 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col justify-center items-center mt-6">
          <QRCodeSVG 
            value={qrCodeData || 'NO_DATA'} 
            size={180} 
            level="H" 
            includeMargin 
            className="bg-white p-2 rounded-xl shadow-sm" 
          />
          <span className="text-[10px] font-mono font-extrabold text-zinc-400 tracking-wider uppercase mt-4 text-center">
            Branch Entry QR Code<br/>Users scan this in their app to mark attendance
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

      {/* Attendance Feed / Search */}
      <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm lg:col-span-2">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm whitespace-nowrap">Attendance Logs</h3>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={filterBranchId}
              onChange={(e) => { setFilterBranchId(e.target.value); setPage(0); }}
              className="px-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-medium"
            >
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            
            <input 
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
              className="px-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-medium"
            />
            
            <span className="text-xs text-zinc-400">to</span>
            
            <input 
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
              className="px-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-medium"
            />
            
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
              <input 
                type="text" 
                placeholder="Search name..."
                value={tableSearchQuery}
                onChange={(e) => { setTableSearchQuery(e.target.value); setPage(0); }}
                className="pl-8 pr-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-medium"
              />
            </div>

            <button 
              onClick={loadAttendance}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-500 dark:text-zinc-400">
              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Time</th>
                  <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Name</th>
                  <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {logs.map((log: any, idx) => (
                  <tr key={log.id || idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3 font-mono text-[10px] text-zinc-400">
                      {new Date(log.checkInTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {log.userName || log.staffName || log.entityId}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-[10px] border border-emerald-200 dark:border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" /> Checked In
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-4 py-3 border-t border-zinc-100 dark:border-zinc-800/50 text-xs">
                <span className="text-zinc-500">
                  Showing page {page + 1} of {totalPages} ({totalElements} total entries)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="p-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-1.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            <p className="text-xs font-semibold">No attendances found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
