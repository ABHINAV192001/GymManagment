"use client";

import { useState, useEffect } from 'react';
import { FaPlus, FaRunning, FaBiking, FaCalendarAlt, FaClock, FaUsers, FaPoll, FaCheckCircle, FaChevronRight } from 'react-icons/fa';
import Modal from '@/app/components/Modal';
import { createSession, getSessions, updateSession, deleteSession } from '@/lib/api/sessions';
import { getCookie } from '@/lib/cookie';

export default function SessionsPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [sessions, setSessions] = useState([]);

    const activeToday = sessions.length;
    const totalResponses = sessions.reduce((acc, s) => acc + (s.inCount || 0) + (s.outCount || 0), 0);
    const pollEngagement = sessions.length > 0
        ? Math.round(sessions.reduce((acc, s) => {
            const total = (s.inCount || 0) + (s.outCount || 0);
            return acc + (total / (total + 1) * 100);
        }, 0) / sessions.length)
        : 0;

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await getSessions();
                setSessions(data || []);
            } catch (err) {
                console.error("Failed to fetch sessions", err);
            }
        };
        fetchSessions();
    }, []);

    const [newSession, setNewSession] = useState({
        sessionType: '',
        branchIds: getCookie('branchId') || '1',
        sessionTime: '',
        sessionDate: '',
        sessionPeriod: 'Morning',
        recipientRoles: 'USER,PREMIUM_USER',
        pollEnabled: true,
        description: ''
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const saved = await createSession(newSession);
            setSessions([saved, ...sessions]);
            setIsCreateModalOpen(false);
            alert("Session created and notifications sent!");
        } catch (err) {
            console.error("Failed to create session", err);
            alert("Error creating session. Check console.");
        }
    };

    const [selectedSession, setSelectedSession] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const openDetails = (session) => {
        setSelectedSession(session);
        setIsEditing(false);
        setIsDetailsModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const { updateSession } = await import('@/lib/api/sessions'); // Dynamically import or just ensure it's imported at top. Better to import at top.
            // Wait, I didn't add it to top imports in previous step. I should fix imports too.
            // Using dynamic import or assuming I will fix imports in next step.
            // Let's assume I will fix imports in next step.
            // For now, I'll use `updateSession` assuming it is available.

            // Actually, I should update imports in this step if possible or separate.
            // I'll assume I update imports separately or use fully qualified if possible? No.
            // I will update imports in a separate call or try to squeeze it here?
            // "Use this tool ONLY when you are making a SINGLE CONTIGUOUS block of edits".
            // Imports and this block are far apart.
            // I will implement the handler here and fix imports in next step.

            const updated = await updateSession(selectedSession.id, selectedSession);
            setSessions(sessions.map(s => s.id === updated.id ? updated : s));
            setIsEditing(false);
            // alert("Session updated!"); 
        } catch (err) {
            console.error("Failed to update session", err);
            alert("Failed to update.");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this session? This cannot be undone.")) return;
        try {
            await deleteSession(selectedSession.id);
            setSessions(sessions.filter(s => s.id !== selectedSession.id));
            setIsDetailsModalOpen(false);
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Failed to delete session.");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">Fitness <span className="text-[var(--primary)] text-5xl">Sessions</span></h1>
                    <p className="text-slate-400">Schedule activities and notify your community instantly.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[var(--primary)] text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20 shrink-0"
                >
                    <FaPlus /> Create Session
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary text-2xl">
                        <FaCalendarAlt />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Active Today</p>
                        <p className="text-2xl font-black">{String(activeToday).padStart(2, '0')}</p>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 text-2xl">
                        <FaUsers />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Total Responses</p>
                        <p className="text-2xl font-black">{totalResponses}</p>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-500 text-2xl">
                        <FaPoll />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Poll Engagement</p>
                        <p className="text-2xl font-black">{pollEngagement}%</p>
                    </div>
                </div>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {sessions.map(session => (
                    <div key={session.id} className="session-card group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform bg-gradient-to-br from-slate-700 to-slate-800 shadow-xl border border-white/5">
                                    {session.type?.includes('Zumba') ? <FaRunning className="text-primary" /> : <FaBiking className="text-blue-500" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black group-hover:text-primary transition-colors">{session.type}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-xs text-slate-400 font-bold"><FaClock className="text-primary/50" /> {session.time}</span>
                                        <span className="flex items-center gap-1 text-xs text-slate-400 font-bold"><FaCalendarAlt className="text-primary/50" /> {session.branch}</span>
                                    </div>
                                </div>
                            </div>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border border-primary/20">Active Poll</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                <span className="text-slate-400">Response Tracking</span>
                                <span className="text-primary">{Math.round((session.inCount / (session.inCount + session.outCount + 1)) * 100)}% Engagement</span>
                            </div>
                            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex shadow-inner border border-white/5">
                                <div className="bg-primary h-full transition-all duration-500" style={{ width: `${(session.inCount / (session.inCount + session.outCount + 1)) * 100}%` }}></div>
                                <div className="bg-slate-600 h-full transition-all duration-500" style={{ width: `${(session.outCount / (session.inCount + session.outCount + 1)) * 100}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-white/5">
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Going</p>
                                        <p className="text-lg font-black text-primary">{session.inCount}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Not Going</p>
                                        <p className="text-lg font-black text-slate-400">{session.outCount}</p>
                                    </div>
                                </div>
                                <button onClick={() => openDetails(session)} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition">Details <FaChevronRight className="text-[10px]" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Session Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Schedule New Session">
                <form onSubmit={handleCreate} className="space-y-6">
                    {/* ... (Create form fields as before) ... */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Activity Type</label>
                            <input
                                required
                                value={newSession.sessionType}
                                onChange={e => setNewSession({ ...newSession, sessionType: e.target.value })}
                                placeholder="e.g. Morning Zumba, Extreme Cardio"
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none transition"
                            />
                        </div>
                        <div className="form-group">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Date</label>
                            <input
                                type="date"
                                required
                                value={newSession.sessionDate || ''}
                                onChange={e => setNewSession({ ...newSession, sessionDate: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="form-group">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Time</label>
                            <input
                                required
                                value={newSession.sessionTime}
                                onChange={e => setNewSession({ ...newSession, sessionTime: e.target.value })}
                                placeholder="e.g. 8:00 AM - 9:00 AM"
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="form-group">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Period</label>
                            <select
                                value={newSession.sessionPeriod}
                                onChange={e => setNewSession({ ...newSession, sessionPeriod: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option>Morning</option>
                                <option>Afternoon</option>
                                <option>Evening</option>
                            </select>
                        </div>
                        <div className="form-group col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Target Audience</label>
                            <select
                                value={newSession.recipientRoles}
                                onChange={e => setNewSession({ ...newSession, recipientRoles: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="USER,PREMIUM_USER">All Members</option>
                                <option value="PREMIUM_USER">Prime Members Only</option>
                                <option value="TRAINER">Trainers Only</option>
                                <option value="USER,PREMIUM_USER,TRAINER,STAFF">Everyone</option>
                            </select>
                        </div>
                        <div className="form-group col-span-2 flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-white/5">
                            <div>
                                <p className="text-sm font-bold">Enable Response Poll</p>
                                <p className="text-[10px] text-slate-500">Allows recipients to mark 'IN' or 'OUT'</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={newSession.pollEnabled}
                                onChange={e => setNewSession({ ...newSession, pollEnabled: e.target.checked })}
                                className="w-5 h-5 accent-primary"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary text-black font-black py-4 rounded-xl shadow-xl hover:bg-[#b8e600] transition-colors"
                    >
                        Blast Session Notification
                    </button>
                </form>
            </Modal>

            {/* Details & Edit Modal */}
            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Session Details">
                {selectedSession && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                            <div>
                                <h3 className="text-xl font-black text-white">{selectedSession.sessionType}</h3>
                                <p className="text-xs text-primary font-bold uppercase tracking-wider">ID: #{selectedSession.id}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${isEditing ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}
                                >
                                    {isEditing ? 'Cancel' : 'Edit'}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="text-xs font-bold px-4 py-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all shadow-lg hover:shadow-red-500/20"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Activity Type</label>
                                        <input
                                            value={selectedSession.sessionType}
                                            onChange={e => setSelectedSession({ ...selectedSession, sessionType: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Time</label>
                                        <input
                                            value={selectedSession.sessionTime}
                                            onChange={e => setSelectedSession({ ...selectedSession, sessionTime: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={selectedSession.sessionDate || ''}
                                            onChange={e => setSelectedSession({ ...selectedSession, sessionDate: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Period</label>
                                        <select
                                            value={selectedSession.sessionPeriod}
                                            onChange={e => setSelectedSession({ ...selectedSession, sessionPeriod: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-primary outline-none"
                                        >
                                            <option>Morning</option>
                                            <option>Afternoon</option>
                                            <option>Evening</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Description</label>
                                        <textarea
                                            value={selectedSession.description || ''}
                                            onChange={e => setSelectedSession({ ...selectedSession, description: e.target.value })}
                                            placeholder="Add details..."
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-primary outline-none min-h-[80px]"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="flex items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedSession.pollEnabled}
                                                onChange={e => setSelectedSession({ ...selectedSession, pollEnabled: e.target.checked })}
                                                className="w-4 h-4 accent-primary"
                                            />
                                            <span className="text-sm font-bold text-slate-300">Poll Enabled</span>
                                        </label>
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition">Save Changes</button>
                            </form>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold text-xs mb-1">Time</p>
                                    <p className="font-bold flex items-center gap-2"><FaClock className="text-primary" /> {selectedSession.sessionTime}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold text-xs mb-1">Date</p>
                                    <p className="font-bold flex items-center gap-2"><FaCalendarAlt className="text-primary" /> {selectedSession.sessionDate || 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold text-xs mb-1">Period</p>
                                    <p className="font-bold">{selectedSession.sessionPeriod}</p>
                                </div>
                                <div className="col-span-2 bg-white/5 p-4 rounded-xl">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold text-xs mb-1">Target Audience</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedSession.recipientRoles?.split(',').map(role => (
                                            <span key={role} className="px-2 py-1 bg-slate-700 rounded text-xs font-mono">{role}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-2 bg-white/5 p-4 rounded-xl">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold text-xs mb-1">Description</p>
                                    <p className="text-slate-300 leading-relaxed">{selectedSession.description || "No description provided."}</p>
                                </div>
                                <div className="col-span-2 bg-white/5 p-4 rounded-xl flex items-center justify-between">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold text-xs">Branch IDs</p>
                                    <p className="font-mono text-xs">{selectedSession.branchIds}</p>
                                </div>
                            </div>
                        )}

                        {!isEditing && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live Statistics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center">
                                        <p className="text-2xl font-black text-green-500">{selectedSession.inCount}</p>
                                        <p className="text-[10px] uppercase font-bold text-green-500/70">Going</p>
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
                                        <p className="text-2xl font-black text-red-500">{selectedSession.outCount}</p>
                                        <p className="text-[10px] uppercase font-bold text-red-500/70">Not Going</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            <style jsx>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                }
                .session-card {
                    background: linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    padding: 24px;
                    transition: all 0.3s ease;
                }
                .session-card:hover {
                    border-color: rgba(var(--primary-rgb), 0.3);
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
                }
            `}</style>
        </div>
    );
}
