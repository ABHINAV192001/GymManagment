import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Shield, 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  X, 
  AlertTriangle,
  Search,
  CheckCircle2,
  Lock,
  RotateCcw,
  Sparkles,
  Layers,
  MapPin,
  Users,
  ShieldAlert,
  Award,
  DollarSign,
  Barcode,
  Calendar,
  Dumbbell,
  Apple,
  UserCheck,
  Send,
  MessageCircle,
  Key,
  Settings as SettingsIcon,
  UserPlus,
  ClipboardList,
  ShoppingCart,
  LayoutDashboard
} from 'lucide-react';

// API imports
import { getRoles, getRoleById, updateRolePermissions, getAllPermissions, createRole, deleteRole } from '../../lib/api/rbac';
import { usePermissions } from '../../lib/usePermissions';

// Canonical column order
const ACTION_ORDER = ['view', 'create', 'edit', 'delete', 'export', 'assign', 'send', 'bookspot', 'checkout', 'refund'];

// Friendly module metadata
const MODULE_METADATA: Record<string, { label: string; icon: React.ElementType; category: string; description: string }> = {
  dashboard: { label: 'Admin Dashboard', icon: LayoutDashboard, category: 'Overview', description: 'Gym KPIs, revenue, active members' },
  member_portal: { label: 'My Dashboard / Portal', icon: UserCheck, category: 'Overview', description: 'Member personal workout, logs & pass' },
  branches: { label: 'Branches', icon: MapPin, category: 'Organization', description: 'Locations and facility management' },
  users: { label: 'Members Directory', icon: Users, category: 'Operations', description: 'Member profiles and accounts' },
  staff: { label: 'Staff & Payroll', icon: ShieldAlert, category: 'Organization', description: 'Staff payroll, trainers and roles' },
  plans: { label: 'Membership Plans', icon: Award, category: 'Operations', description: 'Pricing tiers and subscriptions' },
  accounts: { label: 'Finance & Ledger', icon: DollarSign, category: 'Finance', description: 'Revenues, expenses, tax and ledger' },
  inventory: { label: 'Equipment Assets', icon: Barcode, category: 'Operations', description: 'Gym machines and hardware inventory' },
  activity: { label: 'Group Classes', icon: Calendar, category: 'Fitness', description: 'Classes, timetable schedule and bookings' },
  workout: { label: 'Workouts & Exercises', icon: Dumbbell, category: 'Fitness', description: 'Routines, exercise library and splits' },
  diet: { label: 'Diet & Nutrition', icon: Apple, category: 'Fitness', description: 'Meals, macros and nutrition tracking' },
  attendance: { label: 'Entrance Desk', icon: UserCheck, category: 'Front Desk', description: 'Member check-in & gate pass verification' },
  notifications: { label: 'Marketing Blasts', icon: Send, category: 'Engagement', description: 'SMS, WhatsApp and email announcements' },
  chat: { label: 'Client Chat Hub', icon: MessageCircle, category: 'Engagement', description: 'Direct messaging and trainer chat' },
  rbac: { label: 'RBAC Roles Matrix', icon: Key, category: 'Security', description: 'Role permissions and access security' },
  settings: { label: 'App Settings', icon: SettingsIcon, category: 'System', description: 'System configuration and branding' },
  crm: { label: 'Lead CRM', icon: UserPlus, category: 'Front Desk', description: 'Lead pipelines, trials and conversions' },
  roster: { label: 'Shift Roster', icon: ClipboardList, category: 'Organization', description: 'Staff rotation and shift schedules' },
  pos: { label: 'POS Billing', icon: ShoppingCart, category: 'Finance', description: 'Point of sale store checkout and sales' },
};

const ACTION_LABELS: Record<string, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  export: 'Export',
  assign: 'Assign',
  send: 'Send',
  bookspot: 'Book Spot',
  checkout: 'Checkout',
  refund: 'Refund',
};

export const RBAC: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ triggerAnnouncement: (msg: string) => void }>();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [roles, setRoles] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<Record<string, string[]>>({});
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [activeRolePermissions, setActiveRolePermissions] = useState<Record<string, string[]>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRoleDetails, setIsLoadingRoleDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Add / Delete Role Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [roleToDelete, setRoleToDelete] = useState<any | null>(null);
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);
  const [addRoleError, setAddRoleError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        getRoles(),
        getAllPermissions(),
      ]);
      const orgOwnedRoles = (rolesData || []).filter((r: any) => !(r.isSystem ?? r.system));
      setRoles(orgOwnedRoles);
      setCatalog((permissionsData && permissionsData.permissions) || {});
      if (orgOwnedRoles.length > 0) {
        setActiveRoleIndex(0);
        await loadRolePermissions(orgOwnedRoles[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load RBAC data from the server.');
      triggerAnnouncement('Error loading RBAC roles and permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRolePermissions = async (roleId: string) => {
    setIsLoadingRoleDetails(true);
    try {
      const roleDetails = await getRoleById(roleId);
      setActiveRolePermissions(roleDetails?.permissions || {});
      setIsDirty(false);
    } catch (err: any) {
      triggerAnnouncement(`Failed to load permissions for role: ${err.message}`);
    } finally {
      setIsLoadingRoleDetails(false);
    }
  };

  const handleSelectRole = async (index: number) => {
    if (isDirty && !window.confirm('You have unsaved permission changes. Switch role anyway?')) {
      return;
    }
    setActiveRoleIndex(index);
    if (roles[index]) {
      await loadRolePermissions(roles[index].id);
    }
  };

  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsSubmittingRole(true);
    setAddRoleError(null);
    try {
      const formattedName = newRoleName.trim().toUpperCase().replace(/\s+/g, '_');
      await createRole({ name: formattedName });
      triggerAnnouncement(`Role "${formattedName}" created successfully!`);
      setNewRoleName('');
      setIsAddModalOpen(false);
      
      // Refresh roles list
      const updatedRoles = await getRoles();
      const orgOwned = (updatedRoles || []).filter((r: any) => !(r.isSystem ?? r.system));
      setRoles(orgOwned);
      
      // Select the newly created role
      const newIndex = orgOwned.findIndex((r: any) => r.name === formattedName);
      if (newIndex >= 0) {
        setActiveRoleIndex(newIndex);
        await loadRolePermissions(orgOwned[newIndex].id);
      }
    } catch (err: any) {
      setAddRoleError(err.message || 'Failed to create role');
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const handleDeleteRoleConfirm = async () => {
    if (!roleToDelete) return;

    setIsSubmittingRole(true);
    try {
      await deleteRole(roleToDelete.id);
      triggerAnnouncement(`Role "${roleToDelete.name}" deleted successfully.`);
      setRoleToDelete(null);

      // Refresh roles list
      const updatedRoles = await getRoles();
      const orgOwned = (updatedRoles || []).filter((r: any) => !(r.isSystem ?? r.system));
      setRoles(orgOwned);

      if (orgOwned.length > 0) {
        setActiveRoleIndex(0);
        await loadRolePermissions(orgOwned[0].id);
      } else {
        setActiveRolePermissions({});
      }
    } catch (err: any) {
      triggerAnnouncement(`Failed to delete role: ${err.message}`);
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const MODULES = useMemo(() => {
    const rawMods = Object.keys(catalog);
    return rawMods.sort();
  }, [catalog]);

  const ACTIONS = useMemo(() => {
    const present = new Set<string>();
    Object.values(catalog).forEach((actions: string[]) => actions.forEach((a) => present.add(a.toLowerCase())));
    const ordered = ACTION_ORDER.filter((a) => present.has(a));
    present.forEach((a) => { if (!ordered.includes(a)) ordered.push(a); });
    return ordered;
  }, [catalog]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    MODULES.forEach((mod) => {
      const meta = MODULE_METADATA[mod.toLowerCase()];
      if (meta?.category) cats.add(meta.category);
    });
    return ['ALL', ...Array.from(cats).sort()];
  }, [MODULES]);

  const filteredModules = useMemo(() => {
    return MODULES.filter((mod) => {
      const lower = mod.toLowerCase();
      const meta = MODULE_METADATA[lower];
      const matchesSearch = 
        lower.includes(searchQuery.toLowerCase()) || 
        (meta?.label && meta.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (meta?.description && meta.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'ALL' || meta?.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [MODULES, searchQuery, selectedCategory]);

  const totalCatalogPermCount = useMemo(() => {
    let count = 0;
    Object.values(catalog).forEach((acts: string[]) => { count += acts.length; });
    return count;
  }, [catalog]);

  const activeRolePermCount = useMemo(() => {
    let count = 0;
    Object.entries(activeRolePermissions).forEach(([mod, acts]) => {
      const valid: string[] = catalog[mod] || [];
      (acts as string[]).forEach((a: string) => {
        if (valid.includes(a.toLowerCase())) count++;
      });
    });
    return count;
  }, [activeRolePermissions, catalog]);

  const activeRole = roles[activeRoleIndex];

  const handleTogglePermission = (module: string, action: string) => {
    if (!activeRole) return;

    const lowerModule = module.toLowerCase();
    const lowerAction = action.toLowerCase();

    const currentActions = activeRolePermissions[lowerModule] || [];
    let newActions: string[];

    if (currentActions.includes(lowerAction)) {
      newActions = currentActions.filter((a: string) => a !== lowerAction);
    } else {
      newActions = [...currentActions, lowerAction];
    }

    setActiveRolePermissions({
      ...activeRolePermissions,
      [lowerModule]: newActions,
    });
    setIsDirty(true);
  };

  // Grant / Revoke all for a specific module
  const handleToggleModuleAll = (module: string) => {
    if (!activeRole) return;
    const lowerModule = module.toLowerCase();
    const validActions = catalog[lowerModule] || [];
    const currentActions = activeRolePermissions[lowerModule] || [];

    const isAllSelected = validActions.length > 0 && validActions.every((act) => currentActions.includes(act));

    setActiveRolePermissions({
      ...activeRolePermissions,
      [lowerModule]: isAllSelected ? [] : [...validActions],
    });
    setIsDirty(true);
  };

  // Grant / Revoke specific action across all modules
  const handleToggleActionColumn = (action: string) => {
    if (!activeRole) return;
    const lowerAction = action.toLowerCase();

    // Check if all modules that support this action already have it enabled
    const supportedModules = MODULES.filter((m) => (catalog[m.toLowerCase()] || []).includes(lowerAction));
    const allHaveIt = supportedModules.length > 0 && supportedModules.every((m) => 
      (activeRolePermissions[m.toLowerCase()] || []).includes(lowerAction)
    );

    const updated = { ...activeRolePermissions };
    supportedModules.forEach((m) => {
      const modKey = m.toLowerCase();
      const cur = updated[modKey] || [];
      if (allHaveIt) {
        updated[modKey] = cur.filter((a) => a !== lowerAction);
      } else {
        if (!cur.includes(lowerAction)) {
          updated[modKey] = [...cur, lowerAction];
        }
      }
    });

    setActiveRolePermissions(updated);
    setIsDirty(true);
  };

  // Preset: Grant Everything
  const handlePresetGrantAll = () => {
    if (!activeRole) return;
    const updated: Record<string, string[]> = {};
    Object.entries(catalog).forEach(([mod, acts]) => {
      updated[mod] = [...(acts as string[])];
    });
    setActiveRolePermissions(updated);
    setIsDirty(true);
  };

  // Preset: Read Only
  const handlePresetReadOnly = () => {
    if (!activeRole) return;
    const updated: Record<string, string[]> = {};
    Object.entries(catalog).forEach(([mod, acts]) => {
      if ((acts as string[]).includes('view')) {
        updated[mod] = ['view'];
      } else {
        updated[mod] = [];
      }
    });
    setActiveRolePermissions(updated);
    setIsDirty(true);
  };

  // Preset: Clear All
  const handlePresetClearAll = () => {
    if (!activeRole) return;
    const updated: Record<string, string[]> = {};
    Object.keys(catalog).forEach((mod) => {
      updated[mod] = [];
    });
    setActiveRolePermissions(updated);
    setIsDirty(true);
  };

  const handleSaveChanges = async () => {
    if (!activeRole) return;
    setIsSaving(true);
    try {
      const flatPermissions: string[] = [];
      Object.entries(activeRolePermissions).forEach(([module, actions]) => {
        (actions as string[]).forEach((act) => {
          flatPermissions.push(`${module}:${act}`);
        });
      });

      await updateRolePermissions(activeRole.id, flatPermissions);
      
      setIsDirty(false);
      triggerAnnouncement(`RBAC Privileges for ${activeRole.name} updated successfully.`);
    } catch (err: any) {
      triggerAnnouncement(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p className="font-semibold text-sm">Loading Access Matrix & Permission Registry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl text-red-600 dark:text-red-400">
        <h3 className="font-bold mb-2">Error Loading RBAC</h3>
        <p>{error}</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/60 font-semibold transition">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
            <h1 className="text-xl font-black tracking-tight">Granular RBAC Security Matrix</h1>
          </div>
          <p className="text-xs text-blue-100 max-w-2xl">
            Configure A-to-Z permissions across all 19 GymOS modules. Manage precisely what each role can view, create, edit, delete, export, or execute.
          </p>
        </div>

        {activeRole && canEdit('rbac') && isDirty && (
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition text-xs shrink-0 self-start md:self-auto animate-pulse"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            {isSaving ? 'Saving Matrix...' : 'Save Matrix Changes'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-xs">
        {/* Sidebar Role Select */}
        <div className="xl:col-span-1 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Operational Roles</span>
            {canCreate('rbac') && (
              <button
                onClick={() => {
                  setNewRoleName('');
                  setAddRoleError(null);
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100"
              >
                <Plus className="w-3.5 h-3.5" /> Add Role
              </button>
            )}
          </div>
          
          <div className="space-y-1.5">
            {roles.map((r, index) => (
              <div
                key={r.id || r.name}
                className={`group flex items-center justify-between w-full p-3 rounded-xl text-left transition cursor-pointer ${
                  activeRoleIndex === index
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900/60 shadow-sm'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                }`}
                onClick={() => handleSelectRole(index)}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Shield className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="truncate">{r.name.replace(/_/g, ' ')}</span>
                </div>
                {canDelete('rbac') && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRoleToDelete(r);
                    }}
                    title="Delete Role"
                    className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            {roles.length === 0 && (
              <div className="text-zinc-500 italic p-4 text-center">No operational roles found.</div>
            )}
          </div>
        </div>

        {/* Permissions Matrix grid table */}
        <div className="xl:col-span-3 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between space-y-4">
          {activeRole ? (
            <div className="space-y-4">
              {/* Active Role Control Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-850">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base flex items-center gap-2">
                      <Key className="w-4 h-4 text-blue-500" />
                      {activeRole.name.replace(/_/g, ' ')}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                      {activeRolePermCount} / {totalCatalogPermCount} Privileges Active
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">Toggle granular privileges per module. Changes take effect on staff upon saving.</p>
                </div>

                {/* Preset Quick Actions */}
                {canEdit('rbac') && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handlePresetGrantAll}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-[11px] transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" /> Grant All
                    </button>
                    <button
                      type="button"
                      onClick={handlePresetReadOnly}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-[11px] transition flex items-center gap-1"
                    >
                      <Lock className="w-3 h-3 text-blue-500" /> Read Only
                    </button>
                    <button
                      type="button"
                      onClick={handlePresetClearAll}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-[11px] transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3 text-rose-500" /> Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search modules..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {isLoadingRoleDetails ? (
                <div className="flex items-center justify-center h-48 text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2 text-blue-500" /> Loading permissions for {activeRole.name}...
                </div>
              ) : (
                <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 font-bold uppercase text-[10px]">
                        <th className="p-3.5 min-w-[220px]">Module Context</th>
                        {ACTIONS.map((act) => (
                          <th key={act} className="p-3 text-center min-w-[70px]">
                            {canEdit('rbac') ? (
                              <button
                                type="button"
                                onClick={() => handleToggleActionColumn(act)}
                                title={`Toggle all ${act} permissions`}
                                className="hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-wider font-bold transition"
                              >
                                {ACTION_LABELS[act] || act}
                              </button>
                            ) : (
                              <span>{ACTION_LABELS[act] || act}</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                      {filteredModules.map((mod) => {
                        const lowerMod = mod.toLowerCase();
                        const meta = MODULE_METADATA[lowerMod];
                        const Icon = meta?.icon || Layers;
                        const allowedActions = activeRolePermissions[lowerMod] || [];
                        const validActionsForModule = catalog[lowerMod] || [];
                        const isAllModuleGranted = validActionsForModule.length > 0 && validActionsForModule.every((act) => allowedActions.includes(act));

                        return (
                          <tr key={mod} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition">
                            <td className="p-3.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                                      {meta?.label || mod}
                                    </div>
                                    <div className="text-[10px] text-zinc-400 truncate max-w-[200px]">
                                      {meta?.description || mod}
                                    </div>
                                  </div>
                                </div>

                                {canEdit('rbac') && validActionsForModule.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleModuleAll(mod)}
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition ${
                                      isAllModuleGranted 
                                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300' 
                                        : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                    }`}
                                  >
                                    {isAllModuleGranted ? 'All' : 'Toggle'}
                                  </button>
                                )}
                              </div>
                            </td>
                            {ACTIONS.map((act) => {
                              const lowerAct = act.toLowerCase();
                              const existsInCatalog = validActionsForModule.includes(lowerAct);
                              const isAllowed = allowedActions.includes(lowerAct);

                              if (!existsInCatalog) {
                                return <td key={act} className="p-3 text-center text-zinc-300 dark:text-zinc-700 text-xs">—</td>;
                              }

                              return (
                                <td key={act} className="p-3 text-center">
                                  {canEdit('rbac') ? (
                                    <button
                                      type="button"
                                      onClick={() => handleTogglePermission(mod, act)}
                                      className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 inline-flex items-center justify-center focus:outline-2 focus:outline-blue-500 transition"
                                      aria-label={`Toggle ${act} privilege for ${mod} module`}
                                    >
                                      {isAllowed ? (
                                        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                      ) : (
                                        <Square className="w-5 h-5 text-zinc-300 dark:text-zinc-700 hover:text-zinc-400 shrink-0" />
                                      )}
                                    </button>
                                  ) : (
                                    <div className="p-1 inline-flex items-center justify-center">
                                      {isAllowed ? (
                                        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 opacity-70" />
                                      ) : (
                                        <Square className="w-5 h-5 text-zinc-300 dark:text-zinc-700 shrink-0 opacity-70" />
                                      )}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-zinc-400">
              Select an operational role on the left to configure permissions
            </div>
          )}
        </div>

        {/* Add New Role Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="add-role-modal-heading" onClick={() => setIsAddModalOpen(false)}>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex justify-between items-center pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 id="add-role-modal-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">
                      Create New Operational Role
                    </h3>
                  </div>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {addRoleError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl">
                    {addRoleError}
                  </div>
                )}

                <form onSubmit={handleCreateRoleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">
                      Role Identifier Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TRAINER, FRONT_DESK, MANAGER"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">
                      Role names are automatically formatted to uppercase (e.g. FRONT_DESK).
                    </p>
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingRole || !newRoleName.trim()}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-sm shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {isSubmittingRole && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isSubmittingRole ? 'Creating...' : 'Create Role'}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        )}

        {/* Delete Role Confirmation Modal */}
        {roleToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="delete-role-dialog-heading" onClick={() => setRoleToDelete(null)}>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 text-center space-y-6" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 id="delete-role-dialog-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-base">
                      Delete Operational Role
                    </h3>
                    <p className="text-xs text-zinc-500">This will revoke this role from all assigned staff.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-xs text-red-800 dark:text-red-300">
                  Are you sure you want to delete role <strong className="font-bold">{roleToDelete.name}</strong>?
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRoleToDelete(null)}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteRoleConfirm}
                    disabled={isSubmittingRole}
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition text-xs shadow-sm shadow-red-500/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmittingRole && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmittingRole ? 'Deleting...' : 'Yes, Delete Role'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
