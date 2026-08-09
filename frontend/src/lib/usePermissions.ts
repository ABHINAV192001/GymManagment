/**
 * usePermissions — central RBAC permission utility hook.
 *
 * Usage inside any page component:
 *   const { can } = usePermissions();
 *   can('plans', 'create')   // → true | false
 *   can('activity', 'delete')
 *
 * The `permissions` map comes from the Layout outlet context so we never
 * re-fetch per page — it is loaded once on Layout mount.
 */
import { useOutletContext } from 'react-router-dom';

export type PermissionMap = Record<string, string[]>;

export type LayoutContext = {
  selectedBranchId: string;
  triggerAnnouncement: (msg: string) => void;
  permissions: PermissionMap;
};

/**
 * Returns a `can(module, action)` helper, plus the raw permissions map.
 *
 * Module names match the keys returned by GET /api/v1/rbac/permissions/me:
 *   users | inventory | workout | accounts | rbac | activity | chat |
 *   branches | notifications | dashboard | attendance | plans | diet | settings
 *
 * Action values: view | create | edit | delete | export | assign | send | bookspot
 */
export function usePermissions() {
  const ctx = useOutletContext<LayoutContext>();
  const permissions: PermissionMap = ctx?.permissions ?? {};

  /**
   * Check whether the current user has `action` on `module`.
   * Always returns true if permissions haven't loaded yet (fail-open during
   * the brief loading window; the Layout already shows a spinner then).
   */
  const can = (module: string, action: string): boolean => {
    const allowed = permissions[module.toLowerCase()] ?? [];
    return allowed.map(a => a.toLowerCase()).includes(action.toLowerCase());
  };

  /** True if the user can VIEW the module at all */
  const canView = (module: string) => can(module, 'view');
  const canCreate = (module: string) => can(module, 'create');
  const canEdit = (module: string) => can(module, 'edit');
  const canDelete = (module: string) => can(module, 'delete');
  const canExport = (module: string) => can(module, 'export');
  const canAssign = (module: string) => can(module, 'assign');
  const canSend = (module: string) => can(module, 'send');
  const canBookSpot = (module: string) => can(module, 'bookspot');

  return { can, canView, canCreate, canEdit, canDelete, canExport, canAssign, canSend, canBookSpot, permissions };
}
