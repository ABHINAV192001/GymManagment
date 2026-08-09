import { getMyPermissions } from './api/rbac';

/**
 * Determines the primary landing page (e.g. "My Dashboard" / Member Portal vs "Dashboard")
 * based on user role and module permissions.
 *
 * - If the user has permission for "My Dashboard" (Member Portal), redirect to /member-portal.
 * - If the user has permission for "Dashboard", redirect to /dashboard.
 * - Dynamic fallback based on roles & permissions for any logged-in role.
 */
export function getPrimaryDashboardPath(
  role?: string | null,
  permissions?: Record<string, string[]> | null
): string {
  const normRole = (role || '').toUpperCase().replace(/^ROLE_/, '');

  // Members always default to /member-portal ("My Dashboard")
  if (normRole === 'MEMBER') {
    return '/member-portal';
  }

  const perms = permissions || {};

  const hasViewPermission = (moduleName: string) => {
    const actions = perms[moduleName.toLowerCase()] || [];
    return actions.some((act: string) => act.toLowerCase() === 'view');
  };

  const hasMemberPortalPermission =
    normRole === 'MEMBER' ||
    hasViewPermission('member_portal') ||
    hasViewPermission('member_dashboard') ||
    hasViewPermission('my_dashboard');

  const hasAdminDashboardPermission =
    normRole === 'ORG_ADMIN' ||
    normRole === 'ADMIN' ||
    hasViewPermission('dashboard');

  // If user only has Member Portal / My Dashboard permission
  if (hasMemberPortalPermission && !hasAdminDashboardPermission) {
    return '/member-portal';
  }

  // If user has Admin Dashboard permission
  if (hasAdminDashboardPermission) {
    return '/dashboard';
  }

  // Fallback to Member Portal if permitted
  if (hasMemberPortalPermission) {
    return '/member-portal';
  }

  return '/dashboard';
}

/**
 * Fetches current user permissions & role, returning the primary redirect path upon login.
 */
export async function getRedirectPathForUser(): Promise<string> {
  try {
    const data = await getMyPermissions();
    const cookieRole = document.cookie.match(/(?:(?:^|.*;\s*)gymos_role\s*=\s*([^;]*).*$)|^.*$/)?.[1];
    const role = data?.role && data.role !== 'UNKNOWN' ? data.role : cookieRole;
    return getPrimaryDashboardPath(role, data?.permissions);
  } catch (error) {
    console.error('Failed to fetch permissions for login redirect:', error);
    const cookieRole = document.cookie.match(/(?:(?:^|.*;\s*)gymos_role\s*=\s*([^;]*).*$)|^.*$/)?.[1];
    if (cookieRole === 'MEMBER') {
      return '/member-portal';
    }
    return '/dashboard';
  }
}
