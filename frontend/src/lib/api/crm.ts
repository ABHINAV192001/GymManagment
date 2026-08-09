import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';

const BASE = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/leads`;

export interface Lead {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  source?: string;
  status: 'NEW' | 'FOLLOW_UP' | 'CONVERTED';
  notes?: string;
  orgId?: string;
  branchId?: string;
  createdAt?: string;
}

export async function getLeadsByOrg(orgId: string): Promise<Lead[]> {
  const res = await fetchWithAuth(`${BASE}/org/${orgId}`);
  return Array.isArray(res) ? res : (res.data || []);
}

export async function getLeadsByBranch(branchId: string): Promise<Lead[]> {
  const res = await fetchWithAuth(`${BASE}/branch/${branchId}`);
  return Array.isArray(res) ? res : (res.data || []);
}

export async function createLead(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> {
  const res = await fetchWithAuth(BASE, {
    method: 'POST',
    body: JSON.stringify(lead),
  });
  return res.data || res;
}

export async function updateLead(id: string, lead: Partial<Lead>): Promise<Lead> {
  const res = await fetchWithAuth(`${BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(lead),
  });
  return res.data || res;
}

export async function deleteLead(id: string): Promise<void> {
  await fetchWithAuth(`${BASE}/${id}`, { method: 'DELETE' });
}
