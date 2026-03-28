"use client";

import { useState, useEffect } from 'react';
import { FaExclamationCircle, FaClock, FaEnvelope, FaBell } from 'react-icons/fa';
import { getConversations } from '@/lib/api/chat';
import { getProfile } from '@/lib/api/user';

export default function NotificationPanel({ users = [] }) {
    const [unreadMessages, setUnreadMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const profile = await getProfile();
                setCurrentUser(profile);
                if (profile) {
                    const convs = await getConversations(profile);
                    const unread = convs.filter(c => c.unread > 0);
                    setUnreadMessages(unread);
                }
            } catch (err) {
                console.error("Failed to init notification panel", err);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const interval = setInterval(async () => {
            try {
                const convs = await getConversations(currentUser);
                const unread = convs.filter(c => c.unread > 0);
                setUnreadMessages(unread);
            } catch (e) {
                console.warn("Notification poll failed", e);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [currentUser]);

    // 1. Payment Pending Logic (Mocked logic: User has amountPaid = 0 or specific status)
    const paymentPendingUsers = users.filter(u => !u.amountPaid || u.amountPaid === 0);

    // 2. Expiring Soon Logic (Mocked logic: Users with plan ending soon)
    const expiringUsers = users.slice(0, 3);

    return (
        <div className="glass-panel h-full p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center gap-3 mb-2">
                <FaBell className="text-[var(--primary)] text-xl" />
                <h2 className="text-xl font-bold text-white">Notifications</h2>
            </div>

            {/* Section: Payments Pending */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <FaExclamationCircle className="text-red-500" /> Action Required
                </h3>
                {paymentPendingUsers.length > 0 ? (
                    paymentPendingUsers.slice(0, 5).map(user => (
                        <div key={user.id || user.userCode} className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex justify-between items-center transition hover:bg-red-500/20">
                            <div>
                                <p className="text-sm font-bold text-red-200">{user.name}</p>
                                <p className="text-xs text-red-300/60">Payment Pending</p>
                            </div>
                            <button className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition shadow-lg shadow-red-500/20">
                                Collect
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-gray-500 italic">No pending payments.</p>
                )}
            </div>

            {/* Section: Expiring Soon */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <FaClock className="text-yellow-500" /> Plans Expiring
                </h3>
                {expiringUsers.length > 0 ? expiringUsers.map(user => (
                    <div key={user.id || user.userCode} className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg transition hover:bg-yellow-500/20">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-bold text-yellow-200">{user.name}</p>
                            <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1 rounded border border-yellow-500/30">2 Days</span>
                        </div>
                        <p className="text-xs text-yellow-300/60 mt-1">Plan: {user.plan || "Monthly"}</p>
                    </div>
                )) : (
                    <p className="text-xs text-gray-500 italic">No expiring plans.</p>
                )}
            </div>

            {/* Section: Messages */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <FaEnvelope className="text-blue-500" /> Messages
                </h3>
                {unreadMessages.length > 0 ? (
                    unreadMessages.map(conv => (
                        <div key={conv.id} className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg transition hover:bg-blue-500/20 cursor-pointer animate-in slide-in-from-right-2">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-bold text-blue-200">{conv.partner.name}</p>
                                <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    {conv.unread} new
                                </span>
                            </div>
                            <p className="text-xs text-blue-100 mt-1 italic truncate">"{conv.lastMessage}"</p>
                            <p className="text-[10px] text-blue-400/60 mt-1 text-right">{conv.timestamp}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-gray-500 italic">No new messages.</p>
                )}
            </div>

            <style jsx>{`
                .glass-panel {
                    background: var(--glass-bg, rgba(30, 41, 59, 0.4));
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
                    border-radius: 20px;
                    box-shadow: var(--card-shadow, 0 10px 40px -10px rgba(0, 0, 0, 0.3));
                }
            `}</style>
        </div>
    );
}
