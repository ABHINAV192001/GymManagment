import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';

const BASE = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/shifts`;

export interface StaffShift {
  id?: string;
  staff?: { id: string; name?: string };
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
  return res.json();
}

export async function getShiftsByBranch(branchId: string): Promise<StaffShift[]> {
  const res = await fetchWithAuth(`${BASE}/branch/${branchId}`);
  return res.json();
}

export async function createShift(shift: CreateShiftRequest): Promise<StaffShift> {
  const res = await fetchWithAuth(BASE, {
    method: 'POST',
    body: JSON.stringify(shift),
  });
  return res.json();
}

export async function updateShift(id: string, shift: Partial<CreateShiftRequest>): Promise<StaffShift> {
  const res = await fetchWithAuth(`${BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(shift),
  });
  return res.json();
}

export async function deleteShift(id: string): Promise<void> {
  await fetchWithAuth(`${BASE}/${id}`, { method: 'DELETE' });
}
