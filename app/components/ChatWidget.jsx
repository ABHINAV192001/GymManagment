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
                className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--primary)] text-black rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-[9999] animate-bounce-slow"
            >
                <FaCommentDots className="text-2xl" />
                {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                        {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div ref={widgetRef} className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col z-[9999] overflow-hidden animate-in fade-in slide-in-from-bottom-4">

            {/* Header */}
            <div className="bg-[var(--primary)] p-4 flex justify-between items-center text-black">
                <div className="flex items-center gap-3">
                    {view !== 'LIST' && (
                        <button type="button" onClick={() => setView('LIST')} className="hover:bg-black/10 p-1 rounded-full"><FaChevronLeft /></button>
                    )}
                    <h3 className="font-bold text-lg">
                        {view === 'LIST' ? 'Messages' : view === 'CONTACTS' ? 'New Message' : activeChat?.partner?.name}
                    </h3>
                </div>
                <button type="button" onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-1 rounded-full"><FaTimes /></button>
            </div>

            {/* List View */}
            {view === 'LIST' && (
                <div className="flex-1 overflow-y-auto p-2">
                    <button
                        type="button"
                        onClick={handleNewChat}
                        className="w-full bg-slate-100 dark:bg-white/5 p-3 rounded-xl mb-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition flex items-center gap-2"
                    >
                        <FaSearch /> Find someone to chat...
                    </button>

                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => handleOpenChat(conv)}
                            className="p-3 mb-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl cursor-pointer transition flex gap-3 items-center border-b border-gray-100 dark:border-white/5 last:border-0"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                {conv.partner.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-bold text-slate-800 dark:text-white truncate">{conv.partner.name}</h4>
                                    <span className="text-[10px] text-slate-400">{conv.timestamp}</span>
                                </div>
                                <p className={`text-sm truncate ${conv.unread > 0 ? 'font-bold text-black dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {conv.lastMessage}
                                </p>
                            </div>
                            {conv.unread > 0 && (
                                <div className="flex flex-col items-end gap-1">
                                    <div className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                                        {conv.unread}
                                    </div>
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
                                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${isMe
                                        ? 'bg-[var(--primary)] text-black rounded-tr-none'
                                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm rounded-tl-none border border-gray-100 dark:border-white/5'
                                        }`}>
                                        <p>{msg.text}</p>
                                        <span className="text-[10px] opacity-60 block text-right mt-1">{msg.time}</span>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-white/10 flex gap-2">
                        <input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-slate-100 dark:bg-white/5 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] text-slate-800 dark:text-white placeholder-slate-400"
                        />
                        <button type="submit" className="w-10 h-10 bg-[var(--primary)] text-black rounded-full flex items-center justify-center hover:opacity-90 transition">
                            <FaPaperPlane className="text-sm ml-0.5" />
                        </button>
                    </form>
                </>
            )}

        </div>
    );
}
