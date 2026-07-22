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
  amountPaid?: number;
  startDate?: string;
  trainerCode?: string;
  trainerName?: string;
  role?: string;
  branchId?: string;
  attendanceCount?: number;
}

export async function getUsers(): Promise<Member[]> {
  const response = await fetchWithAuth(`${BASE_URL}/users`);
  return response.data || [];
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

export async function getStaff(): Promise<Staff[]> {
  const response = await fetchWithAuth(`${BASE_URL}/staff`);
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
