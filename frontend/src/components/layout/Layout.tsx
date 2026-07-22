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
  Menu,
  LogOut,
  Building2,
} from 'lucide-react';

import {
  Organization,
  Branch,
  AccessibilitySettings,
} from '../../types';
import { getAdminBranches } from '../../lib/api/admin';

import { A11yControls } from '../A11yControls';
import { logout } from '../../lib/api/auth';
import { getMyPermissions } from '../../lib/api/rbac';

// Simple placeholder icon components to prevent compile errors
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
];

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Core global state matrices
  const [org, setOrg] = useState<Organization>({
    id: 'org-1',
    name: 'FitLife Health Clubs Pvt Ltd',
    slug: 'fitlife',
    phone: '9999999999',
    email: 'corporate@fitlife.com',
    gstin: '27AAACF8912C1ZS',
    subscriptionTier: 'PRO',
    is_active: true,
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    getAdminBranches()
      .then(data => {
        const branchList = data || [];
        setBranches(branchList);
        if (branchList.length === 1) {
          setSelectedBranchId(branchList[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');



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
        // Role name is free-form (org admins can create roles like "abc"), so take it
        // from the API and fall back to the role cookie set at login.
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

  // Accessibility State Tracker
  const [a11y, setA11y] = useState<AccessibilitySettings>({
    theme: 'dark',
    fontSize: 'base',
    dyslexicFont: false,
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

  // Keyboard accessibility listeners (Alt + keys)
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
  }, [navigate]);

  // Access is purely permission-driven: a module is visible iff the caller holds
  // its MODULE:VIEW permission. Role names are never checked - they are user data.
  const isViewAllowed = (viewId: string) => {
    // Staff & Payroll has no permission module of its own; it manages users.
    const moduleName = (viewId === 'STAFF' ? 'USERS' : viewId).toLowerCase();
    const allowed = userPermissions[moduleName] || [];
    return allowed.some(action => action.toLowerCase() === 'view');
  };

  // Find active nav item to get title
  const activeItem = navItems.find(item => location.pathname.startsWith(item.path)) || navItems[0];
  const isAllowed = isViewAllowed(activeItem.id);

  if (isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-[#fafafa] font-sans selection:bg-blue-500/30 transition-colors duration-200">
      
      {/* Top Accessibility Voice Announcer banner */}
      <div className="sr-only" aria-live="assertive" role="status">
        {announcements[announcements.length - 1]}
      </div>

      {/* Main Grid container */}
      <div className="flex h-screen overflow-hidden">
        
        {/* Sidebar Nav section */}
        <aside
          className={`${
            isSidebarOpen ? 'w-64' : 'w-0'
          } shrink-0 bg-zinc-900 border-r dark:border-zinc-800 border-zinc-200 flex flex-col justify-between transition-all duration-200 overflow-hidden relative z-40`}
          aria-label="Primary Workspace Navigation"
        >
          <div>
            {/* Branding Logo */}
            <div className="p-5 border-b dark:border-zinc-800 border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-inner">
                  G
                </div>
                <h1 className="text-zinc-50 font-extrabold text-sm tracking-tight">GymOS Pro</h1>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 xl:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close Navigation Sidebar"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Role scope indicator */}
            <div className="p-3 bg-zinc-950 border-b dark:border-zinc-800 border-zinc-200 text-[10px] text-zinc-400 font-mono tracking-wider flex justify-between items-center">
              <span>SCOPE:</span>
              <span className="font-bold text-blue-400 bg-blue-950/20 px-1.5 py-0.5 rounded uppercase">
                {userRole.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Nav items list */}
            <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] text-xs font-semibold">
              {navItems.map((item) => {
                const IconComp = item.icon;
                const isSelected = location.pathname.startsWith(item.path);
                const permitted = isViewAllowed(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (permitted) {
                        navigate(item.path);
                        triggerAnnouncement(`Switched screen to ${item.label}`);
                      } else {
                        triggerAnnouncement(`Access Denied: You do not have permission to view ${item.label}.`);
                      }
                    }}
                    disabled={!permitted}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg transition text-left ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/20'
                        : permitted
                        ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                        : 'opacity-30 cursor-not-allowed text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComp className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {isSelected && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t dark:border-zinc-800 border-zinc-200 text-center text-[9px] text-zinc-500 font-mono">
            V1.0.4-LATEST
          </div>
        </aside>

        {/* Primary Content panel wrapper */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Header toolbar banner */}
          <header className="h-16 border-b border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 relative z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle Navigation Panel"
              >
                <Menu className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs">
                {/* Org details selector */}
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{org.name}</span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                {branches.length > 1 ? (
                  <select
                    value={selectedBranchId}
                    onChange={(e) => {
                      setSelectedBranchId(e.target.value);
                      const bName = e.target.value === 'ALL' ? 'All Branches' : branches.find(b => b.id === e.target.value)?.name || 'Branch';
                      triggerAnnouncement(`Switched view to ${bName}`);
                    }}
                    className="bg-transparent text-zinc-600 dark:text-zinc-400 font-semibold border-none focus:outline-none focus:ring-0 p-0 pr-6 text-xs cursor-pointer"
                    aria-label="Filter application views by branch"
                  >
                    <option value="ALL">All Branches</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-semibold text-xs opacity-90 cursor-not-allowed select-none">
                    <Building2 className="w-3 h-3 text-blue-500" />
                    {branches.length === 1 ? branches[0].name : 'Primary Branch'}
                  </span>
                )}
              </div>
            </div>

            {/* Multi-Tenant Perspective Switcher & Accessibility panel */}
            <div className="flex items-center gap-3">
              


              {/* Accessibility Settings block widget */}
              <A11yControls
                settings={a11y}
                onChange={setA11y}
              />

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
                <Outlet context={{ selectedBranchId, triggerAnnouncement }} />

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

      </div>
    </div>
  );
};
