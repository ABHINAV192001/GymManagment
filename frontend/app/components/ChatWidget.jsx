"use client";

import { useState, useEffect, useRef } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane, FaUserCircle, FaSearch, FaChevronLeft } from 'react-icons/fa';
import { getConversations, getContacts, sendMessage, markMessagesAsRead } from '@/lib/api/chat';
import { getProfile } from '@/lib/api/user';
import { initStomp, subscribeToTopic } from '@/lib/socket';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('LIST'); // LIST, CHAT, CONTACTS
    const [activeChat, setActiveChat] = useState(null);
    const [userRole, setUserRole] = useState('USER');
    const [currentUser, setCurrentUser] = useState(null);

    const [conversations, setConversations] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const widgetRef = useRef(null);

    // Initial Load
    useEffect(() => {
        const init = async () => {
            try {
                const profile = await getProfile();
                if (profile) {
                    setUserRole(profile.role);
                    setCurrentUser(profile);
                    const convs = await getConversations(profile);
                    setConversations(convs);

                    // WebSocket Initialization for Chat Messages
                    initStomp(() => {
                        subscribeToTopic(`/topic/messages/${profile.username}`, (newMsg) => {
                            // Update logic (simplified: refetch or update state)
                            setConversations(prev => {
                                const exists = prev.find(c => c.partner.username === newMsg.senderUsername || c.partner.id === newMsg.senderUsername);
                                if (exists) {
                                    // Normally we'd append to messages, but for simplicity let's refetch or update the list
                                    // I'll refetch to keep it robust for now
                                    getConversations(profile).then(setConversations);
                                } else {
                                    getConversations(profile).then(setConversations);
                                }
                                return prev;
                            });
                        });
                    });
                }
            } catch (err) {
                console.error("Chat init error", err);
            }
        };
        init();

        // Listeners for global state coordination
        const handleClose = () => setIsOpen(false);
        window.addEventListener('closeChatWidget', handleClose);

        const handleClickOutside = (event) => {
            if (widgetRef.current && !widgetRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener('closeChatWidget', handleClose);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Effect to coordinate Chat opening
    useEffect(() => {
        if (isOpen) {
            window.dispatchEvent(new CustomEvent('closeNavbarCards'));
        }
    }, [isOpen]);

    // Simplified Polling as Failsafe (longer interval)
    useEffect(() => {
        if (!isOpen || !currentUser) return;

        const interval = setInterval(async () => {
            try {
                const convs = await getConversations(currentUser);
                setConversations(convs);
            } catch (e) {
                console.warn("Polling failsafe failed", e);
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [isOpen, currentUser]);
    // Removed separate activeChat interval since we handle it here in one place



    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeChat]);

    const handleOpenChat = async (conversation) => {
        setActiveChat(conversation);
        setMessages(conversation.messages || []);
        setView('CHAT');

        // Mark as read
        if (conversation.unread > 0) {
            await markMessagesAsRead(currentUser, conversation.partner.id);
            // Update local state immediately to clear badge
            setConversations(prev => prev.map(c =>
                c.id === conversation.id ? { ...c, unread: 0 } : c
            ));
        }
    };

    const handleNewChat = async () => {
        console.log("handleNewChat clicked");
        if (!currentUser) return;

        try {
            setLoading(true);
            const contactsList = await getContacts(currentUser);
            setContacts(contactsList);
            setLoading(false);
            setView('CONTACTS');
        } catch (error) {
            console.error("Error fetching contacts:", error);
            setLoading(false);
        }
    };

    const handleStartChat = (contact) => {
        const existing = conversations.find(c => c.partner.id === contact.id);
        if (existing) {
            handleOpenChat(existing);
        } else {
            const newConv = {
                id: `new_${contact.id}`,
                partner: contact,
                messages: [],
                isNew: true
            };
            setActiveChat(newConv);
            setMessages([]);
            setView('CHAT');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const text = inputText;
        setInputText("");

        // Optimistic UI update
        const tempMsg = { id: Date.now(), sender: currentUser.id || currentUser.userCode, text, time: 'Just now' };
        setMessages(prev => [...prev, tempMsg]);

        // API Call
        await sendMessage(currentUser, activeChat.partner, text);

        // Refresh conversations to get the sync state
        const convs = await getConversations(currentUser);
        setConversations(convs);
    };

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-10 right-10 w-16 h-16 bg-black/60 border-2 border-[#00f5ff] text-[#00f5ff] rounded-full shadow-[0_0_20px_rgba(0,245,255,0.4)] backdrop-blur-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-[9999] group"
            >
                <FaCommentDots className="text-2xl group-hover:rotate-[15deg] transition-transform" />
                {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#ccff33] text-black text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-black animate-pulse shadow-[0_0_10px_#ccff33]">
                        {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div ref={widgetRef} className="fixed bottom-10 right-10 w-[380px] h-[580px] bg-black/35 backdrop-blur-[40px] rounded-[2rem] shadow-[0_-20px_50px_-20px_rgba(0,245,255,0.4)] border-t-4 border-t-[#00f5ff] border-x-2 border-x-[#00f5ff]/20 border-b-2 border-b-white/5 flex flex-col z-[9999] overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">

            {/* Header */}
            <div className="bg-gradient-to-r from-[#00f5ff]/10 to-transparent p-6 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-4">
                    {view !== 'LIST' && (
                        <button type="button" onClick={() => setView('LIST')} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-[#00f5ff]/20 text-[#00f5ff] rounded-lg transition-colors"><FaChevronLeft size={12} /></button>
                    )}
                    <div className="space-y-0.5">
                        <h3 className="font-black text-xs uppercase tracking-[3px] text-white">
                            {view === 'LIST' ? 'Terminal' : view === 'CONTACTS' ? 'New Protocol' : activeChat?.partner?.name}
                        </h3>
                        <div className="flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-[#ccff33] rounded-full animate-pulse shadow-[0_0_5px_#ccff33]"></span>
                             <span className="text-[7px] font-black uppercase tracking-widest text-[#ccff33]/70">Messages</span>
                        </div>
                    </div>
                </div>
                <button type="button" onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-lg transition-all"><FaTimes size={14} /></button>
            </div>

            {/* List View */}
            {view === 'LIST' && (
                <div className="flex-1 overflow-y-auto p-2">
                    <button
                        type="button"
                        onClick={handleNewChat}
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl mb-4 text-left text-[10px] font-black uppercase tracking-[2px] text-white/40 hover:text-[#00f5ff] hover:border-[#00f5ff]/40 transition-all flex items-center gap-3 group"
                    >
                        <FaSearch className="group-hover:scale-110 transition-transform" /> Sync New Connection...
                    </button>

                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => handleOpenChat(conv)}
                            className="p-4 mb-2 bg-white/[0.02] hover:bg-[#00f5ff]/5 !border-l-2 !border-l-transparent hover:!border-l-[#00f5ff] rounded-xl cursor-pointer transition-all flex gap-4 items-center border border-white/5"
                        >
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-[#ccff33] text-lg font-black shadow-inner">
                                {conv.partner.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h4 className="font-black text-[11px] uppercase tracking-tight text-white/90">{conv.partner.name}</h4>
                                    <span className="text-[8px] font-black uppercase text-white/20">{conv.timestamp}</span>
                                </div>
                                <p className={`text-[10px] font-bold truncate tracking-tight ${conv.unread > 0 ? 'text-[#00f5ff]' : 'text-white/40'}`}>
                                    {conv.lastMessage}
                                </p>
                            </div>
                            {conv.unread > 0 && (
                                <div className="bg-[#ccff33] text-black text-[9px] font-black min-w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-[0_0_10px_#ccff33]">
                                    {conv.unread}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Contacts View */}
            {view === 'CONTACTS' && (
                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? <p className="text-center p-4 text-gray-500">Loading contacts...</p> : (
                        contacts.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => handleStartChat(contact)}
                                className="p-3 mb-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition flex gap-3 items-center border-b border-gray-100 dark:border-white/5"
                            >
                                <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center text-gray-500 dark:text-white">
                                    <FaUserCircle className="text-2xl" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">{contact.name}</h4>
                                    <span className="text-xs bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
                                        {contact.role}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Chat View */}
            {view === 'CHAT' && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-black/20 flex flex-col gap-3">
                        {messages.map((msg, idx) => {
                            const currentUserId = String(currentUser?.id || currentUser?.userCode || "");
                            const senderId = String(msg.sender || "");
                            const isMe = senderId === 'me' || senderId === currentUserId;
                            return (
                                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-4 text-[11px] font-bold tracking-tight leading-relaxed shadow-xl ${isMe
                                        ? 'bg-[#00f5ff]/20 text-[#00f5ff] rounded-tr-none border border-[#00f5ff]/30'
                                        : 'bg-white/5 text-white/80 rounded-tl-none border border-white/10'
                                        }`}>
                                        <p>{msg.text}</p>
                                        <span className={`text-[8px] font-black uppercase mt-2 block ${isMe ? 'text-[#00f5ff]/60' : 'text-white/20'}`}>{msg.time}</span>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-4 bg-black/40 backdrop-blur-md border-t border-white/5 flex gap-3 items-center">
                        <div className="flex-1 relative">
                            <input
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Transmit data..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-[#00f5ff]/50 transition-all text-white placeholder:text-white/20"
                            />
                        </div>
                        <button type="submit" className="w-12 h-12 bg-[#00f5ff] text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,245,255,0.4)] group">
                            <FaPaperPlane className="text-sm group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </form>
                </>
            )}

        </div>
    );
}
