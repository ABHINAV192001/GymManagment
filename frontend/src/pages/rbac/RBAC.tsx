import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Shield, ShieldCheck, CheckSquare, Square, Save, Loader2, Plus, Trash2, X, AlertTriangle } from 'lucide-react';

// API imports
import { getRoles, getRoleById, updateRolePermissions, getAllPermissions, createRole, deleteRole } from '../../lib/api/rbac';

// Canonical column order
const ACTION_ORDER = ['view', 'create', 'edit', 'delete', 'assign', 'export', 'send'];

export const RBAC: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ triggerAnnouncement: (msg: string) => void }>();
  const [roles, setRoles] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<Record<string, string[]>>({});
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [activeRolePermissions, setActiveRolePermissions] = useState<Record<string, string[]>>({});
  const [isDirty, setIsDirty] = useState(false);

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

  const MODULES = useMemo(() => Object.keys(catalog).sort(), [catalog]);
  const ACTIONS = useMemo(() => {
    const present = new Set<string>();
    Object.values(catalog).forEach((actions: string[]) => actions.forEach((a) => present.add(a)));
    const ordered = ACTION_ORDER.filter((a) => present.has(a));
    present.forEach((a) => { if (!ordered.includes(a)) ordered.push(a); });
    return ordered;
  }, [catalog]);

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
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading Access Matrix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400">
        <h3 className="font-bold mb-2">Error Loading RBAC</h3>
        <p>{error}</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 font-semibold transition">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 text-xs">
      {/* Sidebar Role Select */}
      <div className="xl:col-span-1 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Operational Roles</span>
          <button
            onClick={() => {
              setNewRoleName('');
              setAddRoleError(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <Plus className="w-3.5 h-3.5" /> Add Role
          </button>
        </div>
        
        <div className="space-y-1.5">
          {roles.map((r, index) => (
            <div
              key={r.id || r.name}
              className={`group flex items-center justify-between w-full p-2.5 rounded-lg text-left transition cursor-pointer ${
                activeRoleIndex === index
                  ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900/50'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
              }`}
              onClick={() => handleSelectRole(index)}
            >
              <div className="flex items-center gap-2 truncate">
                <Shield className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">{r.name.replace(/_/g, ' ')}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRoleToDelete(r);
                }}
                title="Delete Role"
                className="p-1 text-zinc-400 hover:text-red-500 rounded transition opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {roles.length === 0 && (
             <div className="text-zinc-500 italic p-3 text-center">No roles available</div>
          )}
        </div>
      </div>

      {/* Permissions Matrix grid table */}
      <div className="xl:col-span-3 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between">
        {activeRole ? (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-900/50 gap-2">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-500" /> Granular Module Permissions: {activeRole.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Toggle checkboxes to immediately alter what operators can read, create, edit, or delete.</p>
              </div>

              {isDirty && (
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded shadow transition text-xs"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                  {isSaving ? 'Saving...' : 'Save Access Matrix'}
                </button>
              )}
            </div>

            {isLoadingRoleDetails ? (
              <div className="flex items-center justify-center h-48 text-zinc-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading permissions for {activeRole.name}...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 font-bold uppercase text-[10px]">
                      <th className="p-3">Module Context</th>
                      {ACTIONS.map((act) => (
                        <th key={act} className="p-3 text-center">{act}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {MODULES.map((mod) => {
                      const lowerMod = mod.toLowerCase();
                      const allowedActions = activeRolePermissions[lowerMod] || [];
                      const validActionsForModule = catalog[lowerMod] || [];

                      return (
                        <tr key={mod} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                          <td className="p-3 font-bold text-zinc-800 dark:text-zinc-200 font-mono text-[10px]">{mod}</td>
                          {ACTIONS.map((act) => {
                            const lowerAct = act.toLowerCase();
                            const existsInCatalog = validActionsForModule.includes(lowerAct);
                            const isAllowed = allowedActions.includes(lowerAct);

                            if (!existsInCatalog) {
                              return <td key={act} className="p-3 text-center text-zinc-200 dark:text-zinc-800">—</td>;
                            }

                            return (
                              <td key={act} className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleTogglePermission(mod, act)}
                                  className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-850 inline-block focus:outline-2 focus:outline-blue-500"
                                  aria-label={`Toggle ${act} privilege for ${mod} module`}
                                >
                                  {isAllowed ? (
                                    <CheckSquare className="w-5 h-5 text-blue-500 shrink-0" />
                                  ) : (
                                    <Square className="w-5 h-5 text-zinc-300 dark:text-zinc-700 shrink-0" />
                                  )}
                                </button>
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
          <div className="flex items-center justify-center h-full text-zinc-500">
            Select a role to view permissions
          </div>
        )}
      </div>

      {/* Add New Role Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="add-role-modal-heading">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAddModalOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
              
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
                    Role names are automatically converted to uppercase format (e.g. FRONT_DESK).
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
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="delete-role-dialog-heading">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setRoleToDelete(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
              
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
  );
};

