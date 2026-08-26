import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Send, MessageCircle, Lock, Search, Radio, Users, Bot, Sparkles, ChevronLeft, Pencil, Trash2, Check, X } from 'lucide-react';
import { ChatMessage, Staff, Member } from '../../types';
import { getChatHistory, sendChatMessage, getChatContacts, editChatMessage, deleteChatMessage } from '../../lib/api/chat';
import { getUsers, getStaff } from '../../lib/api/admin';
import { getUserProfile } from '../../lib/api/user';
import { chatWebSocket } from '../../lib/api/chatWebSocket';
import { DynamicContact } from '../../components/chat/FloatingChatWidget';

export const Chat: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{
    triggerAnnouncement: (msg: string) => void;
  }>();

  const [contacts, setContacts] = useState<DynamicContact[]>([]);
  const [activeContact, setActiveContact] = useState<DynamicContact | null>(null);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(true);
  const [mobileChatView, setMobileChatView] = useState<'list' | 'thread'>('list');
  
  const [search, setSearch] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('gymos_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    getUserProfile().then(p => {
      if (p) {
        setCurrentUserProfile(p);
        try { localStorage.setItem('gymos_user_profile', JSON.stringify(p)); } catch {}
      }
    }).catch(() => null);
  }, []);

  // Org Admin tabs: "ALL" | "STAFF" | "MEMBERS" | "BROADCAST"
  const [activeTab, setActiveTab] = useState<'ALL' | 'STAFF' | 'MEMBERS' | 'BROADCAST'>('ALL');
  
  // Broadcast messaging state
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL_MEMBERS' | 'ALL_STAFF' | 'EVERYONE'>('ALL_MEMBERS');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Read role from cookie
  const cookieRole = document.cookie.match(/gymos_role=([^;]+)/)?.[1] || 'MEMBER';
  const isStaffUser = useMemo(() => {
    const r = (cookieRole || '').toUpperCase();
    return r.includes('ADMIN') || r.includes('TRAINER') || r.includes('STAFF') || r.includes('MANAGER');
  }, [cookieRole]);

  // Load REAL contacts from backend database
  const loadDirectory = async () => {
    try {
      setIsLoadingDirectory(true);

      // Primary: Try dedicated Chat Contacts API (accessible to ALL authenticated users)
      const chatContacts = await getChatContacts();
      const loaded: DynamicContact[] = chatContacts.map(c => ({
        id: c.id,
        name: c.name,
        role: c.role,
        isStaff: c.isStaff,
        subtitle: c.subtitle || c.role,
        avatar: c.avatar || 'CT',
        isActive: true,
        email: c.email,
        userCode: c.userCode,
        username: c.username,
      }));

      // Fallback: If chatContacts is empty, attempt getUsers / getStaff
      if (loaded.length === 0) {
        const [membersRes, staffRes] = await Promise.allSettled([
          getUsers({ size: 100 }),
          getStaff(),
        ]);

        if (staffRes.status === 'fulfilled' && Array.isArray(staffRes.value)) {
          staffRes.value.forEach((s: Staff) => {
            if (s.status === 'ACTIVE' || s.status === undefined) {
              loaded.push({
                id: s.id || `staff-${s.name}`,
                name: s.name || s.email || 'Gym Staff',
                role: s.role ? s.role.replace(/_/g, ' ') : 'Staff',
                isStaff: true,
                subtitle: s.specializations && s.specializations.length > 0 ? s.specializations.join(', ') : 'Staff Member',
                avatar: s.name ? s.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST',
                isActive: true,
                email: s.email,
              });
            }
          });
        }

        if (membersRes.status === 'fulfilled' && membersRes.value?.members) {
          membersRes.value.members.forEach((m: Member) => {
            if (m.isActive || m.status === 'Active') {
              if (!loaded.some(c => c.id === m.id || (m.email && c.email === m.email))) {
                const roleUpper = (m.role || '').toUpperCase();
                const isStaffMember = roleUpper.includes('ADMIN') || roleUpper.includes('STAFF') || roleUpper.includes('TRAINER') || roleUpper.includes('MANAGER') || roleUpper.includes('OWNER');
                loaded.push({
                  id: m.id,
                  name: m.name || m.username || m.email || 'Member',
                  role: m.role ? m.role.replace(/_/g, ' ') : (m.plan ? `${m.plan} Member` : 'Gym Member'),
                  isStaff: isStaffMember,
                  subtitle: m.userCode ? `ID: ${m.userCode}` : m.trainerName ? `Trainer: ${m.trainerName}` : 'Active Member',
                  avatar: m.name ? m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'MB',
                  isActive: true,
                  userCode: m.userCode,
                  email: m.email,
                });
              }
            }
          });
        }
      }

      setContacts(loaded);

      // Default selection based on role rules
      if (loaded.length > 0) {
        if (!isStaffUser) {
          const firstStaff = loaded.find(c => c.isStaff) || loaded[0];
          setActiveContact(firstStaff);
        } else {
          setActiveContact(loaded[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load directory:', err);
    } finally {
      setIsLoadingDirectory(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, []);

  const activeContactRef = React.useRef(activeContact);
  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  // STOMP WebSocket real-time subscription
  useEffect(() => {
    if (!currentUserProfile?.username) return;

    chatWebSocket.connect(currentUserProfile.username);

    const unsubscribe = chatWebSocket.onMessage((newMsg) => {
      const activePartner = activeContactRef.current;
      if (activePartner) {
        const partnerUser = activePartner.username;
        const partnerEmail = activePartner.email;
        const partnerCode = activePartner.userCode;
        const partnerId = activePartner.id;

        const isFromPartner =
          newMsg.senderUsername === partnerUser ||
          newMsg.senderUsername === partnerEmail ||
          newMsg.senderUsername === partnerCode ||
          newMsg.senderUsername === partnerId;

        const isFromMe =
          newMsg.senderUsername === currentUserProfile.username ||
          newMsg.senderUsername === currentUserProfile.email ||
          newMsg.senderUsername === currentUserProfile.userCode;

        if (isFromPartner || isFromMe) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id || (m.message === newMsg.content && Math.abs(new Date(m.createdAt).getTime() - new Date(newMsg.timestamp || Date.now()).getTime()) < 3000))) {
              return prev;
            }
            return [
              ...prev,
              {
                id: newMsg.id || `msg-${Date.now()}`,
                senderId: newMsg.senderUsername,
                senderUsername: newMsg.senderUsername,
                receiverUsername: newMsg.receiverUsername,
                message: newMsg.content || newMsg.message || '',
                createdAt: newMsg.timestamp || newMsg.createdAt || new Date().toISOString(),
                senderType: newMsg.senderType || 'USER',
              },
            ];
          });
        }
      }

      loadDirectory();
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserProfile?.username]);

  // Fetch history on active contact change (pure real-time STOMP WebSocket handles new messages)
  useEffect(() => {
    if (!activeContact) return;

    getChatHistory({ userId: activeContact.id })
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(() => null);
  }, [activeContact?.id]);

  // Directory filter rules
  const displayedContacts = useMemo(() => {
    let filtered = contacts;

    if (!isStaffUser) {
      filtered = contacts.filter(c => c.isStaff);
    } else {
      if (activeTab === 'STAFF') {
        filtered = contacts.filter(c => c.isStaff);
      } else if (activeTab === 'MEMBERS') {
        filtered = contacts.filter(c => !c.isStaff);
      }
    }

    if (!search.trim()) return filtered;

    const q = search.toLowerCase();
    return filtered.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q)
    );
  }, [contacts, isStaffUser, activeTab, search]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeContact) return;

    const content = typedMessage.trim();
    setTypedMessage('');

    const currentName = currentUserProfile?.username || currentUserProfile?.email || 'current-user';

    const optMsg: ChatMessage = {
      id: `opt-${Date.now()}`,
      senderType: isStaffUser ? 'STAFF' : 'USER',
      senderId: currentName,
      senderUsername: currentName,
      receiverId: activeContact.id,
      receiverUsername: activeContact.username || activeContact.id,
      message: content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optMsg]);

    sendChatMessage({
      senderUsername: currentName,
      receiverUsername: activeContact.username || activeContact.id,
      content: content,
    })
      .then(res => {
        if (res && activeContact) {
          getChatHistory({ userId: activeContact.id }).then(data => {
            if (Array.isArray(data)) setMessages(data);
          });
        }
      })
      .catch(err => {
        console.warn('Optimistic chat message error:', err);
      });
  };

  const handleSaveEdit = async (msgId: string) => {
    if (!editingText.trim()) return;
    const newContent = editingText.trim();
    setEditingMessageId(null);
    setEditingText('');

    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, message: newContent, edited: true } : m));

    try {
      await editChatMessage(msgId, newContent);
      if (activeContact) {
        const data = await getChatHistory({ userId: activeContact.id });
        if (Array.isArray(data)) setMessages(data);
      }
    } catch (err) {
      console.warn('Failed to edit message:', err);
    }
  };

  const handleDeleteMsg = async (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
    try {
      await deleteChatMessage(msgId);
      if (activeContact) {
        const data = await getChatHistory({ userId: activeContact.id });
        if (Array.isArray(data)) setMessages(data);
      }
    } catch (err) {
      console.warn('Failed to delete message:', err);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsBroadcasting(true);
    setTimeout(() => {
      triggerAnnouncement(`[Broadcast]: ${broadcastMessage}`);
      setBroadcastMessage('');
      setIsBroadcasting(false);
      alert('Group Broadcast published to members!');
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] w-full max-w-[1700px] mx-auto p-1 sm:p-2 space-y-2.5 overflow-hidden text-xs">
      {/* Role Notice Header */}
      <div className="shrink-0 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs sm:text-sm">Real-Time Chat & Broadcast Center</h3>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              {!isStaffUser
                ? 'Strict Mode: You can only communicate with active Gym Staff & Trainers.'
                : 'Admin Workspace: Chat with active members, staff, or send bulk broadcasts.'}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
          {!isStaffUser ? 'Staff Only View' : 'Staff Admin View'}
        </span>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden text-xs shadow-xl">
        {/* Contact Directory Sidebar */}
        <div className={`md:col-span-1 border-r border-zinc-150 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-900/40 flex-col gap-2.5 h-full min-h-0 ${
          mobileChatView === 'list' || activeTab === 'BROADCAST' ? 'flex' : 'hidden md:flex'
        }`}>
          
          {/* Org Admin Tabs */}
          {isStaffUser && (
            <div className="shrink-0 flex border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-[10px] font-bold bg-white dark:bg-zinc-900">
              {(['ALL', 'STAFF', 'MEMBERS', 'BROADCAST'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setMobileChatView('list'); }}
                  className={`flex-1 py-1.5 text-center transition ${
                    activeTab === tab
                      ? 'bg-emerald-600 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {tab === 'BROADCAST' ? '📢' : tab}
                </button>
              ))}
            </div>
          )}

          {activeTab !== 'BROADCAST' && (
            <div className="shrink-0 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search active contacts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}

          <span className="shrink-0 block text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
            {!isStaffUser ? 'Active Staff & Trainers' : 'Active Contacts'} ({displayedContacts.length})
          </span>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1">
            {isLoadingDirectory ? (
              <div className="p-8 text-center text-zinc-400 space-y-2">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[11px]">Loading Directory...</p>
              </div>
            ) : displayedContacts.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 space-y-1">
                <Users className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
                <p className="font-semibold text-zinc-600 dark:text-zinc-300 text-xs">No active contacts found</p>
              </div>
            ) : (
              displayedContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => { setActiveContact(contact); setMobileChatView('thread'); }}
                  className={`w-full p-2.5 rounded-xl text-left transition flex items-center justify-between ${
                    activeContact?.id === contact.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-900/50 shadow-sm'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-[11px] font-black text-emerald-700 flex items-center justify-center shrink-0">
                        {contact.avatar}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-zinc-900" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-zinc-800 dark:text-zinc-100 truncate">{contact.name}</h4>
                      <p className="text-[10px] text-zinc-400 truncate">{contact.subtitle}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                    {contact.role}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Thread / Broadcast Workspace */}
        <div className={`md:col-span-2 flex flex-col justify-between h-full min-h-0 bg-white dark:bg-zinc-950 ${
          mobileChatView === 'thread' || activeTab === 'BROADCAST' ? 'flex' : 'hidden md:flex'
        }`}>
          {activeTab === 'BROADCAST' && isStaffUser ? (
            <form onSubmit={handleSendBroadcast} className="flex-1 p-6 space-y-4 flex flex-col justify-between overflow-y-auto min-h-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Bulk Broadcast Messenger</h3>
                    <p className="text-[10px] text-zinc-400">Send instant announcements to selected user groups.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                    Target Group
                  </label>
                  <select
                    value={broadcastTarget}
                    onChange={e => setBroadcastTarget(e.target.value as any)}
                    className="w-full p-2.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs"
                  >
                    <option value="ALL_MEMBERS">All Active Members ({contacts.filter(c => !c.isStaff).length})</option>
                    <option value="ALL_STAFF">All Active Staff ({contacts.filter(c => c.isStaff).length})</option>
                    <option value="EVERYONE">Everyone ({contacts.length})</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                    Broadcast Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Type official gym broadcast announcement..."
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isBroadcasting || !broadcastMessage.trim()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow disabled:opacity-40"
              >
                <Radio className="w-4 h-4" />
                <span>{isBroadcasting ? 'Broadcasting Announcement...' : 'Send Group Broadcast'}</span>
              </button>
            </form>
          ) : (
            <>
              {/* Header */}
              <div className="shrink-0 p-3 sm:p-3.5 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setMobileChatView('list')}
                    className="md:hidden p-1.5 -ml-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    title="Back to Contact Directory"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <MessageCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                      {activeContact ? activeContact.name : 'Select Contact'}
                    </h3>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> {activeContact?.role} • Active
                    </p>
                  </div>
                </div>
              </div>

              {/* Message logs */}
              <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 bg-zinc-50/20 dark:bg-zinc-950/35">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400 space-y-2">
                    <MessageCircle className="w-8 h-8 mx-auto text-emerald-500/50" />
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Start direct chat with {activeContact?.name}
                    </p>
                    <p className="text-[10px]">Send workout queries or progress updates.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const senderName = msg.senderUsername || (msg as any).senderId || '';
                    const isMe = Boolean(
                      currentUserProfile && (
                        senderName === currentUserProfile.username ||
                        senderName === currentUserProfile.email ||
                        senderName === currentUserProfile.userCode ||
                        senderName === currentUserProfile.id
                      )
                    );
                    const isEditingThis = editingMessageId === msg.id;

                    return (
                      <div key={msg.id} className={`group flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className="relative max-w-sm">
                          <div
                            className={`p-3 rounded-2xl space-y-1 relative ${
                              isMe
                                ? 'bg-emerald-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-tl-none shadow-sm'
                            }`}
                          >
                            {!isMe && (
                              <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                                {activeContact?.name && activeContact.name !== 'string' && activeContact.name !== activeContact.role
                                  ? `${activeContact.role} (${activeContact.name})`
                                  : (activeContact?.role || senderName)}
                              </span>
                            )}

                            {isEditingThis ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editingText}
                                  onChange={e => setEditingText(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveEdit(msg.id);
                                    if (e.key === 'Escape') setEditingMessageId(null);
                                  }}
                                  className="w-full px-2 py-1 text-xs rounded border border-emerald-300 text-zinc-900 bg-white dark:bg-zinc-800 dark:text-white"
                                  autoFocus
                                />
                                <div className="flex justify-end gap-1 text-[10px]">
                                  <button
                                    onClick={() => handleSaveEdit(msg.id)}
                                    className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" /> Save
                                  </button>
                                  <button
                                    onClick={() => setEditingMessageId(null)}
                                    className="px-2 py-0.5 bg-zinc-500 hover:bg-zinc-600 text-white rounded flex items-center gap-1"
                                  >
                                    <X className="w-3 h-3" /> Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="leading-relaxed text-xs break-words">{msg.message}</p>
                            )}

                            <div className="flex items-center justify-end gap-1.5 pt-0.5">
                              <span className={`text-[9px] font-mono ${isMe ? 'text-emerald-200' : 'text-zinc-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {msg.edited && <span className="ml-1 italic font-sans text-[9px] opacity-85">(edited)</span>}
                              </span>
                            </div>
                          </div>

                          {/* Hover action buttons for owner */}
                          {isMe && !isEditingThis && (
                            <div className="absolute -top-2 right-2 hidden group-hover:flex items-center gap-1 bg-zinc-900/90 dark:bg-zinc-800/90 text-white p-1 rounded-lg border border-zinc-700 shadow-md backdrop-blur z-10">
                              <button
                                onClick={() => {
                                  setEditingMessageId(msg.id);
                                  setEditingText(msg.message);
                                }}
                                className="p-1 hover:text-emerald-400 transition"
                                title="Edit message"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteMsg(msg.id)}
                                className="p-1 hover:text-red-400 transition"
                                title="Delete message"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Form */}
              <form onSubmit={handleSendMessage} className="shrink-0 p-3 sm:p-4 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex gap-2">
                <input
                  type="text"
                  placeholder={`Send message to ${activeContact?.name || 'user'}...`}
                  value={typedMessage}
                  onChange={e => setTypedMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!typedMessage.trim() || !activeContact}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-lg flex items-center justify-center gap-1 shadow transition"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
