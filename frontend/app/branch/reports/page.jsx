"use client";

import { useState, useEffect } from 'react';
import { FaUsers, FaDumbbell, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';
import NotificationPanel from '../../components/NotificationPanel';
import { getUsers, getStaff, getInventory } from '../../../lib/api/branch';

export default function BranchReports() {
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeRevenue: 0,
        totalStaff: 0,
        inventoryItems: 0
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch data in parallel
                const [usersData, staffData, inventoryData] = await Promise.all([
                    getUsers(),
                    getStaff(),
                    getInventory()
                ]);

                // Calculate Stats
                const revenue = usersData.reduce((sum, user) => sum + (Number(user.amountPaid) || 0), 0);

                setStats({
                    totalMembers: usersData.length,
                    activeRevenue: revenue,
                    totalStaff: staffData.length,
                    inventoryItems: inventoryData.length
                });
                setUsers(usersData);
            } catch (error) {
                console.error("Failed to fetch report data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="text-white text-center p-10">Loading Reports...</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
            {/* Left Content - Stats & Charts */}
            <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2 custom-scrollbar">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Branch Reports
                        </h1>
                        <p className="text-slate-400">Overview of branch performance and health.</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={<FaMoneyBillWave />}
                        label="Total Revenue"
                        value={`$${stats.activeRevenue.toLocaleString()}`}
                        color="text-green-400"
                        bg="bg-green-500/10"
                        border="border-green-500/20"
                    />
                    <StatCard
                        icon={<FaUsers />}
                        label="Total Members"
                        value={stats.totalMembers}
                        color="text-blue-400"
                        bg="bg-blue-500/10"
                        border="border-blue-500/20"
                    />
                    <StatCard
                        icon={<FaChartLine />}
                        label="Total Staff"
                        value={stats.totalStaff}
                        color="text-purple-400"
                        bg="bg-purple-500/10"
                        border="border-purple-500/20"
                    />
                    <StatCard
                        icon={<FaDumbbell />}
                        label="Inventory Items"
                        value={stats.inventoryItems}
                        color="text-orange-400"
                        bg="bg-orange-500/10"
                        border="border-orange-500/20"
                    />
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Revenue Trend Chart (SVG) */}
                    <div className="glass-panel p-6 flex flex-col h-80">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Revenue Trend (Est.)</h3>
                        <div className="flex-1 w-full h-full relative border-l border-b border-slate-700/50">
                            <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-lg p-2 overflow-visible">
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Grid Lines */}
                                <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                                <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                                {/* Path */}
                                <path
                                    d="M0 45 Q 15 40, 25 35 T 50 20 T 75 25 T 100 10"
                                    fill="none"
                                    stroke="var(--primary)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M0 45 Q 15 40, 25 35 T 50 20 T 75 25 T 100 10 V 50 H 0 Z"
                                    fill="url(#lineGradient)"
                                    opacity="0.3"
                                />
                                {/* Dots */}
                                <circle cx="25" cy="35" r="2" fill="#fff" />
                                <circle cx="50" cy="20" r="2" fill="#fff" />
                                <circle cx="75" cy="25" r="2" fill="#fff" />
                                <circle cx="100" cy="10" r="2" fill="#fff" />
                            </svg>
                            {/* Labels */}
                            <div className="absolute bottom-[-20px] left-0 w-full flex justify-between text-xs text-slate-500">
                                <span>Week 1</span>
                                <span>Week 2</span>
                                <span>Week 3</span>
                                <span>Week 4</span>
                            </div>
                        </div>
                    </div>

                    {/* Member Growth Bar Chart (HTML/CSS) */}
                    <div className="glass-panel p-6 flex flex-col h-80">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Member Growth</h3>
                        <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-6 border-b border-slate-700/50">
                            {[30, 45, 35, 60, 50, 75, 90].map((height, i) => (
                                <div key={i} className="relative group w-full flex flex-col justify-end items-center h-full">
                                    <div
                                        className="w-full bg-blue-500/30 rounded-t-sm transition-all duration-300 hover:bg-blue-400 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        style={{ height: `${height}%` }}
                                    ></div>
                                    <span className="text-[10px] text-slate-500 mt-2 absolute -bottom-6">
                                        Day {i + 1}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Additional Quick Stats Row */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Branch Health</h3>
                    <div className="flex justify-between items-center text-center">
                        <div className="flex-1 border-r border-white/5">
                            <p className="text-sm text-gray-400">Retention Rate</p>
                            <p className="text-2xl font-bold text-green-400">88%</p>
                        </div>
                        <div className="flex-1 border-r border-white/5">
                            <p className="text-sm text-gray-400">Avg. Attendance</p>
                            <p className="text-2xl font-bold text-yellow-400">45/day</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-400">Customer Satisfaction</p>
                            <p className="text-2xl font-bold text-blue-400">4.8/5</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Sidebar - Notifications */}
            <div className="lg:col-span-1 h-full min-h-[500px]">
                <NotificationPanel users={users} />
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
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}

function StatCard({ icon, label, value, color, bg, border }) {
    return (
        <div className={`glass-panel p-5 flex items-center gap-4 border ${border} ${bg} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
            <div className={`text-3xl ${color} z-10 p-3 rounded-full bg-slate-900/40`}>
                {icon}
            </div>
            <div className="z-10">
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-white mt-1">{value}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 text-9xl opacity-5 ${color} z-0 transform rotate-12 group-hover:rotate-0 transition-transform duration-500`}>
                {icon}
            </div>
        </div>
    );
}
