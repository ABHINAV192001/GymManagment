import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';
import { Member, Staff, Branch } from '../../types';

const BASE_URL = `${API_CONFIG.USER_MANAGEMENT_URL}/api/admin/dashboard`;

// Mirrors what com.gymbross.usermanagement.dto.AdminDashboardDtos.UserDetailDto's
// createUser/updateUser handlers actually read. Trainer assignment is by trainerCode
// (or trainerName as a fallback), not by id — there is no assignedTrainerId field.
export interface UserUpsertRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  amountPaid?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  trainerCode?: string;
  trainerName?: string;
  role?: string;
  plan?: string;
  branchId?: string;
  accessibleBranchIds?: string[];
  attendanceCount?: number;
  isStaff?: boolean;
}

export interface UserFilterParams {
  search?: string;
  role?: string;
  status?: string;
  isStaff?: boolean;
  filterBranchId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  page?: number;
  size?: number;
}

export interface PaginatedMembersResult {
  members: Member[];
  pagination?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function getUsers(params?: UserFilterParams): Promise<PaginatedMembersResult> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.role && params.role !== 'ALL') query.append('role', params.role);
  if (params?.status && params.status !== 'ALL') query.append('status', params.status);
  if (params?.isStaff !== undefined) query.append('isStaff', String(params.isStaff));
  if (params?.filterBranchId && params.filterBranchId !== 'ALL') query.append('filterBranchId', params.filterBranchId);
  if (params?.startDateFrom) query.append('startDateFrom', params.startDateFrom);
  if (params?.startDateTo) query.append('startDateTo', params.startDateTo);
  if (params?.page !== undefined) query.append('page', String(params.page));
  if (params?.size !== undefined) query.append('size', String(params.size));

  const queryString = query.toString();
  const url = queryString ? `${BASE_URL}/users?${queryString}` : `${BASE_URL}/users`;
  const response = await fetchWithAuth(url);
  return {
    members: response.data || [],
    pagination: response.pagination,
  };
}

export async function getUserById(id: string): Promise<Member> {
  const response = await fetchWithAuth(`${BASE_URL}/users/${id}`);
  return response.data;
}

export async function createUser(user: UserUpsertRequest): Promise<void> {
  // POST /users returns ApiResponse<Void> (data is always null) — no created record
  // comes back, so callers must refetch (e.g. getUsers()) to see the new member.
  await fetchWithAuth(`${BASE_URL}/users`, {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export async function updateUser(id: string, user: UserUpsertRequest): Promise<void> {
  // PUT /users/{id} also returns ApiResponse<Void> — refetch to see the update.
  await fetchWithAuth(`${BASE_URL}/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await fetchWithAuth(`${BASE_URL}/users/${id}`, { method: 'DELETE' });
}

export async function resendPasswordNotification(userId: string): Promise<{ inviteLink?: string; message?: string }> {
  const response = await fetchWithAuth(`${BASE_URL}/users/${userId}/resend-invite`, {
    method: 'POST',
  });
  return response.data || {};
}

export function getWhatsAppInviteUrl(phone: string, inviteLink: string, memberName?: string): string {
  let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  const text = `🏋️‍♂️ *WELCOME TO GYMBROSS PLATFORM*\n\nHello *${memberName || 'Member'}*,\nYour GYMBROSS account has been created!\n\n• *Setup Password Link:* ${inviteLink}\n\n👉 Click the link above to set your password and access your account.`;
  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export async function createTrainer(trainer: Partial<Staff>): Promise<Staff> {
  const response = await fetchWithAuth(`${BASE_URL}/trainers`, {
    method: 'POST',
    body: JSON.stringify(trainer),
  });
  return response.data;
}

export async function getAdminStats(): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/stats`);
  return response.data;
}

export async function getStaff(branchId?: string): Promise<Staff[]> {
  const url = branchId ? `${BASE_URL}/staff?branchId=${branchId}` : `${BASE_URL}/staff`;
  const response = await fetchWithAuth(url);
  return response.data || [];
}

export async function getAdminBranches(): Promise<Branch[]> {
  const response = await fetchWithAuth(`${BASE_URL}/branches`);
  return response.data || [];
}

export async function createStaff(staff: Partial<Staff>): Promise<Staff> {
  const response = await fetchWithAuth(`${BASE_URL}/staff`, {
    method: 'POST',
    body: JSON.stringify(staff),
  });
  return response.data;
}

export async function updateStaff(id: string, staff: Partial<Staff>): Promise<Staff> {
  const response = await fetchWithAuth(`${BASE_URL}/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(staff),
  });
  return response.data;
}
