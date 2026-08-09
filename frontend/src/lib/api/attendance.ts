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

export async function qrScan(userId: string, qrData: string): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/qr-scan`, {
    method: 'POST',
    body: JSON.stringify({ userId, qrData }),
  });
  return response.data;
}

export async function getTodayAttendance(): Promise<any[]> {
  const response = await fetchWithAuth(`${BASE_URL}/today`);
  const payload = response.data;
  if (payload && Array.isArray(payload.content)) {
    return payload.content;
  }
  return Array.isArray(payload) ? payload : [];
}

export async function getAttendanceReport(): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/report`);
  return response.data;
}

export async function getUserAttendance(userId: string): Promise<{ logs: any[]; totalElements: number }> {
  const response = await fetchWithAuth(`${BASE_URL}/user/${userId}`);
  const payload = response.data;
  if (payload && Array.isArray(payload.data)) {
    return {
      logs: payload.data,
      totalElements: payload.pagination?.totalElements ?? payload.data.length,
    };
  }
  if (Array.isArray(payload)) {
    return { logs: payload, totalElements: payload.length };
  }
  return { logs: [], totalElements: 0 };
}

export async function generateBranchQr(branchId: string): Promise<string> {
  const response = await fetchWithAuth(`${BASE_URL}/branch-qr/${branchId}`);
  return response.data;
}

export interface AttendanceSearchParams {
  branchId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  search?: string | null;
  page?: number;
  size?: number;
}

export async function searchAttendance(params: AttendanceSearchParams): Promise<{ logs: any[]; totalElements: number }> {
  const query = new URLSearchParams();
  if (params.branchId) query.append('branchId', params.branchId);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.search) query.append('search', params.search);
  if (params.page !== undefined) query.append('page', params.page.toString());
  if (params.size !== undefined) query.append('size', params.size.toString());

  const response = await fetchWithAuth(`${BASE_URL}/search?${query.toString()}`);
  const payload = response.data;
  
  // payload is PageResponse
  if (payload && Array.isArray(payload.data)) {
    return {
      logs: payload.data,
      totalElements: payload.pagination?.totalElements ?? payload.data.length,
    };
  }
  return { logs: [], totalElements: 0 };
}
