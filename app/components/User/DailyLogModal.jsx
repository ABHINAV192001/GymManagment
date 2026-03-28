"use client";

import { useState, useEffect } from "react";
import { FiX, FiTrash2, FiDroplet } from "react-icons/fi";
import axios from "axios";

export default function DailyLogModal({ isOpen, onClose, date }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = getCookie('authToken') || getCookie('jwt') || getCookie('accessToken');
            console.log("DailyLogModal: Fetching with token:", token ? "Found" : "Missing"); // Debugging

            const res = await axios.get(`http://localhost:8080/api/user/daily-log?date=${date}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch daily log", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, date]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to remove this item?")) return;
        try {
            const token = getCookie('authToken') || getCookie('jwt') || getCookie('accessToken');
            await axios.delete(`http://localhost:8080/api/user/food/log/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Refresh data
            fetchData();
        } catch (error) {
            console.error("Failed to delete log", error);
            alert("Failed to delete item");
        }
    };

    const handleDeleteWater = async (id) => {
        if (!confirm("Remove this water entry?")) return;
        try {
            const token = getCookie('authToken') || getCookie('jwt') || getCookie('accessToken');
            await axios.delete(`http://localhost:8080/api/user/water/log/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error("Failed to delete water log", error);
            alert("Failed to delete item");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900 z-10">
                    <div>
                        <h2 className="text-2xl font-bold">Daily Progress</h2>
                        <p className="text-gray-500 text-sm mt-1">{date}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                        suppressHydrationWarning
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                        {/* Macro Summary Card */}
                        <div className="bg-gray-50 dark:bg-neutral-800 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-neutral-700">
                            <div className="flex justify-between items-center text-center">
                                <div className="flex-1 border-r border-gray-200 dark:border-neutral-700 last:border-0">
                                    <div className="text-sm text-gray-500 mb-1">Carbs</div>
                                    <div className="text-xl font-bold text-blue-500">{data?.totalCarbs || 0}g</div>
                                </div>
                                <div className="flex-1 border-r border-gray-200 dark:border-neutral-700 last:border-0">
                                    <div className="text-sm text-gray-500 mb-1">Protein</div>
                                    <div className="text-xl font-bold text-green-500">{data?.totalProtein || 0}g</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-500 mb-1">Fat</div>
                                    <div className="text-xl font-bold text-yellow-500">{data?.totalFat || 0}g</div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700 flex justify-between items-center">
                                <div className="text-gray-600 dark:text-gray-300 font-medium">Total Calories</div>
                                <div className="text-2xl font-black">{data?.totalCalories || 0} kcal</div>
                            </div>
                        </div>

                        {/* Water Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" suppressHydrationWarning>
                                <FiDroplet className="text-blue-500" /> Water Intake
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 flex justify-between items-center border border-blue-100 dark:border-blue-800/30 mb-4">
                                <span className="text-blue-700 dark:text-blue-300 font-medium">Total Consumed</span>
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {data?.totalWater?.toFixed(2) || "0.00"} L
                                </span>
                            </div>

                            {/* Water Log List */}
                            <div className="space-y-2 pl-2">
                                {data?.waterLogs?.length > 0 && (
                                    <div className="text-sm font-semibold text-gray-500 mb-2">History</div>
                                )}
                                {data?.waterLogs?.map((log) => (
                                    <div key={log.id} className="group flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 border border-transparent hover:border-gray-100 dark:hover:border-neutral-700 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500" suppressHydrationWarning>
                                                <FiDroplet size={14} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-700 dark:text-gray-300">{log.amount} L</div>
                                                <div className="text-xs text-gray-400">
                                                    {log.loggedAt ? new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Logged'}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteWater(log.id)}
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete Entry"
                                            suppressHydrationWarning
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Food Log List */}
                        <div>
                            <h3 className="text-lg font-bold mb-4">Food Log</h3>
                            <div className="space-y-3">
                                {data?.foodLogs?.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No food logged for this day.</p>
                                ) : (
                                    data?.foodLogs?.map((item) => (
                                        <div key={item.id} className="group bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition-all">
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <h4 className="font-bold text-lg">{item.foodName}</h4>
                                                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full capitalize">{item.mealType || 'Snack'}</span>
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {item.quantity} x {item.portionName}
                                                </div>
                                                <div className="flex gap-3 mt-2 text-xs font-medium text-gray-400">
                                                    <span className="text-blue-400">{Math.round(item.carbs)}c</span>
                                                    <span className="text-green-400">{Math.round(item.protein)}p</span>
                                                    <span className="text-yellow-400">{Math.round(item.fat)}f</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className="font-bold text-lg">{Math.round(item.calories)}</div>
                                                    <div className="text-xs text-gray-400">kcal</div>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    title="Delete Entry"
                                                    suppressHydrationWarning
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
