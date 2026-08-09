import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users, Plus, X, Phone, Mail, MessageSquare, RefreshCw,
  ChevronRight, Search, UserCheck, Sparkles, Tag, Trash2, Edit3, Building2
} from 'lucide-react';
import { Lead, getLeadsByOrg, createLead, updateLead, deleteLead } from '../../lib/api/crm';
import { getMyOrg } from '../../lib/api/organizations';
import { Branch } from '../../types';

const STATUS_CONFIG = {
  NEW: { label: 'New Lead', color: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  FOLLOW_UP: { label: 'Follow-Up', color: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  CONVERTED: { label: 'Converted ✓', color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
};

const SOURCES = ['Walk-In', 'Phone Call', 'WhatsApp', 'Instagram', 'Website', 'Referral', 'Other'];

const EMPTY_FORM = { name: '', phone: '', email: '', source: 'Walk-In', status: 'NEW' as Lead['status'], notes: '' };

export const CRM: React.FC = () => {
  const { triggerAnnouncement, selectedBranchId, branches } = useOutletContext<{ triggerAnnouncement: (msg: string) => void; selectedBranchId: string; branches: Branch[] }>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orgId, setOrgId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async (oid: string) => {
    setIsLoading(true);
    try {
      const data = await getLeadsByOrg(oid);
      setLeads(Array.isArray(data) ? data : []);
    } catch (err: any) {
      triggerAnnouncement(`Failed to load leads: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [triggerAnnouncement]);

  useEffect(() => {
    getMyOrg().then(org => {
      if (org?.id) {
        setOrgId(org.id);
        load(org.id);
      }
    });
  }, [load]);

  const openCreate = () => {
    setEditingLead(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setForm({ name: lead.name, phone: lead.phone, email: lead.email || '', source: lead.source || 'Walk-In', status: lead.status, notes: lead.notes || '' });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setIsSaving(true);
    try {
      if (editingLead?.id) {
        const updated = await updateLead(editingLead.id, { ...form, orgId, branchId: selectedBranchId });
        setLeads(prev => prev.map(l => l.id === editingLead.id ? updated : l));
        triggerAnnouncement(`Lead "${updated.name}" updated.`);
      } else {
        const created = await createLead({ ...form, orgId, branchId: selectedBranchId });
        setLeads(prev => [created, ...prev]);
        triggerAnnouncement(`New lead "${created.name}" added.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      triggerAnnouncement(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (lead: Lead) => {
    if (!lead.id || !window.confirm(`Delete lead "${lead.name}"?`)) return;
    try {
      await deleteLead(lead.id);
      setLeads(prev => prev.filter(l => l.id !== lead.id));
      triggerAnnouncement(`Lead "${lead.name}" removed.`);
    } catch (err: any) {
      triggerAnnouncement(`Delete failed: ${err.message}`);
    }
  };

  const handleQuickStatus = async (lead: Lead, status: Lead['status']) => {
    if (!lead.id) return;
    try {
      const updated = await updateLead(lead.id, { status });
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status } : l));
      triggerAnnouncement(`"${lead.name}" → ${status}`);
    } catch (err: any) {
      triggerAnnouncement(`Update failed: ${err.message}`);
    }
  };

  const filtered = leads.filter(l => {
    const matchStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.phone.includes(q) || (l.email || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = { NEW: leads.filter(l => l.status === 'NEW').length, FOLLOW_UP: leads.filter(l => l.status === 'FOLLOW_UP').length, CONVERTED: leads.filter(l => l.status === 'CONVERTED').length };

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Lead CRM
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Track walk-ins, calls, and enquiries — convert them into members.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => orgId && load(orgId)} className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-lg shadow-blue-500/20">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map(s => (
          <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'ALL' : s)}
            className={`p-4 rounded-2xl border-2 text-left transition ${statusFilter === s ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-300'}`}>
            <div className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_CONFIG[s].color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
              {STATUS_CONFIG[s].label}
            </div>
            <div className="mt-2 text-3xl font-black text-zinc-900 dark:text-zinc-50">{counts[s]}</div>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2">
          {['ALL', 'NEW', 'FOLLOW_UP', 'CONVERTED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Leads List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading leads…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UserCheck className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="font-bold text-zinc-700 dark:text-zinc-300">No leads found</p>
          <p className="text-sm text-zinc-400 mt-1">Add your first walk-in or phone enquiry to start tracking.</p>
          <button onClick={openCreate} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(lead => {
            const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
            return (
              <div key={lead.id} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-300 dark:hover:border-blue-700 transition flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  {lead.name.substring(0, 2).toUpperCase()}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">{lead.name}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                    </span>
                    {lead.source && <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1"><Tag className="w-3 h-3" />{lead.source}</span>}
                    {lead.branchId && branches && (
                      <span className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {branches.find(b => b.id === lead.branchId)?.name || 'Unknown Branch'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 flex-wrap">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>
                    {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>}
                    {lead.notes && <span className="flex items-center gap-1 truncate max-w-xs"><MessageSquare className="w-3 h-3" />{lead.notes}</span>}
                  </div>
                </div>
                {/* Quick status change */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {(['NEW', 'FOLLOW_UP', 'CONVERTED'] as Lead['status'][]).filter(s => s !== lead.status).map(s => (
                    <button key={s} onClick={() => handleQuickStatus(lead, s)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                      → {s.replace('_', ' ')}
                    </button>
                  ))}
                  <button onClick={() => openEdit(lead)} className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition" title="Edit">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(lead)} className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-5 h-5" />
                <span className="font-black">{editingLead ? 'Edit Lead' : 'Add New Lead'}</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1 block">Full Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1 block">Phone *</label>
                  <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1 block">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@email.com" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1 block">Source</label>
                  <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Lead['status'] }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="NEW">New Lead</option>
                    <option value="FOLLOW_UP">Follow-Up</option>
                    <option value="CONVERTED">Converted</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1 block">Notes</label>
                  <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Interested in 3-month membership…" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                  {editingLead ? 'Update Lead' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
