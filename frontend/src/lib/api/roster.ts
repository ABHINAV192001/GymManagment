import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';

const BASE = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/shifts`;

export interface StaffShiftStaff {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  userCode?: string;
  staffCode?: string;
  role?: string;
  branch?: { id: string; name: string };
}

export interface StaffShift {
  id?: string;
  staff?: StaffShiftStaff;
  startTime: string;
  endTime: string;
  taskDescription?: string;
  orgId?: string;
  branchId?: string;
  createdAt?: string;
}

export interface CreateShiftRequest {
  staff: { id: string };
  startTime: string;
  endTime: string;
  taskDescription?: string;
  orgId?: string;
  branchId?: string;
}

export async function getShiftsByOrg(orgId: string): Promise<StaffShift[]> {
  const res = await fetchWithAuth(`${BASE}/org/${orgId}`);
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export async function getShiftsByOrgAndMonth(
  orgId: string,
  year: number,
  month: number
): Promise<StaffShift[]> {
  const res = await fetchWithAuth(`${BASE}/org/${orgId}/month?year=${year}&month=${month}`);
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export async function getShiftsByOrgAndDateRange(
  orgId: string,
  from: string,
  to: string
): Promise<StaffShift[]> {
  const res = await fetchWithAuth(`${BASE}/org/${orgId}/range?from=${from}&to=${to}`);
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export async function getShiftsByBranch(branchId: string): Promise<StaffShift[]> {
  const res = await fetchWithAuth(`${BASE}/branch/${branchId}`);
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

export async function createShift(shift: CreateShiftRequest): Promise<StaffShift> {
  const res = await fetchWithAuth(BASE, {
    method: 'POST',
    body: JSON.stringify(shift),
  });
  return res?.data || res;
}

export async function updateShift(id: string, shift: Partial<CreateShiftRequest>): Promise<StaffShift> {
  const res = await fetchWithAuth(`${BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(shift),
  });
  return res?.data || res;
}

export async function deleteShift(id: string): Promise<void> {
  await fetchWithAuth(`${BASE}/${id}`, { method: 'DELETE' });
}
