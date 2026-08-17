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
  let permissions: PermissionMap = ctx?.permissions ?? {};

  // If ctx?.permissions is empty or null, fallback to localStorage cached permissions
  if (!permissions || Object.keys(permissions).length === 0) {
    try {
      const saved = localStorage.getItem('gymos_permissions');
      if (saved) {
        permissions = JSON.parse(saved);
      }
    } catch {}
  }

  /**
   * Check whether the current user has `action` on `module`.
   * Evaluates permissions strictly against the loaded permission map.
   * Super/Org Admins bypass RBAC.
   */
  const can = (module: string, action: string): boolean => {
    const role = (
      localStorage.getItem('gymos_role') ||
      document.cookie.match(/(?:^|; )gymos_role=([^;]+)/)?.[1] ||
      ''
    ).toUpperCase();

    if (
      role === 'ADMIN' ||
      role === 'ORGANIZATION_ADMIN' ||
      role === 'ORG_ADMIN' ||
      role === 'SUPER_ADMIN'
    ) {
      return true;
    }

    const allowed = permissions?.[module.toLowerCase()] ?? [];
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
  const canCheckout = (module: string) => can(module, 'checkout');
  const canRefund = (module: string) => can(module, 'refund');

  return {
    can,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    canAssign,
    canSend,
    canBookSpot,
    canCheckout,
    canRefund,
    permissions,
  };
}

