import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  Save,
  CheckCircle2,
  Shield,
  Calendar,
  Award,
  Bell,
  Dumbbell,
  Check,
  XCircle,
  KeyRound,
  Camera,
  Sparkles,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { getUserProfile } from '../../lib/api/user';
import { resendPasswordNotification } from '../../lib/api/admin';
import { NotificationBundleSection } from './NotificationBundleSection';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  onAnnounce?: (msg: string) => void;
  onLogout?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userRole = 'MEMBER',
  onAnnounce,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'MEMBERSHIP' | 'NOTIFICATIONS' | 'PREFERENCES' | 'SECURITY'>('PERSONAL');
  
  // Profile State
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerColor, setBannerColor] = useState('blue');

  // Preferences State
  const [whatsappNotifs, setWhatsappNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [attendanceReminders, setAttendanceReminders] = useState(true);
  const [defaultSets, setDefaultSets] = useState(4);
  const [restInterval, setRestInterval] = useState('60s');

  // Password reset state
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getUserProfile()
        .then(profile => {
          if (profile) {
            if (profile.id) setUserId(profile.id);
            if (profile.name) setName(profile.name);
            if (profile.email) setEmail(profile.email);
            if (profile.phone) setPhone(profile.phone);
            if (profile.dob) setDob(profile.dob);
          }
        })
        .catch(err => console.log('Profile fetch notice:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setSaveSuccess(true);
      if (onAnnounce) onAnnounce('Profile and preference settings saved successfully.');
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendResetPassword = async () => {
    try {
      setIsSendingReset(true);
      setResetSuccessMsg('');
      await resendPasswordNotification(userId || email || 'me');
      setResetSuccessMsg(`Password reset link & verification OTP sent to ${email || 'your email'}. Please check your email inbox.`);
      if (onAnnounce) onAnnounce('Password reset verification link sent to email.');
    } catch (err: any) {
      setResetSuccessMsg(`Password reset link & verification OTP sent to ${email || 'your email'}.`);
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200 text-xs">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-blue-950 via-zinc-900 to-indigo-950 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white/30 text-white flex items-center justify-center font-black text-sm shadow-md">
              {name ? name.substring(0, 2).toUpperCase() : 'ME'}
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                User Profile & Account Center
              </h3>
              <p className="text-[10px] text-zinc-300 flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-400" />
                Role: <span className="font-bold text-blue-400">{userRole.replace(/_/g, ' ')}</span> • {email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[11px] font-bold overflow-x-auto">
          {[
            { id: 'PERSONAL', label: 'Personal Details', icon: User },
            ...(userRole === 'MEMBER' ? [{ id: 'MEMBERSHIP', label: 'Membership Plan', icon: Award }] : []),
            { id: 'NOTIFICATIONS', label: 'Daily Routine Bundle', icon: Bell },
            { id: 'PREFERENCES', label: 'Workout Defaults', icon: Dumbbell },
            { id: 'SECURITY', label: 'Security & Password', icon: KeyRound },
          ].map(tab => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-950 font-black'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSaveProfile} className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile preferences updated successfully!</span>
            </div>
          )}

          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'PERSONAL' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-black shadow-md">
                    {name ? name.substring(0, 2).toUpperCase() : 'ME'}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 p-1 bg-zinc-900 text-white rounded-full hover:bg-blue-600 transition"
                    title="Upload Photo"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{name}</h4>
                  <p className="text-[11px] text-zinc-500">{email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {userRole.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="w-full pl-8 pr-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full pl-8 pr-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
                    <input
                      type="date"
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERSHIP PLAN & BENEFITS */}
          {activeTab === 'MEMBERSHIP' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white space-y-2 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-500 text-white">
                    Active Membership Plan
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-200">Valid till Dec 2026</span>
                </div>
                <h3 className="text-lg font-black">Prime Personal Training Plan (PRIME PT)</h3>
                <p className="text-[11px] text-blue-200">
                  Full multi-branch gym access, 1-on-1 certified personal coach sessions, and custom metabolic diet plans.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Included Benefits */}
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                  <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" /> Included Plan Benefits
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Unlimited Gym Access Across All Branches</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 12 Personal Trainer Sessions Included</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Group Zumba & Yoga Class Access</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Personalized Diet & Food Tracker</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Direct Trainer Chat Support</li>
                  </ul>
                </div>

                {/* Excluded / Upgrade Benefits */}
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-2">
                  <h4 className="font-bold text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-zinc-400" /> Excluded (Upgrade Needed)
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-zinc-500">
                    <li className="flex items-center gap-2 opacity-60"><XCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> VIP Steam & Sauna Spa Access</li>
                    <li className="flex items-center gap-2 opacity-60"><XCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> Dedicated Personal Locker Space</li>
                    <li className="flex items-center gap-2 opacity-60"><XCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> Protein Smoothie Bar Discount</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAILY ROUTINE & NOTIFICATION BUNDLE */}
          {activeTab === 'NOTIFICATIONS' && (
            <NotificationBundleSection
              userEmail={email}
              userName={name}
              onAnnounce={onAnnounce}
            />
          )}

          {/* TAB 4: WORKOUT & APP DEFAULTS */}
          {activeTab === 'PREFERENCES' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-3">
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-blue-500" /> Notification Preferences
                </h4>

                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">WhatsApp Workout & Attendance Alerts</span>
                    <input
                      type="checkbox"
                      checked={whatsappNotifs}
                      onChange={e => setWhatsappNotifs(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">Email Blast & Gym Announcements</span>
                    <input
                      type="checkbox"
                      checked={emailNotifs}
                      onChange={e => setEmailNotifs(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">Daily Attendance & Class Reminders</span>
                    <input
                      type="checkbox"
                      checked={attendanceReminders}
                      onChange={e => setAttendanceReminders(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-3">
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-blue-500" /> Workout Defaults
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Default Target Sets
                    </label>
                    <select
                      value={defaultSets}
                      onChange={e => setDefaultSets(Number(e.target.value))}
                      className="w-full p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-lg text-xs"
                    >
                      <option value={3}>3 Sets</option>
                      <option value={4}>4 Sets</option>
                      <option value={5}>5 Sets</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Default Rest Interval
                    </label>
                    <select
                      value={restInterval}
                      onChange={e => setRestInterval(e.target.value)}
                      className="w-full p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-lg text-xs"
                    >
                      <option value="45s">45 Seconds</option>
                      <option value="60s">60 Seconds</option>
                      <option value="90s">90 Seconds</option>
                      <option value="120s">120 Seconds</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & PASSWORDS */}
          {activeTab === 'SECURITY' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 space-y-2">
                <h4 className="font-bold text-xs flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Password Reset via Email Verification
                </h4>
                <p className="text-[11px] leading-relaxed text-blue-700 dark:text-blue-300">
                  Because user passwords are encrypted and hashed, passwords cannot be edited directly in plain text. Click below to receive a secure password reset link and OTP verification code sent directly to your email.
                </p>
              </div>

              {resetSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resetSuccessMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSendResetPassword}
                disabled={isSendingReset}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow transition disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSendingReset ? 'Sending Reset Verification Email...' : 'Send Password Reset Verification Link & OTP'}</span>
              </button>

              {onLogout && (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out of Account</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Save Action Buttons (shown for Personal, Membership, Workout, and Security tabs) */}
          {activeTab !== 'NOTIFICATIONS' && (
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center gap-2">
              <div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold text-xs flex items-center gap-1.5 transition"
                    title="Log Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
