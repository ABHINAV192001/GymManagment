import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';

const BASE_URL = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/attendance`;

// Backend takes an AttendanceLog body keyed by entityId/entityType, not a bare userId.
export async function checkIn(entityId: string, branchId?: string, entityType: 'USER' | 'STAFF' = 'USER'): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/checkin`, {
    method: 'POST',
    body: JSON.stringify({ entityId, entityType, branchId, method: 'MANUAL' }),
  });
  return response.data;
}

// Backend takes entityId as a query param, not a JSON body.
export async function checkOut(entityId: string): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/checkout?entityId=${entityId}`, {
    method: 'POST',
  });
  return response.data;
}

export async function getTodayAttendance(): Promise<any[]> {
  const response = await fetchWithAuth(`${BASE_URL}/today`);
  return response.data || [];
}

export async function getAttendanceReport(): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/report`);
  return response.data;
}
