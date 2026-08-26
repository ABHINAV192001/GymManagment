import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Send, FileText, History, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { NotificationTemplate, NotificationLog, Member } from '../../types';
import { 
  getTemplates, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate, 
  getNotificationLogs, 
  sendNotification,
  testWhatsAppNotification,
  testAccountWelcomeWhatsApp
} from '../../lib/api/notifications';
import { getUsers } from '../../lib/api/admin';
import { getRoles } from '../../lib/api/rbac';
import { usePermissions } from '../../lib/usePermissions';

export const Notifications: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ triggerAnnouncement: (msg: string) => void }>();
  const { canCreate, canEdit, canDelete, canSend } = usePermissions();
  
  const [activeTab, setActiveTab] = useState<'SEND' | 'TEMPLATES' | 'HISTORY'>('SEND');
  
  // Data State
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [availableRoles, setAvailableRoles] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);

  // Send Message State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [individualNumber, setIndividualNumber] = useState<string>('');
  const [channel, setChannel] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');

  // Template Form State
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateForm, setTemplateForm] = useState<Partial<NotificationTemplate>>({
    name: '',
    content: '',
    channel: 'WHATSAPP'
  });

  // Twilio WhatsApp Live Test State
  const [testPhone, setTestPhone] = useState<string>('+91');
  const [testName, setTestName] = useState<string>('Alex Johnson');
  const [testEmail, setTestEmail] = useState<string>('alex@gymbross.com');
  const [testRole, setTestRole] = useState<string>('MEMBER');
  const [testMsg, setTestMsg] = useState<string>('🏋️‍♂️ Live Test: Twilio WhatsApp Notification is active and working on GymBross!');
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState<boolean>(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  const handleSendTestWhatsApp = async (type: 'ALERT' | 'ACCOUNT') => {
    if (!testPhone || testPhone.trim() === '+91' || testPhone.trim().length < 8) {
      triggerAnnouncement('Please enter a valid phone number with country code (e.g. +919876543210)');
      return;
    }
    setIsTestingWhatsApp(true);
    setTestFeedback(null);
    try {
      if (type === 'ACCOUNT') {
        await testAccountWelcomeWhatsApp(testPhone.trim(), testName, testEmail, testRole);
        triggerAnnouncement('✅ Account Welcome WhatsApp message triggered to ' + testPhone);
        setTestFeedback('✅ Sent account welcome notification to ' + testPhone);
      } else {
        await testWhatsAppNotification(testPhone.trim(), testMsg);
        triggerAnnouncement('✅ Custom WhatsApp alert triggered to ' + testPhone);
        setTestFeedback('✅ Sent custom WhatsApp message to ' + testPhone);
      }
      fetchData();
    } catch (err: any) {
      triggerAnnouncement('❌ WhatsApp Test Failed: ' + (err.message || 'Check server logs'));
      setTestFeedback('❌ Failed: ' + (err.message || 'Check server logs'));
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tpls, lgs, memsResult, rolesData] = await Promise.all([
        getTemplates(),
        getNotificationLogs(),
        getUsers({ size: 1000 }),
        getRoles()
      ]);
      setTemplates(tpls);
      // Sort logs by newest first
      setLogs(lgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setMembers(memsResult.members);
      setAvailableRoles(rolesData?.content || rolesData || []);
    } catch (err: any) {
      triggerAnnouncement(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle template selection in Send tab
  useEffect(() => {
    if (selectedTemplateId) {
      const tpl = templates.find(t => t.id === selectedTemplateId);
      if (tpl) setMessageContent(tpl.content);
    } else {
      setMessageContent('');
    }
  }, [selectedTemplateId, templates]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) {
      triggerAnnouncement('Message content cannot be empty.');
      return;
    }
    if (!targetRole && !individualNumber.trim()) {
      triggerAnnouncement('Please select a target role or provide an individual number.');
      return;
    }

    try {
      // Determine recipients based on role if selected
      let recipients: string[] = [];
      if (targetRole) {
        // Mock role mapping since Member role might be stored differently
        const roleMembers = members.filter(m => {
          if (targetRole === 'ALL') return true;
          return m.role === targetRole || (targetRole === 'MEMBER' && !m.role); 
        });
        recipients = roleMembers.map(m => channel === 'EMAIL' ? m.email : m.phone).filter(Boolean);
      }

      await sendNotification({
        templateId: selectedTemplateId || null,
        content: messageContent,
        targetRole: targetRole || null,
        individualNumber: individualNumber.trim() || null,
        recipients,
        channel
      });

      triggerAnnouncement('Message dispatched successfully.');
      setMessageContent('');
      setTargetRole('');
      setIndividualNumber('');
      setSelectedTemplateId('');
      fetchData(); // Refresh logs
      setActiveTab('HISTORY');
    } catch (err: any) {
      triggerAnnouncement(`Failed to send message: ${err.message}`);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (templateForm.id) {
        await updateTemplate(templateForm.id, templateForm);
        triggerAnnouncement('Template updated successfully.');
      } else {
        await createTemplate(templateForm);
        triggerAnnouncement('Template created successfully.');
      }
      setIsEditingTemplate(false);
      setTemplateForm({ name: '', content: '', channel: 'WHATSAPP' });
      fetchData();
    } catch (err: any) {
      triggerAnnouncement(`Failed to save template: ${err.message}`);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteTemplate(id);
      triggerAnnouncement('Template deleted successfully.');
      fetchData();
    } catch (err: any) {
      triggerAnnouncement(`Failed to delete template: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'SEND' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          onClick={() => setActiveTab('SEND')}
        >
          <Send className="w-4 h-4" /> Send Message
        </button>
        <button
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'TEMPLATES' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          onClick={() => setActiveTab('TEMPLATES')}
        >
          <FileText className="w-4 h-4" /> Manage Templates
        </button>
        <button
          className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'HISTORY' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
          onClick={() => setActiveTab('HISTORY')}
        >
          <History className="w-4 h-4" /> Message History
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        
        {/* SEND TAB */}
        {activeTab === 'SEND' && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* WhatsApp Web Gateway Card */}
            <div className="p-4 bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    WhatsApp Web Direct Dispatch
                  </h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>

              <p className="text-xs text-zinc-300">
                Send account welcome invites, password setup links, and notifications directly to members via WhatsApp Web without third-party gateways.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">Compose & Broadcast</h2>
              <form onSubmit={handleSendMessage} className="space-y-5">
              
              <div>
                <label className="block text-sm font-bold mb-1">Start from a Template (Optional)</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                >
                  <option value="">-- Blank Message --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Message Content *</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={5}
                  required
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border rounded-lg bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 resize-none font-sans"
                />
                <p className="text-xs text-zinc-500 mt-1">You can edit the template text here before sending.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Target Role</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                  >
                    <option value="">-- Do not target by role --</option>
                    <option value="ALL">All Users</option>
                    {availableRoles.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Individual Number</label>
                  <input
                    type="text"
                    value={individualNumber}
                    onChange={(e) => setIndividualNumber(e.target.value)}
                    placeholder="e.g. +1234567890"
                    className="w-full px-3 py-2 border rounded-lg bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as 'WHATSAPP' | 'EMAIL')}
                  className="w-full px-3 py-2 border rounded-lg bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>

              {canSend('notifications') && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {loading ? 'Dispatching...' : 'Dispatch Message'}
                </button>
              )}
            </form>
            </div>
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'TEMPLATES' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Message Templates</h2>
              {!isEditingTemplate && canCreate('notifications') && (
                <button
                  onClick={() => setIsEditingTemplate(true)}
                  className="px-3 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" /> New Template
                </button>
              )}
            </div>

            {isEditingTemplate ? (
              <form onSubmit={handleSaveTemplate} className="max-w-2xl bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4 mb-6">
                <h3 className="font-bold text-md mb-2">{templateForm.id ? 'Edit Template' : 'Create Template'}</h3>
                <div>
                  <label className="block text-sm font-bold mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Content</label>
                  <textarea
                    required
                    rows={4}
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm">Save Template</button>
                  <button type="button" onClick={() => { setIsEditingTemplate(false); setTemplateForm({ name: '', content: '', channel: 'WHATSAPP' }); }} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg font-bold text-sm">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">Content Preview</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-zinc-500">No templates found.</td>
                      </tr>
                    ) : templates.map(t => (
                      <tr key={t.id} className="border-b border-zinc-100 dark:border-zinc-900 last:border-0">
                        <td className="py-3 font-bold">{t.name}</td>
                        <td className="py-3 text-zinc-600 dark:text-zinc-400 truncate max-w-xs">{t.content}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canEdit('notifications') && (
                              <button onClick={() => { setTemplateForm(t); setIsEditingTemplate(true); }} className="p-1.5 text-zinc-400 hover:text-blue-500 transition-colors" title="Edit Template">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete('notifications') && (
                              <button onClick={() => handleDeleteTemplate(t.id)} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors" title="Delete Template">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'HISTORY' && (
          <div>
            <h2 className="text-lg font-bold mb-4">Message History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                    <th className="pb-3 font-semibold">Date & Time</th>
                    <th className="pb-3 font-semibold">Message</th>
                    <th className="pb-3 font-semibold">Target Details</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-zinc-500">No message history available.</td>
                    </tr>
                  ) : logs.map(log => (
                    <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-900 last:border-0 align-top">
                      <td className="py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg text-xs font-mono">
                          {log.content}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col gap-1 text-xs">
                          {log.targetRole && <span><span className="font-bold text-zinc-500">Role:</span> {log.targetRole}</span>}
                          {log.recipient && <span><span className="font-bold text-zinc-500">To:</span> {log.recipient}</span>}
                          <span><span className="font-bold text-zinc-500">Via:</span> {log.channel}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        {log.status === 'SENT' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-xs font-bold">
                            <CheckCircle className="w-3 h-3" /> SENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded text-xs font-bold">
                            <XCircle className="w-3 h-3" /> {log.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
