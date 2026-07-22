import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Mail, Phone, Plus, Send, X, BookOpen, Clock, CheckCircle, HelpCircle } from 'lucide-react';
import { NotificationTemplate, NotificationLog, Member } from '../../types';
import { getTemplates, getNotificationLogs, sendNotification } from '../../lib/api/notifications';
import { getUsers } from '../../lib/api/admin';

export const Notifications: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    Promise.all([getTemplates(), getNotificationLogs(), getUsers()])
      .then(([tpls, lgs, mems]) => {
        setTemplates(tpls);
        setLogs(lgs);
        setMembers(mems);
      })
      .catch(err => triggerAnnouncement(`Failed to load data: ${err.message}`));
  }, []);

  const [selectedTemplateId, setSelectedTemplateId] = useState('nt-1');
  const [audienceFilter, setAudienceFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleSendBlast = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determine audience
    const targetMembers = members.filter((m) => {
      if (audienceFilter === 'ACTIVE') return m.isActive;
      if (audienceFilter === 'EXPIRED') return !m.isActive;
      return true;
    });

    if (targetMembers.length === 0) {
      triggerAnnouncement('Broadcast failed. Target audience segment is empty.');
      return;
    }

    try {
      const channel = whatsappEnabled ? 'WHATSAPP' : 'EMAIL';
      const userIds = targetMembers.map(m => m.id);

      await sendNotification({
        templateId: activeTemplate.id,
        userIds,
        channel,
      });

      // Update local logs for immediate feedback (optimistic update)
      const newLogs = targetMembers.map(m => {
        let body = activeTemplate.body
          .replace('{member_name}', m.name)
          .replace('{plan_name}', 'Active Plan')
          .replace('{expiry_date}', m.endDate || '')
          .replace('{branch_name}', 'Branch')
          .replace('{amount}', '0');

        return {
          id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          templateName: activeTemplate.name,
          recipientName: m.name,
          channel: channel as 'WHATSAPP' | 'EMAIL',
          body: body,
          status: 'SENT',
          sentAt: new Date().toLocaleTimeString(),
        } as NotificationLog;
      });

      setLogs([...newLogs, ...logs]);
      triggerAnnouncement(`Bulk announcement dispatched successfully to ${targetMembers.length} targeted members.`);
    } catch (err: any) {
      triggerAnnouncement(`Failed to dispatch broadcast: ${err.message}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Template composition and segment selector */}
      <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm mb-2 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-500" /> WhatsApp & Email Blast Engine
          </h3>
          <p className="text-xs text-zinc-500 mb-6">Create templates with variables and dispatch targeted text reminders to selected client cohorts.</p>

          <form onSubmit={handleSendBlast} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Select Message Template *</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>
                ))}
              </select>
            </div>

            {/* Template preview box */}
            <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Message Body Preview</span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed font-sans italic">
                "{activeTemplate?.body}"
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                <span>Variables:</span>
                <span className="bg-blue-50 dark:bg-blue-950/20 px-1 py-0.5 rounded">{"{member_name}"}</span>
                <span className="bg-blue-50 dark:bg-blue-950/20 px-1 py-0.5 rounded">{"{plan_name}"}</span>
                <span className="bg-blue-50 dark:bg-blue-950/20 px-1 py-0.5 rounded">{"{expiry_date}"}</span>
              </div>
            </div>

            {/* Segment Selector */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4 border-zinc-100 dark:border-zinc-900">
              <div>
                <label className="block font-semibold mb-1">Target Cohort Segment *</label>
                <select
                  value={audienceFilter}
                  onChange={(e) => setAudienceFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold"
                >
                  <option value="ALL">All Clients Segment</option>
                  <option value="ACTIVE">Active members only</option>
                  <option value="EXPIRED">Expired plans only</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Dispatch Protocol Channel</label>
                <select
                  value={whatsappEnabled ? 'WA' : 'EM'}
                  onChange={(e) => setWhatsappEnabled(e.target.value === 'WA')}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                >
                  <option value="WA">WhatsApp Messaging Gateway</option>
                  <option value="EM">Transactional SMTP Email</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <button
          onClick={handleSendBlast}
          className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow"
        >
          <Send className="w-4 h-4" /> Dispatch Targeted Reminders
        </button>
      </div>

      {/* Dispatched logs panel tracker */}
      <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm mb-4">Transmission Queue logs</h3>
          
          <div className="space-y-3.5 max-h-[360px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400 space-y-1">
                <Clock className="w-8 h-8 text-zinc-300" />
                <p className="text-xs font-bold">Log ledger is empty.</p>
                <p className="text-[10px]">No notification dispatches registered in this session.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-zinc-900 dark:text-zinc-100">Billed to: {log.recipientName}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> {log.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1 italic">"{log.body}"</p>
                  <span className="block text-[9px] font-mono text-zinc-400 mt-1.5 uppercase">
                    Protocol: {log.channel} | Trigger: {log.sentAt}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
