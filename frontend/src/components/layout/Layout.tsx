import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Users,
  ShieldAlert,
  Award,
  DollarSign,
  Barcode,
  Calendar,
  Dumbbell,
  UserCheck,
  Send,
  MessageCircle,
  Key,
  Settings as SettingsIcon,
  ChevronRight,
  ChevronLeft,
  Menu,
  LogOut,
  Bell,
  CheckCircle2,
  Building2,
  Sun,
  Moon,
  User,
  ShoppingCart,
  UserPlus,
  ClipboardList
} from 'lucide-react';

import {
  Organization,
  Branch,
  AccessibilitySettings,
} from '../../types';
import { getAdminBranches } from '../../lib/api/admin';
import { getMyOrg } from '../../lib/api/organizations';

import { A11yControls } from '../A11yControls';
import { logout } from '../../lib/api/auth';
import { getMyPermissions } from '../../lib/api/rbac';
import { getGroupSessions, voteGroupSession, GroupSessionResponse } from '../../lib/api/groupSessions';
import { FloatingChatWidget } from '../chat/FloatingChatWidget';
import { ProfileModal } from '../profile/ProfileModal';
import { getUserProfile } from '../../lib/api/user';

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

const navItems = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'MEMBER_PORTAL', label: 'My Dashboard', icon: LayoutDashboard, path: '/member-portal' },
  { id: 'BRANCHES', label: 'Branches', icon: MapPin, path: '/branches' },
  { id: 'USERS', label: 'Members Directory', icon: Users, path: '/members' },
  { id: 'STAFF', label: 'Staff & Payroll', icon: ShieldAlert, path: '/staff' },
  { id: 'PLANS', label: 'Membership Plans', icon: Award, path: '/plans' },
  { id: 'ACCOUNTS', label: 'Finance & Ledger', icon: DollarSign, path: '/accounts' },
  { id: 'INVENTORY', label: 'Equipment Assets', icon: Barcode, path: '/inventory' },
  { id: 'ACTIVITY', label: 'Group Classes', icon: Calendar, path: '/activities' },
  { id: 'WORKOUT', label: 'Workouts & Diets', icon: Dumbbell, path: '/workouts' },
  { id: 'ATTENDANCE', label: 'Entrance Desk', icon: UserCheck, path: '/attendance' },
  { id: 'NOTIFICATIONS', label: 'Marketing Blasts', icon: Send, path: '/notifications' },
  { id: 'CHAT', label: 'Client Chat Hub', icon: MessageCircle, path: '/chat' },
  { id: 'RBAC', label: 'RBAC Roles Matrix', icon: Key, path: '/rbac' },
  { id: 'SETTINGS', label: 'App Settings', icon: SettingsIcon, path: '/settings' },
  // Enterprise Modules
  { id: 'CRM', label: 'Lead CRM', icon: UserPlus, path: '/crm' },
  { id: 'ROSTER', label: 'Shift Roster', icon: ClipboardList, path: '/roster' },
  { id: 'POS', label: 'POS Billing', icon: ShoppingCart, path: '/pos' },
];

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Core global state matrices
  const [org, setOrg] = useState<Organization>({
    id: '',
    name: 'Loading...',
    phone: '',
    email: '',
    is_active: true,
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchOrgAndUser = () => {
      Promise.all([getMyOrg(), getUserProfile()])
        .then(([orgData, userProfileData]) => {
          if (orgData) setOrg(orgData);
          if (userProfileData) setUserProfile(userProfileData);
        })
        .catch(err => console.error(err));
    };

    Promise.all([getAdminBranches(), getMyOrg(), getUserProfile()])
      .then(([branchesData, orgData, userProfileData]) => {
        const branchList = branchesData || [];
        setBranches(branchList);
        if (branchList.length === 1) {
          setSelectedBranchId(branchList[0].id);
        }
        if (orgData) {
          setOrg(orgData);
        }
        if (userProfileData) {
          setUserProfile(userProfileData);
        }
      })
      .catch(err => console.error(err));

    window.addEventListener('gymos_org_updated', fetchOrgAndUser);
    return () => window.removeEventListener('gymos_org_updated', fetchOrgAndUser);
  }, []);

  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>({});
  const [userRole, setUserRole] = useState<string>('');
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setIsLoadingPermissions(true);
        const data = await getMyPermissions();
        if (data && data.permissions) {
          setUserPermissions(data.permissions);
        }
        const cookieRole = document.cookie.match(/gymos_role=([^;]+)/)?.[1];
        const apiRole = data?.role && data.role !== 'UNKNOWN' ? data.role : null;
        setUserRole(apiRole || cookieRole || 'USER');
      } catch (err) {
        console.error('Failed to fetch permissions', err);
      } finally {
        setIsLoadingPermissions(false);
      }
    };
    fetchPermissions();
  }, []);

  // Dynamic Activity Notifications
  const [activityNotifications, setActivityNotifications] = useState<GroupSessionResponse[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const sessions = await getGroupSessions(selectedBranchId);
      const active = (Array.isArray(sessions) ? sessions : []).filter(
        s => s.status !== 'DELETED'
      );
      setActivityNotifications(active);
    } catch (err) {
      console.error('Failed to fetch activity notifications:', err);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Accessibility State Tracker — restore from localStorage or default to light
  const [a11y, setA11y] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('gymos_theme');
    const validThemes = ['light', 'dark', 'high-contrast-light', 'high-contrast-dark'];
    return {
      theme: (saved && validThemes.includes(saved) ? saved : 'light') as AccessibilitySettings['theme'],
      fontSize: 'base',
      dyslexicFont: false,
      gymAccess: true,
    };
  });

  const [announcements, setAnnouncements] = useState<string[]>([
    'Welcome to GymOS Management Suite. All modules initialized.',
  ]);

  const triggerAnnouncement = useCallback((msg: string) => {
    setAnnouncements((prev) => [...prev, msg]);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        const key = e.key.toLowerCase();
        let targetPath = null;
        let label = '';
        if (key === 'd') {
          targetPath = '/dashboard'; label = 'Dashboard';
        } else if (key === 'm') {
          targetPath = '/members'; label = 'Members Roster';
        } else if (key === 'b') {
          targetPath = '/branches'; label = 'Branch Directory';
        } else if (key === 's') {
          targetPath = '/settings'; label = 'Settings Panel';
        } else if (key === 'c') {
          targetPath = '/chat'; label = 'Trainer Chat';
        } else if (key === 'a') {
          targetPath = '/accounts'; label = 'Financial Ledger';
        } else if (key === 'k') {
          targetPath = '/workouts'; label = 'Workouts & Diets';
        } else if (key === 't') {
          targetPath = '/attendance'; label = 'Check-In Desk';
        }
        
        if (targetPath) {
          navigate(targetPath);
          triggerAnnouncement(`Navigated to ${label}`);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, triggerAnnouncement]);

  const isViewAllowed = (viewId: string) => {
    if (userRole === 'ORG_ADMIN' || userRole === 'ROLE_ORG_ADMIN' || userRole === 'ADMIN') return true;
    if (userRole === 'MEMBER' && viewId === 'MEMBER_PORTAL') return true;
    if (userRole === 'MEMBER') return false; // Members only see member portal

    // Enterprise modules — tied to inventory or users permission
    if (viewId === 'CRM' || viewId === 'ROSTER') {
      const usersAllowed = userPermissions['users'] || [];
      return usersAllowed.some(a => a.toLowerCase() === 'view');
    }
    if (viewId === 'POS') {
      const invAllowed = userPermissions['inventory'] || [];
      return invAllowed.some(a => a.toLowerCase() === 'view');
    }
    
    const moduleName = (viewId === 'STAFF' ? 'USERS' : viewId).toLowerCase();
    const allowed = userPermissions[moduleName] || [];
    return allowed.some(action => action.toLowerCase() === 'view');
  };

  const activeItem = navItems.find(item => location.pathname.startsWith(item.path)) || navItems[0];
  const isAllowed = isViewAllowed(activeItem.id);

  useEffect(() => {
    if (!isLoadingPermissions) {
      if (location.pathname === '/dashboard' && !isViewAllowed('DASHBOARD') && isViewAllowed('MEMBER_PORTAL')) {
        navigate('/member-portal', { replace: true });
      } else if (location.pathname === '/member-portal' && !isViewAllowed('MEMBER_PORTAL') && isViewAllowed('DASHBOARD')) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isLoadingPermissions, location.pathname, userRole, userPermissions, navigate]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'high-contrast-dark', 'high-contrast-light');
    if (a11y.theme === 'dark') {
      root.classList.add('dark');
    } else if (a11y.theme === 'high-contrast-dark') {
      root.classList.add('dark', 'high-contrast-dark');
    } else if (a11y.theme === 'high-contrast-light') {
      root.classList.add('light', 'high-contrast-light');
    } else {
      root.classList.add('light');
    }
    localStorage.setItem('gymos_theme', a11y.theme);
  }, [a11y.theme]);

  const toggleQuickTheme = () => {
    const nextTheme = a11y.theme === 'dark' || a11y.theme === 'high-contrast-dark' ? 'light' : 'dark';
    setA11y(prev => ({ ...prev, theme: nextTheme }));
    triggerAnnouncement(`Theme switched to ${nextTheme}`);
  };

  if (isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-[#fafafa] font-sans selection:bg-blue-500/30 transition-colors duration-200">
      
      <div className="sr-only" aria-live="assertive" role="status">
        {announcements[announcements.length - 1]}
      </div>

      <div className="flex h-screen overflow-hidden">
        
        {/* Sidebar Navigation Panel with Mini-Sidebar Collapse Support */}
        <aside
          className={`${
            isSidebarOpen ? 'w-64' : 'w-16'
          } shrink-0 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 border-r border-slate-200 dark:border-zinc-800 flex flex-col justify-between transition-all duration-300 overflow-hidden relative z-40`}
          aria-label="Primary Workspace Navigation"
        >
          <div>
            {/* Top Sidebar Header with Organization Name and Collapse Button */}
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between min-h-[64px]">
              {isSidebarOpen ? (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    {org.logoUrl ? (
                      <img src={org.logoUrl} alt="Logo" className="w-8 h-8 rounded-xl object-cover shadow-md shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0">
                        {org.name && org.name !== 'Loading...' ? org.name.substring(0, 2).toUpperCase() : 'GY'}
                      </div>
                    )}
                    <h1 className="text-slate-900 dark:text-zinc-50 font-extrabold text-sm tracking-tight truncate" title={org.name}>
                      {org.name}
                    </h1>
                  </div>

                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition focus:outline-none"
                    aria-label="Collapse Navigation Sidebar"
                    title="Collapse Sidebar"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center justify-center">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-1.5 rounded-lg text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition focus:outline-none"
                    aria-label="Expand Navigation Sidebar"
                    title="Expand Sidebar"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Scope Badge & User Info — Ultra-compact & Space Efficient */}
            {isSidebarOpen && (
              <div className="px-3 py-2 bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  {/* User Avatar Circle */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  {/* Compact Name & Email */}
                  <div className="min-w-0 flex flex-col leading-tight">
                    <span className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200 truncate" title={userProfile?.name}>
                      {userProfile?.name || 'User'}
                    </span>
                    {userProfile?.email && (
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate" title={userProfile.email}>
                        {userProfile.email}
                      </span>
                    )}
                  </div>
                </div>
                {/* Compact Role Badge */}
                <span className="shrink-0 text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {userRole.replace(/_/g, ' ')}
                </span>
              </div>
            )}

            {/* Navigation items list */}
            <nav className="p-2.5 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)] text-xs font-semibold">
              {navItems.map((item) => {
                const IconComp = item.icon;
                const isSelected = location.pathname.startsWith(item.path);
                const permitted = isViewAllowed(item.id);

                if (!permitted) return null;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      triggerAnnouncement(`Switched screen to ${item.label}`);
                    }}
                    title={!isSidebarOpen ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isSidebarOpen ? 'justify-between p-2.5' : 'justify-center p-3'
                    } rounded-xl transition text-left ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/80 hover:text-slate-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComp className="w-4 h-4 shrink-0" />
                      {isSidebarOpen && <span>{item.label}</span>}
                    </div>
                    {isSidebarOpen && isSelected && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Quick Light/Dark Theme Switcher */}
          <div className="p-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-center">
            <button
              onClick={toggleQuickTheme}
              className={`w-full flex items-center ${
                isSidebarOpen ? 'justify-between px-3 py-2' : 'justify-center p-2'
              } rounded-xl bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition text-xs font-bold border border-slate-200 dark:border-zinc-700/50`}
              title={`Switch to ${a11y.theme === 'dark' || a11y.theme === 'high-contrast-dark' ? 'Light' : 'Dark'} Theme`}
            >
              <div className="flex items-center gap-2">
                {a11y.theme === 'dark' || a11y.theme === 'high-contrast-dark' ? (
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-600 shrink-0" />
                )}
                {isSidebarOpen && (
                  <span>
                    {a11y.theme === 'dark' || a11y.theme === 'high-contrast-dark' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                )}
              </div>
              {isSidebarOpen && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-mono">
                  {a11y.theme.toUpperCase()}
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* Main Stage Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Header Navbar */}
          <header className="h-16 border-b border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 relative z-30">
            {/* Left Header Info */}
            <div className="flex items-center gap-3">
              {branches.length > 1 ? (
                <select
                  value={selectedBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    const bName = e.target.value === 'ALL' ? 'All Branches' : branches.find(b => b.id === e.target.value)?.name || 'Branch';
                    triggerAnnouncement(`Switched view to ${bName}`);
                  }}
                  className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Filter application views by branch"
                >
                  <option value="ALL">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold text-xs">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" />
                  {branches.length === 1 ? branches[0].name : 'Primary Branch'}
                </span>
              )}
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3 relative">
              
              {/* Activity Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    if (!isNotificationsOpen) fetchNotifications();
                  }}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 relative transition"
                  title="Activity & System Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {activityNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs">
                    <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">Activity Notifications</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        {activityNotifications.length} Active
                      </span>
                    </div>

                    <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
                      {activityNotifications.length === 0 ? (
                        <div className="p-6 text-center text-zinc-500">
                          <Bell className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2 opacity-50" />
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">No activity notifications</p>
                          <p className="text-[11px] text-zinc-400 mt-1">All deleted activities have been removed.</p>
                        </div>
                      ) : (
                        activityNotifications.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setIsNotificationsOpen(false);
                              navigate('/activities');
                            }}
                            className="p-3 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer transition space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{s.title}</span>
                                <p className="text-[11px] text-zinc-500 mt-0.5">
                                  Scheduled for {s.sessionTime || s.sessionDate} • Target: {s.notifyRoles && s.notifyRoles.length > 0 ? s.notifyRoles.join(', ') : 'ALL ROLES'}
                                </p>
                              </div>
                              <span className="text-[9px] text-blue-500 font-mono">LIVE</span>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await voteGroupSession(s.id, 'IN');
                                    triggerAnnouncement(`Responded IN for ${s.title}`);
                                  } catch (err: any) {
                                    triggerAnnouncement(`Vote note: ${err.message || 'Already voted'}`);
                                  }
                                  setIsNotificationsOpen(false);
                                  navigate('/activities');
                                }}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1 hover:bg-emerald-700 transition"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Mark IN
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await voteGroupSession(s.id, 'OUT');
                                    triggerAnnouncement(`Responded OUT for ${s.title}`);
                                  } catch (err: any) {
                                    triggerAnnouncement(`Vote note: ${err.message || 'Already voted'}`);
                                  }
                                  setIsNotificationsOpen(false);
                                  navigate('/activities');
                                }}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 transition"
                              >
                                Mark OUT
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-center">
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          navigate('/activities');
                        }}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View All Activity Timetables →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Accessibility Controls Panel */}
              <A11yControls
                settings={a11y}
                onChange={setA11y}
              />

              {/* Profile Management Button */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold text-xs transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Edit User Profile"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                  AA
                </div>
                <span className="hidden sm:inline">Profile</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                aria-label="Log Out"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Main Stage viewport */}
          <main className="flex-1 overflow-y-auto p-6 focus:outline-none" tabIndex={-1} aria-label="Main Viewport Area">
            {isAllowed ? (
              <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header view indicators */}
                <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-900/60">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                      {activeItem.label}
                    </h2>
                  </div>
                </div>

                {/* Outlet for routes */}
                <Outlet context={{ selectedBranchId, branches, triggerAnnouncement, permissions: userPermissions }} />

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                <ShieldAlert className="w-12 h-12 text-red-500" />
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">RESTRICTED ACCESS</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    Your role ({userRole.replace(/_/g, ' ')}) does not have view permission for this module. Ask your organization admin to grant it.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Global Floating Chatbot Widget (Bottom Right) */}
        <FloatingChatWidget currentUserRole={userRole} onAnnounce={triggerAnnouncement} />

        {/* Profile Editing Modal */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userRole={userRole}
          onAnnounce={triggerAnnouncement}
        />
      </div>
    </div>
  );
};
