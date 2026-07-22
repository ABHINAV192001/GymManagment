import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';

export async function getRoles() {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/rbac/roles`;
  const response = await fetchWithAuth(url);
  return response.data;
}

export async function getRoleById(roleId: string) {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/rbac/roles/${roleId}`;
  const response = await fetchWithAuth(url);
  return response.data;
}

export async function updateRolePermissions(roleId: string, permissions: string[]) {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/rbac/roles/${roleId}/permissions`;
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(permissions),
  });
  return response.data;
}

export async function getMyPermissions() {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/rbac/permissions/me`;
  const response = await fetchWithAuth(url);
  return response.data;
}

export async function getAllPermissions() {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/rbac/permissions`;
  const response = await fetchWithAuth(url);
  return response.data;
}

export async function createRole(role: { name: string; description?: string }) {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/rbac/roles`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(role),
  });
  return response.data;
}

export async function deleteRole(roleId: string) {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/rbac/roles/${roleId}`;
  const response = await fetchWithAuth(url, {
    method: 'DELETE',
  });
  return response.data;
}
