import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Search,
  ChevronLeft,
  Sparkles,
  Lock,
  Users,
  Bot,
  UserCheck,
  Shield,
  Radio,
  CheckCheck
} from 'lucide-react';
import { ChatMessage, Member, Staff } from '../../types';
import { getChatHistory, sendChatMessage, getChatContacts } from '../../lib/api/chat';
import { getUsers, getStaff } from '../../lib/api/admin';
import { chatWebSocket } from '../../lib/api/chatWebSocket';
import { getUserProfile } from '../../lib/api/user';

export interface DynamicContact {
  id: string;
  name: string;
  role: string;
  isStaff: boolean;
  subtitle: string;
  avatar: string;
  isActive: boolean;
  userCode?: string;
  email?: string;
  username?: string;
}

interface FloatingChatWidgetProps {
  currentUserRole?: string;
  currentUserId?: string;
  onAnnounce?: (msg: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  showFloatingButton?: boolean;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  currentUserRole = 'MEMBER',
  currentUserId = 'current-user-1',
  onAnnounce,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  showFloatingButton = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  const handleClose = () => {
    if (externalOnClose) externalOnClose();
    setInternalIsOpen(false);
  };
  
  const toggleWidget = () => {
    if (externalIsOpen !== undefined) {
      if (externalIsOpen && externalOnClose) externalOnClose();
    } else {
      setInternalIsOpen(prev => !prev);
    }
  };

  const [activeContact, setActiveContact] = useState<DynamicContact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  
  // Real contacts loaded from DB
  const [allContacts, setAllContacts] = useState<DynamicContact[]>([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  
  // Directory Tab selection for Staff/Org Admin: "ALL" | "STAFF" | "MEMBERS" | "BROADCAST"
  const [activeTab, setActiveTab] = useState<'ALL' | 'STAFF' | 'MEMBERS' | 'BROADCAST'>('ALL');
  
  // Broadcast mode state
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL_MEMBERS' | 'ALL_STAFF' | 'EVERYONE'>('ALL_MEMBERS');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if current user has Staff/Admin permissions
  const cookieRole = document.cookie.match(/gymos_role=([^;]+)/)?.[1] || currentUserRole || '';
  const isOrgAdminOrStaff = useMemo(() => {
    const r = (cookieRole || '').toUpperCase();
    return (
      r.includes('ADMIN') ||
      r.includes('TRAINER') ||
      r.includes('STAFF') ||
      r.includes('MANAGER') ||
      r.includes('SUPER')
    );
  }, [cookieRole]);

  // Load REAL active users and staff from backend database
  const loadRealDirectory = async () => {
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

      setAllContacts(loaded);
    } catch (err) {
      console.error('Error fetching real directory:', err);
    } finally {
      setIsLoadingDirectory(false);
    }
  };

  useEffect(() => {
    loadRealDirectory();
  }, []);

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

  const activeContactRef = useRef(activeContact);
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

      loadRealDirectory();
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserProfile?.username]);

  // Fetch conversation history on contact change (pure real-time STOMP WebSocket handles new messages)
  useEffect(() => {
    if (!activeContact) return;

    getChatHistory({ userId: activeContact.id })
      .then(history => {
        if (Array.isArray(history)) setMessages(history);
      })
      .catch(() => null);
  }, [activeContact?.id]);

  // Auto-scroll chat body
  useEffect(() => {
    if (activeContact && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeContact, isOpen]);

  // Filtered contacts based on role rules & selected tab:
  const displayedContacts = useMemo(() => {
    let filtered = allContacts;

    if (!isOrgAdminOrStaff) {
      filtered = allContacts.filter(c => c.isStaff);
    } else {
      if (activeTab === 'STAFF') {
        filtered = allContacts.filter(c => c.isStaff);
      } else if (activeTab === 'MEMBERS') {
        filtered = allContacts.filter(c => !c.isStaff);
      }
    }

    if (!searchQuery.trim()) return filtered;

    const q = searchQuery.toLowerCase();
    return filtered.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q)
    );
  }, [allContacts, isOrgAdminOrStaff, activeTab, searchQuery]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || typedMessage;
    if (!textToSend.trim() || !activeContact) return;

    const text = textToSend.trim();
    if (!customText) setTypedMessage('');

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderType: isOrgAdminOrStaff ? 'STAFF' : 'USER',
      senderId: currentUserProfile?.username || currentUserId,
      senderUsername: currentUserProfile?.username || currentUserId,
      receiverUsername: activeContact.username,
      receiverId: activeContact.id,
      message: text,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMsg]);

    // Send via STOMP WebSocket & REST API
    chatWebSocket.sendMessage(activeContact.username, text);

    try {
      await sendChatMessage({
        senderType: isOrgAdminOrStaff ? 'STAFF' : 'USER',
        senderId: currentUserProfile?.username || currentUserId,
        receiverUsername: activeContact.username,
        receiverId: activeContact.id,
        message: text,
        content: text,
      });

      if (activeContact) {
        const history = await getChatHistory({ userId: activeContact.id });
        if (Array.isArray(history)) setMessages(history);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Broadcast Handler for Admin
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    try {
      setIsSendingBroadcast(true);
      const recipients = allContacts.filter(c => {
        if (broadcastTarget === 'ALL_MEMBERS') return !c.isStaff;
        if (broadcastTarget === 'ALL_STAFF') return c.isStaff;
        return true;
      });

      // Send chat message to each recipient in group
      await Promise.allSettled(
        recipients.map(r =>
          sendChatMessage({
            senderType: 'STAFF',
            senderId: currentUserId,
            receiverId: r.id,
            message: `[ANNOUNCEMENT] ${broadcastMessage.trim()}`,
          })
        )
      );

      if (onAnnounce) {
        onAnnounce(`Broadcast announcement sent to ${recipients.length} active contacts.`);
      }
      setBroadcastMessage('');
      setActiveTab('ALL');
    } catch (err: any) {
      console.error('Broadcast failed', err);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      loadRealDirectory();
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Chat Trigger Button - Only rendered if showFloatingButton is true */}
      {showFloatingButton && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2">
          <button
            onClick={toggleWidget}
            aria-label={isOpen ? 'Close Chat Window' : 'Open WhatsApp Style Live Chat'}
            className={`group relative p-3.5 md:p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center ${
              isOpen
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 ring-4 ring-zinc-400/30'
                : 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-600 text-white ring-4 ring-emerald-500/30 hover:shadow-emerald-500/40'
            }`}
          >
            {isOpen ? (
              <X className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-200 rotate-0 group-hover:rotate-90" />
            ) : (
              <>
                <MessageCircle className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      )}

      {/* Floating Chat Widget Popup Window */}
      {isOpen && (
        <div className="fixed bottom-0 sm:bottom-6 inset-x-0 sm:left-auto sm:right-6 w-full sm:w-96 h-[88vh] sm:h-[570px] max-h-[100vh] sm:max-h-[calc(100vh-6rem)] z-50 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 text-xs">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-teal-950 p-3.5 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              {activeContact ? (
                <button
                  onClick={() => setActiveContact(null)}
                  className="p-1 hover:bg-white/10 rounded-lg transition text-zinc-300 hover:text-white"
                  title="Back to directory"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div>
                <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5 leading-tight">
                  {activeContact ? activeContact.name : 'GymBross Messenger'}
                  {!activeContact && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                </h3>
                <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  {activeContact ? activeContact.role : 'Active Direct & Group Chat'}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition"
              aria-label="Close Chat Window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Directory View (When no contact is active) */}
          {!activeContact ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/40">
              
              {/* Role Restricted Banner */}
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {!isOrgAdminOrStaff
                    ? 'Strict Mode: You can only communicate directly with active Gym Staff & Trainers.'
                    : 'Admin Workspace: Chat with active members, staff, or send bulk broadcasts.'}
                </span>
              </div>

              {/* Tabs for Org Admin / Staff */}
              {isOrgAdminOrStaff && (
                <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11px] font-bold">
                  {(['ALL', 'STAFF', 'MEMBERS', 'BROADCAST'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 text-center transition border-b-2 ${
                        activeTab === tab
                          ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                          : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      {tab === 'BROADCAST' ? '📢 Broadcast' : tab}
                    </button>
                  ))}
                </div>
              )}

              {/* Broadcast View */}
              {activeTab === 'BROADCAST' && isOrgAdminOrStaff ? (
                <form onSubmit={handleSendBroadcast} className="flex-1 p-4 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <label className="block font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                      Target Audience
                    </label>
                    <select
                      value={broadcastTarget}
                      onChange={e => setBroadcastTarget(e.target.value as any)}
                      className="w-full p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-xs"
                    >
                      <option value="ALL_MEMBERS">All Active Members ({allContacts.filter(c => !c.isStaff).length})</option>
                      <option value="ALL_STAFF">All Active Staff & Trainers ({allContacts.filter(c => c.isStaff).length})</option>
                      <option value="EVERYONE">Everyone in Organization ({allContacts.length})</option>
                    </select>

                    <label className="block font-bold text-zinc-800 dark:text-zinc-200 text-xs pt-2">
                      Announcement Message
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Type official gym broadcast announcement..."
                      value={broadcastMessage}
                      onChange={e => setBroadcastMessage(e.target.value)}
                      className="w-full p-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingBroadcast || !broadcastMessage.trim()}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow disabled:opacity-40"
                  >
                    <Radio className="w-4 h-4" />
                    <span>{isSendingBroadcast ? 'Broadcasting...' : 'Send Group Broadcast'}</span>
                  </button>
                </form>
              ) : (
                <>
                  {/* Search Bar */}
                  <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search active contacts..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Contacts Directory List */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    <div className="px-2 py-1 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>{!isOrgAdminOrStaff ? 'Active Gym Staff & Trainers' : 'Active Directory'}</span>
                      <span>{displayedContacts.length} Active</span>
                    </div>

                    {isLoadingDirectory ? (
                      <div className="p-6 text-center text-zinc-400 space-y-2">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-[11px]">Syncing Active Contacts...</p>
                      </div>
                    ) : displayedContacts.length === 0 ? (
                      <div className="p-8 text-center text-zinc-400 space-y-1">
                        <Users className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
                        <p className="font-semibold text-zinc-600 dark:text-zinc-300 text-xs">No active contacts found</p>
                        <p className="text-[10px]">No active users match the current search filter.</p>
                      </div>
                    ) : (
                      displayedContacts.map(contact => (
                        <button
                          key={contact.id}
                          onClick={() => setActiveContact(contact)}
                          className="w-full p-2.5 rounded-xl text-left transition flex items-center justify-between hover:bg-white dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 shadow-none hover:shadow-sm group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative">
                              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black flex items-center justify-center border border-emerald-200 dark:border-emerald-900">
                                {contact.avatar}
                              </div>
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                                {contact.name}
                              </h4>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                {contact.subtitle}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                              contact.isStaff
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            {contact.role}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Active 1-on-1 Conversation View */
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-950">
              
              {/* Active Conversation Messages */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-zinc-50/40 dark:bg-zinc-950/40">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400 space-y-2">
                    <MessageCircle className="w-8 h-8 mx-auto text-emerald-500/50" />
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Start direct chat with {activeContact.name}
                    </p>
                    <p className="text-[10px]">
                      Send workout queries, progress updates, or administrative requests.
                    </p>
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

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`p-3 rounded-2xl max-w-[82%] space-y-1 shadow-sm ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-tl-none'
                          }`}
                        >
                          {!isMe && (
                            <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                              {activeContact?.name && activeContact.name !== 'string' && activeContact.name !== activeContact.role
                                ? `${activeContact.role} (${activeContact.name})`
                                : (activeContact?.role || senderName)}
                            </span>
                          )}
                          <p className="leading-relaxed text-xs">{msg.message}</p>
                          <span
                            className={`block text-[9px] text-right font-mono ${
                              isMe ? 'text-emerald-200' : 'text-zinc-400'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2 items-center"
              >
                <input
                  type="text"
                  placeholder={`Message ${activeContact.name}...`}
                  value={typedMessage}
                  onChange={e => setTypedMessage(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!typedMessage.trim()}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition shadow focus:outline-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};
