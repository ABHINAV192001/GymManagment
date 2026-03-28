"use client";
import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, WORKOUT_API_BASE_URL } from '@/lib/api/client';
import Modal from '@/app/components/Modal';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';

export default function AdminActivitiesPage() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        time: '',
        calories: '',
        image: '',
        gradient: '',
        description: '',
        instructorName: '',
        instructorRole: '',
        schedule: '', // Will handle as string for input
        category: 'CLASS'
    });

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const data = await apiGet('/api/activities', {}, { baseUrl: WORKOUT_API_BASE_URL });
            if (data && Array.isArray(data)) {
                setActivities(data);
            }
        } catch (error) {
            console.error("Failed to fetch activities", error);
            alert("Failed to load activities.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setIsEditing(false);
        setFormData({
            title: '', time: '', calories: '', image: '', gradient: '', description: '',
            instructorName: '', instructorRole: '', schedule: '', category: 'CLASS'
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (activity) => {
        setIsEditing(true);
        setCurrentActivity(activity);
        setFormData({
            title: activity.title || '',
            time: activity.time || '',
            calories: activity.calories || '',
            image: activity.image || '',
            gradient: activity.gradient || '',
            description: activity.description || '',
            instructorName: activity.instructorName || '',
            instructorRole: activity.instructorRole || '',
            schedule: activity.schedule ? activity.schedule.join('\n') : '',
            category: activity.category || 'CLASS'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this activity?")) return;
        try {
            await apiDelete(`/api/activities/${id}`, { baseUrl: WORKOUT_API_BASE_URL });
            setActivities(activities.filter(a => a.id !== id));
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Failed to delete.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                schedule: formData.schedule.split('\n').filter(s => s.trim() !== '')
            };

            if (isEditing && currentActivity) {
                await apiPut(`/api/activities/${currentActivity.id}`, payload, { baseUrl: WORKOUT_API_BASE_URL });
            } else {
                await apiPost('/api/activities', payload, { baseUrl: WORKOUT_API_BASE_URL });
            }
            setIsModalOpen(false);
            fetchActivities();
        } catch (error) {
            console.error("Failed to save", error);
            alert("Failed to save activity.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold text-white">Manage <span className="text-primary">Activities</span></h1>
                    <p className="text-slate-400">Add or edit fitness classes and programs.</p>
                </div>
                <button onClick={handleOpenCreate} className="bg-primary text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition shadow-lg shrink-0">
                    <FaPlus /> Add Activity
                </button>
            </div>

            {loading ? <p className="text-white">Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map(activity => (
                        <div key={activity.id} className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1" style={{ background: activity.gradient || 'var(--primary)' }}></div>

                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white">{activity.title}</h3>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenEdit(activity)} className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30"><FaEdit /></button>
                                    <button onClick={() => handleDelete(activity.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"><FaTrash /></button>
                                </div>
                            </div>

                            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{activity.description}</p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                    <span className="bg-slate-700 px-2 py-1 rounded">{activity.time}</span>
                                    <span className="bg-slate-700 px-2 py-1 rounded">{activity.calories}</span>
                                </div>
                                {activity.instructorName && <p className="text-xs text-slate-400">Instructor: <span className="text-white">{activity.instructorName}</span></p>}
                            </div>

                            <div className="border-t border-white/5 pt-4">
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 flex items-center gap-1"><FaCalendarAlt /> Schedule</p>
                                <div className="flex flex-wrap gap-2">
                                    {activity.schedule && activity.schedule.length > 0 ? activity.schedule.map((s, i) => (
                                        <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">{s}</span>
                                    )) : <span className="text-xs text-slate-600">No schedule set</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Edit Activity" : "New Activity"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Title</label>
                            <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-primary outline-none" placeholder="e.g. Zumba Gold" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Time</label>
                            <input value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-primary outline-none" placeholder="60 min" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Calories</label>
                            <input value={formData.calories} onChange={e => setFormData({ ...formData, calories: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-primary outline-none" placeholder="500 kcal" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Gradient (CSS)</label>
                            <input value={formData.gradient} onChange={e => setFormData({ ...formData, gradient: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-primary outline-none" placeholder="linear-gradient(...)" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-primary outline-none min-h-[80px]" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Schedule (One per line)</label>
                            <textarea
                                value={formData.schedule}
                                onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-primary outline-none min-h-[100px] font-mono"
                                placeholder="Mon - 6:00 PM&#10;Wed - 7:00 PM"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Instructor Name</label>
                            <input value={formData.instructorName} onChange={e => setFormData({ ...formData, instructorName: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Instructor Role</label>
                            <input value={formData.instructorRole} onChange={e => setFormData({ ...formData, instructorRole: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:border-primary outline-none" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition">Save Activity</button>
                </form>
            </Modal>
        </div>
    );
}
