import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Clock, User, CheckCircle, Plus, X, Users, AlertCircle } from 'lucide-react';
import { Activity, ActivitySchedule, Member, Staff } from '../../types';
import { getActivities } from '../../lib/api/activities';

export const Activities: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ triggerAnnouncement: (msg: string) => void }>();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [schedules, setSchedules] = useState<ActivitySchedule[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  useEffect(() => {
    getActivities()
      .then(data => setActivities(data))
      .catch(err => triggerAnnouncement(`Failed to load activities: ${err.message}`));
  }, [triggerAnnouncement]);
  const [isOpen, setIsOpen] = useState(false);
  const [newSch, setNewSch] = useState({
    activityId: 'act-1',
    location: 'Studio Alpha',
    time: '08:00',
    date: '2026-07-16',
  });

  const getActivityName = (id: string) => {
    return activities.find(a => a.id === id)?.name || 'Gym Class';
  };

  const getActivityColor = (id: string) => {
    return activities.find(a => a.id === id)?.colorHex || '#3b82f6';
  };

  const handleBookSpot = (scheduleId: string) => {
    const sch = schedules.find(s => s.id === scheduleId);
    if (!sch) return;

    const act = activities.find(a => a.id === sch.activityId);
    const maxCapacity = act?.maxCapacity || 20;

    if (sch.currentCount >= maxCapacity) {
      triggerAnnouncement('Class booking failed. Class is fully booked.');
      return;
    }

    // Book spot
    const updated: ActivitySchedule = {
      ...sch,
      currentCount: sch.currentCount + 1,
      bookings: [...sch.bookings, 'm-1'], // Mock Amit Sharma as booked
    };

    setSchedules(schedules.map(s => s.id === updated.id ? updated : s));
    triggerAnnouncement(`Successfully booked spot in ${getActivityName(sch.activityId)}. Remaining spots updated.`);
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();

    const act = activities.find(a => a.id === newSch.activityId);
    const duration = act?.durationMins || 45;

    const created: ActivitySchedule = {
      id: `sch-${schedules.length + 1}`,
      activityId: newSch.activityId,
      orgId: 'org-1',
      branchId: 'b-1',
      scheduledAt: `${newSch.date}T${newSch.time}:00Z`,
      durationMins: duration,
      location: newSch.location,
      currentCount: 0,
      status: 'SCHEDULED',
      bookings: [],
    };

    setSchedules([...schedules, created]);
    setIsOpen(false);
    triggerAnnouncement(`Class session scheduled successfully for ${newSch.date}.`);
  };

  return (
    <div className="space-y-6">
      {/* Top action block */}
      <div className="flex flex-col md:flex-row justify-between items-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 gap-4">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Zumba, Yoga & HIIT Group Timetable</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Manage session bookings, trainer allocations, and check live slot occupancy.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow font-sans"
        >
          <Plus className="w-4 h-4" /> Schedule Group Session
        </button>
      </div>

      {/* Main class schedules listing */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Class Timetable Slots">
        {schedules.map((sch) => {
          const act = activities.find(a => a.id === sch.activityId) || { name: 'Gym Class', maxCapacity: 20, description: 'Cardio routine', colorHex: '#cbd5e1' };
          const instructor = staff.find(s => s.id === act.instructorId)?.name || 'Sanjana Sen';
          const remainingSpots = act.maxCapacity - sch.currentCount;
          const isFull = remainingSpots <= 0;

          return (
            <div
              key={sch.id}
              className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: act.colorHex }} />
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Scheduled class</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isFull ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'}`}>
                    {isFull ? 'FULLY BOOKED' : 'OPEN FOR BOOKING'}
                  </span>
                </div>

                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{act.name}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{act.description}</p>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900/60 mt-4 text-xs text-zinc-600 dark:text-zinc-400">
                  <p className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-zinc-400" /> {new Date(sch.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({sch.durationMins} mins)</p>
                  <p className="flex items-center gap-1.5"><User className="w-4 h-4 text-zinc-400" /> {instructor}</p>
                  <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-zinc-400" /> {new Date(sch.scheduledAt).toLocaleDateString()}</p>
                  <p className="flex items-center gap-1.5"><Users className="w-4 h-4 text-zinc-400" /> {sch.location}</p>
                </div>
              </div>

              {/* Booking Trigger and Seat occupancy */}
              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-900 mt-4 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase">Available Slots</span>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {remainingSpots} of {act.maxCapacity} seats left
                  </span>
                </div>

                <button
                  onClick={() => handleBookSpot(sch.id)}
                  disabled={isFull}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition focus:outline-2 focus:outline-blue-500 ${
                    isFull
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed border'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                  }`}
                >
                  {isFull ? 'Seats Full' : 'Book Session Spot'}
                </button>
              </div>

            </div>
          );
        })}
      </section>

      {/* Scheduler Dialog Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="sch-heading">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs text-zinc-700 dark:text-zinc-300">
            <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <h4 id="sch-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Schedule New Group Session</h4>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Select Activity Type *</label>
                <select
                  value={newSch.activityId}
                  onChange={(e) => setNewSch({ ...newSch, activityId: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold"
                >
                  {activities.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.durationMins} mins)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Schedule Date *</label>
                  <input
                    type="date"
                    required
                    value={newSch.date}
                    onChange={(e) => setNewSch({ ...newSch, date: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Start Time (24h) *</label>
                  <input
                    type="text"
                    required
                    value={newSch.time}
                    onChange={(e) => setNewSch({ ...newSch, time: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                    placeholder="e.g. 08:30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Studio / Room Location *</label>
                <input
                  type="text"
                  required
                  value={newSch.location}
                  onChange={(e) => setNewSch({ ...newSch, location: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                  placeholder="e.g. Studio Alpha Main Room"
                />
              </div>

              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
                >
                  Publish Timetable Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
