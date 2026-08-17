import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ClipboardList,
  Apple,
  Layers,
  X
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
import { getStoredToken } from '../../lib/api/client';
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

export type MobileCategoryKey = 'EMPLOYEES' | 'ACCOUNTS' | 'DASHBOARD' | 'WORKOUTS' | 'DESK';

export interface MobileSubItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

export interface MobileCategory {
  key: MobileCategoryKey;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
  items: MobileSubItem[];
}

export const MOBILE_CATEGORIES: MobileCategory[] = [
  {
    key: 'EMPLOYEES',
    label: 'Employees & Members',
    shortLabel: 'Employees',
    icon: Users,
    description: 'Branches, member directory, payroll, plans & rosters',
    items: [
      { id: 'BRANCHES', label: 'Branches', description: 'Multi-branch locations & facility setups', icon: MapPin, path: '/branches', color: 'from-blue-500 to-indigo-600' },
      { id: 'USERS', label: 'Member Directory', description: 'Active & archived gym members', icon: Users, path: '/members', color: 'from-sky-500 to-blue-600' },
      { id: 'STAFF', label: 'Staff Payroll', description: 'Staff compensation, roles & trainers', icon: ShieldAlert, path: '/staff', color: 'from-purple-500 to-indigo-600' },
      { id: 'PLANS', label: 'Membership Plans', description: 'Subscription tiers & recurring pricing', icon: Award, path: '/plans', color: 'from-amber-500 to-orange-600' },
      { id: 'ROSTER', label: 'Shift Rotation', description: 'Trainer shifts & staff roster scheduling', icon: ClipboardList, path: '/roster', color: 'from-emerald-500 to-teal-600' },
    ],
  },
  {
    key: 'ACCOUNTS',
    label: 'Financial & Assets',
    shortLabel: 'Accounts',
    icon: DollarSign,
    description: 'Financial ledgers, equipment machinery & point of sale',
    items: [
      { id: 'ACCOUNTS', label: 'Financial Ledgers', description: 'Revenue, expenses, tax & P&L logs', icon: DollarSign, path: '/accounts', color: 'from-emerald-500 to-green-600' },
      { id: 'INVENTORY', label: 'Equipment Assets', description: 'Gym machines, maintenance & inventory', icon: Barcode, path: '/inventory', color: 'from-cyan-500 to-blue-600' },
      { id: 'POS', label: 'POS Billing', description: 'Point of sale store checkout & products', icon: ShoppingCart, path: '/pos', color: 'from-orange-500 to-amber-600' },
    ],
  },
  {
    key: 'DASHBOARD',
    label: 'Overview & Portals',
    shortLabel: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Gym KPI performance metrics & member personal portal',
    items: [
      { id: 'DASHBOARD', label: 'Admin Dashboard', description: 'Gym KPIs, revenue & live active count', icon: LayoutDashboard, path: '/dashboard', color: 'from-blue-600 to-indigo-700' },
      { id: 'MEMBER_PORTAL', label: 'My Dashboard', description: 'Personal workouts, attendance & pass', icon: UserCheck, path: '/member-portal', color: 'from-emerald-600 to-teal-700' },
    ],
  },
  {
    key: 'WORKOUTS',
    label: 'Workouts & Nutrition',
    shortLabel: 'Workouts',
    icon: Dumbbell,
    description: 'Exercise library, group fitness timetables & meal plans',
    items: [
      { id: 'WORKOUT', label: 'Workouts & Exercises', description: 'Exercise routines & database builder', icon: Dumbbell, path: '/workouts', color: 'from-rose-500 to-red-600' },
      { id: 'ACTIVITY', label: 'Group Classes', description: 'Live timetable, class bookings & voting', icon: Calendar, path: '/activities', color: 'from-violet-500 to-purple-600' },
      { id: 'DIET', label: 'Diet & Nutrition', description: 'Meal plans, macros & calorie tracker', icon: Apple, path: '/diets', color: 'from-emerald-500 to-teal-600' },
    ],
  },
  {
    key: 'DESK',
    label: 'Front Desk & CRM',
    shortLabel: 'Desk',
    icon: Layers,
    description: 'Entrance gate check-in, marketing blasts, chat & CRM',
    items: [
      { id: 'ATTENDANCE', label: 'Entrance Desk', description: 'Fast QR check-in & member pass validation', icon: UserCheck, path: '/attendance', color: 'from-blue-500 to-teal-600' },
      { id: 'NOTIFICATIONS', label: 'Marketing Blasts', description: 'SMS, WhatsApp & email announcement blasts', icon: Send, path: '/notifications', color: 'from-indigo-500 to-blue-600' },
      { id: 'CHAT', label: 'Client Chat Hub', description: 'Direct messaging & trainer conversations', icon: MessageCircle, path: '/chat', color: 'from-teal-500 to-emerald-600' },
      { id: 'CRM', label: 'Lead CRM', description: 'Lead pipelines, trials & conversion stages', icon: UserPlus, path: '/crm', color: 'from-amber-500 to-orange-600' },
    ],
  },
];

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
  { id: 'WORKOUT', label: 'Workouts & Exercises', icon: Dumbbell, path: '/workouts' },
  { id: 'DIET', label: 'Diet & Nutrition', icon: Apple, path: '/diets' },
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
  const [activeMobileSheet, setActiveMobileSheet] = useState<MobileCategoryKey | null>(null);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Core global state matrices (initialized from local storage cache to prevent flash)
  const [org, setOrg] = useState<Organization>(() => {
    try {
      const saved = localStorage.getItem('gymos_org');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: '',
      name: 'GymOS Suite',
      phone: '',
      email: '',
      is_active: true,
    };
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [userProfile, setUserProfile] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('gymos_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  useEffect(() => {
    const fetchOrgAndUser = () => {
      Promise.all([getMyOrg(), getUserProfile()])
        .then(([orgData, userProfileData]) => {
          if (orgData) {
            setOrg(orgData);
            try { localStorage.setItem('gymos_org', JSON.stringify(orgData)); } catch {}
          }
          if (userProfileData) {
            setUserProfile(userProfileData);
            try { localStorage.setItem('gymos_user_profile', JSON.stringify(userProfileData)); } catch {}
          }
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
          try { localStorage.setItem('gymos_org', JSON.stringify(orgData)); } catch {}
        }
        if (userProfileData) {
          setUserProfile(userProfileData);
          try { localStorage.setItem('gymos_user_profile', JSON.stringify(userProfileData)); } catch {}
        }
      })
      .catch(err => console.error(err));

    window.addEventListener('gymos_org_updated', fetchOrgAndUser);
    return () => window.removeEventListener('gymos_org_updated', fetchOrgAndUser);
  }, []);

  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('gymos_permissions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem('gymos_role') || document.cookie.match(/(?:^|; )gymos_role=([^;]+)/)?.[1] || '';
  });

  const [isLoadingPermissions, setIsLoadingPermissions] = useState<boolean>(() => {
    const cachedRole = localStorage.getItem('gymos_role') || document.cookie.match(/(?:^|; )gymos_role=([^;]+)/)?.[1];
    return !cachedRole;
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const data = await getMyPermissions();
        if (data && data.permissions) {
          setUserPermissions(data.permissions);
          try { localStorage.setItem('gymos_permissions', JSON.stringify(data.permissions)); } catch {}
        }
        const cookieRole = document.cookie.match(/(?:^|; )gymos_role=([^;]+)/)?.[1];
        const localRole = localStorage.getItem('gymos_role');
        const apiRole = data?.role && data.role !== 'UNKNOWN' ? data.role : null;
        const resolvedRole = apiRole || cookieRole || localRole;

        if (!resolvedRole) {
          logout();
          navigate('/auth/login', { replace: true });
          return;
        }

        setUserRole(resolvedRole);
        try { localStorage.setItem('gymos_role', resolvedRole); } catch {}
      } catch (err) {
        console.error('Failed to fetch permissions', err);
        const hasExistingAuth = getStoredToken();
        if (!hasExistingAuth) {
          logout();
          navigate('/auth/login', { replace: true });
        }
      } finally {
        setIsLoadingPermissions(false);
      }
    };
    fetchPermissions();
  }, [navigate]);


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

    const moduleName = viewId.toLowerCase();
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

  const outletContext = useMemo(() => ({
    selectedBranchId,
    branches,
    triggerAnnouncement,
    permissions: userPermissions,
  }), [selectedBranchId, branches, triggerAnnouncement, userPermissions]);

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
          } shrink-0 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 border-r border-slate-200 dark:border-zinc-800 hidden md:flex flex-col justify-between transition-all duration-300 overflow-hidden relative z-40`}
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
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                        {org.name && org.name !== 'Loading...' ? org.name.substring(0, 2).toUpperCase() : 'GY'}
                      </div>
                    )}
                    <span className="font-black text-sm tracking-tight text-slate-900 dark:text-white truncate">
                      {org.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                    aria-label="Collapse Navigation Sidebar"
                    title="Collapse Sidebar"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="w-full flex items-center justify-center p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                  aria-label="Expand Navigation Sidebar"
                  title="Expand Sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* User Details Box in Sidebar */}
            {isSidebarOpen && (
              <div className="mx-3 mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {userProfile?.name ? userProfile.name.slice(0, 2).toUpperCase() : 'AA'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block truncate">
                      {userProfile?.name || 'User'}
                    </span>
                    {userProfile?.email && (
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate" title={userProfile.email}>
                        {userProfile.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation items list with hidden scrollbar */}
            <nav className="p-2.5 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)] text-xs font-semibold no-scrollbar">
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
          
          {/* Mobile Top Shortcut Bar (Shown exclusively on mobile & tablet viewports < md) */}
          <header className="md:hidden h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md flex items-center justify-between px-3 shrink-0 relative z-30">
            {/* Left: Branding & Branch Selector */}
            <div className="flex items-center gap-2 min-w-0">
              {org.logoUrl ? (
                <img src={org.logoUrl} alt="Logo" className="w-7 h-7 rounded-lg object-cover shadow-xs shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                  {org.name && org.name !== 'Loading...' ? org.name.substring(0, 2).toUpperCase() : 'GY'}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate leading-tight">
                  {org.name}
                </h1>
                {branches.length > 1 ? (
                  <select
                    value={selectedBranchId}
                    onChange={(e) => {
                      setSelectedBranchId(e.target.value);
                      const bName = e.target.value === 'ALL' ? 'All Branches' : branches.find(b => b.id === e.target.value)?.name || 'Branch';
                      triggerAnnouncement(`Switched view to ${bName}`);
                    }}
                    className="bg-transparent text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[120px] cursor-pointer focus:outline-none"
                    aria-label="Select gym branch"
                  >
                    <option value="ALL">All Branches</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-[10px] text-zinc-400 block truncate">
                    {branches.length === 1 ? branches[0].name : 'Main Hub'}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Mobile Shortcut Bar */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Shortcut 1: RBAC Matrix */}
              {isViewAllowed('RBAC') && (
                <button
                  onClick={() => {
                    navigate('/rbac');
                    triggerAnnouncement('Navigated to RBAC Roles Matrix');
                  }}
                  className={`p-2 rounded-xl border transition active:scale-95 ${
                    location.pathname === '/rbac'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  title="RBAC Roles Matrix"
                  aria-label="RBAC Roles Matrix"
                >
                  <Key className="w-4 h-4" />
                </button>
              )}

              {/* Shortcut 2: App Settings */}
              {isViewAllowed('SETTINGS') && (
                <button
                  onClick={() => {
                    navigate('/settings');
                    triggerAnnouncement('Navigated to Settings');
                  }}
                  className={`p-2 rounded-xl border transition active:scale-95 ${
                    location.pathname === '/settings'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  title="App Settings"
                  aria-label="App Settings"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
              )}

              {/* Shortcut 3: Theme Toggle */}
              <button
                onClick={toggleQuickTheme}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95"
                title={`Switch to ${a11y.theme === 'dark' || a11y.theme === 'high-contrast-dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle Theme"
              >
                {a11y.theme === 'dark' || a11y.theme === 'high-contrast-dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-600" />
                )}
              </button>

              {/* Shortcut 4: Live Chat Hub */}
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`p-2 rounded-xl border transition active:scale-95 relative ${
                  isChatOpen
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title="Live Chat Hub"
                aria-label="Toggle Live Chat"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
              </button>

              {/* Shortcut 5: Activity Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    if (!isNotificationsOpen) fetchNotifications();
                  }}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 relative transition active:scale-95"
                  title="Activity & System Notifications"
                  aria-label="Activity Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {activityNotifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="fixed sm:absolute right-2 sm:right-0 top-14 mt-1 w-[calc(100vw-1rem)] sm:w-96 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs">
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

              {/* Shortcut 5: Profile Trigger Button */}
              <button
                onClick={() => setIsMobileProfileOpen(true)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/20 active:scale-95 transition focus:outline-none shadow-xs shrink-0"
                title="User Profile & Account"
                aria-label="User Profile"
              >
                {userProfile?.name ? userProfile.name.slice(0, 2).toUpperCase() : 'AA'}
              </button>
            </div>
          </header>

          {/* Desktop Header Navbar (Shown exclusively on desktop >= md) */}
          <header className="hidden md:flex h-16 border-b border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/50 backdrop-blur-sm items-center justify-between px-6 shrink-0 relative z-30">
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
              
              {/* Chat Hub Launcher */}
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`p-2 rounded-lg border transition relative ${
                  isChatOpen
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
                title="Live Chat Hub"
                aria-label="Toggle Live Chat Hub"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
              </button>

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
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-28 md:pb-6 focus:outline-none" tabIndex={-1} aria-label="Main Viewport Area">
            {isAllowed ? (
              <div className="max-w-7xl mx-auto space-y-4">
                {/* Outlet for routes */}
                <Outlet context={outletContext} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                <ShieldAlert className="w-12 h-12 text-red-500" />
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">RESTRICTED ACCESS</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    Your role ({userRole ? userRole.replace(/_/g, ' ') : 'UNKNOWN'}) does not have view permission for this module. Ask your organization admin to grant it.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE SPECIFIC UI: Profile Drawer, Sub-Module Drawer, & Bottom Nav Bar  */}
        {/* ========================================================================= */}

        {/* Mobile Profile & Quick Settings Drawer Sheet */}
        {isMobileProfileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            <div
              onClick={() => setIsMobileProfileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-overlay"
            />
            <div className="relative bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl shadow-2xl p-5 safe-bottom max-h-[85vh] overflow-y-auto animate-slide-up-drawer z-10 text-xs">
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

              {/* User Identity Card */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                    {userProfile?.name ? userProfile.name.slice(0, 2).toUpperCase() : 'AA'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {userProfile?.name || 'Abhinav Admin'}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      {userProfile?.email || 'admin@gymos.com'}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                      {userRole ? userRole.replace(/_/g, ' ') : 'MEMBER'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileProfileOpen(false)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  aria-label="Close Profile Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Profile Navigation Actions */}
              <div className="py-4 space-y-2">
                <button
                  onClick={() => {
                    setIsMobileProfileOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-left flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs block group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        Edit Full Profile & Settings
                      </span>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        Personal info, notifications & security
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>

                {isViewAllowed('SETTINGS') && (
                  <button
                    onClick={() => {
                      setIsMobileProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-left flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <SettingsIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs block group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          Application Settings
                        </span>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          Gym business profile & system configuration
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>
                )}

                {isViewAllowed('RBAC') && (
                  <button
                    onClick={() => {
                      setIsMobileProfileOpen(false);
                      navigate('/rbac');
                    }}
                    className="w-full p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-left flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs block group-hover:text-amber-600 dark:group-hover:text-amber-400">
                          RBAC Roles & Matrix
                        </span>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          Role permissions & staff access matrix
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>
                )}
              </div>

              {/* Theme Selector Strip */}
              <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Theme Mode
                  </span>
                  <div className="flex bg-white dark:bg-zinc-900 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700">
                    <button
                      onClick={() => setA11y(prev => ({ ...prev, theme: 'light' }))}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                        a11y.theme === 'light'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setA11y(prev => ({ ...prev, theme: 'dark' }))}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                        a11y.theme === 'dark'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Logout Button Inside Profile */}
              <button
                onClick={() => {
                  setIsMobileProfileOpen(false);
                  handleLogout();
                }}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-2xl border border-red-200 dark:border-red-900/50 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Account</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Sub-Module Categorized Drawer Sheet */}
        {activeMobileSheet && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            <div
              onClick={() => setActiveMobileSheet(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-overlay"
            />
            <div className="relative bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl shadow-2xl p-5 safe-bottom max-h-[80vh] overflow-y-auto animate-slide-up-drawer z-10 text-xs">
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3" />

              {(() => {
                const cat = MOBILE_CATEGORIES.find(c => c.key === activeMobileSheet);
                if (!cat) return null;
                const CatIcon = cat.icon;
                const allowedSubItems = cat.items.filter(item => isViewAllowed(item.id));

                return (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                          <CatIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                            {cat.label}
                          </h3>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveMobileSheet(null)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        aria-label="Close Drawer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="py-3 space-y-2">
                      {allowedSubItems.length === 0 ? (
                        <div className="p-6 text-center text-zinc-400">
                          <ShieldAlert className="w-8 h-8 mx-auto text-amber-500 mb-2 opacity-60" />
                          <p className="font-bold text-zinc-700 dark:text-zinc-300 text-xs">No Authorized Modules</p>
                          <p className="text-[11px] mt-1">Your role does not have permission to access modules in this section.</p>
                        </div>
                      ) : (
                        allowedSubItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isActive = location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/');

                          return (
                            <button
                              key={subItem.id}
                              onClick={() => {
                                navigate(subItem.path);
                                setActiveMobileSheet(null);
                                triggerAnnouncement(`Navigated to ${subItem.label}`);
                              }}
                              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-95 group ${
                                isActive
                                  ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 ring-2 ring-blue-500/20'
                                  : 'bg-zinc-50/80 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${subItem.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                                  <SubIcon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-bold text-xs truncate ${
                                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100'
                                    }`}>
                                      {subItem.label}
                                    </span>
                                    {isActive && (
                                      <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-black">
                                        ACTIVE
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                    {subItem.description}
                                  </p>
                                </div>
                              </div>

                              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'
                              }`} />
                            </button>
                          );
                        })
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Mobile Bottom Categorized Navigation Bar (Fixed Bottom, md:hidden) */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 safe-bottom shadow-[0_-4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.6)]"
          aria-label="Mobile Bottom Navigation"
        >
          <div className="grid grid-cols-5 items-center px-1 py-1 relative">
            {MOBILE_CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              const isCenter = cat.key === 'DASHBOARD';
              const isCategoryActive = cat.items.some(item => location.pathname.startsWith(item.path));
              const isOpen = activeMobileSheet === cat.key;

              if (isCenter) {
                return (
                  <div key={cat.key} className="flex flex-col items-center justify-center relative -top-3">
                    <button
                      onClick={() => {
                        setActiveMobileSheet(isOpen ? null : cat.key);
                        triggerAnnouncement(`Toggled ${cat.label} Menu`);
                      }}
                      className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                        isOpen || isCategoryActive
                          ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white ring-4 ring-blue-500/30 shadow-blue-500/40 scale-105'
                          : 'bg-gradient-to-tr from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-200 text-white dark:text-zinc-900 ring-2 ring-zinc-200 dark:ring-zinc-800'
                      }`}
                      aria-label="Dashboard Overview Hub"
                    >
                      <CatIcon className="w-5 h-5" />
                    </button>
                    <span className={`text-[9px] font-extrabold tracking-tight mt-0.5 ${
                      isOpen || isCategoryActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {cat.shortLabel}
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={cat.key}
                  onClick={() => {
                    setActiveMobileSheet(isOpen ? null : cat.key);
                    triggerAnnouncement(`Toggled ${cat.label} Menu`);
                  }}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all active:scale-95 ${
                    isOpen || isCategoryActive
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                  aria-label={cat.label}
                >
                  <div className="relative">
                    <CatIcon className={`w-5 h-5 transition-transform ${isOpen ? 'scale-110' : ''}`} />
                    {(isOpen || isCategoryActive) && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    )}
                  </div>
                  <span className="text-[10px] mt-1 tracking-tight truncate max-w-full">
                    {cat.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Global Live Chat Widget (Triggered via Top Header Chat Buttons) */}
        <FloatingChatWidget
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          showFloatingButton={false}
          currentUserRole={userRole}
          onAnnounce={triggerAnnouncement}
        />

        {/* Profile Editing Modal */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userRole={userRole}
          onAnnounce={triggerAnnouncement}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
};
