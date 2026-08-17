import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';

const BASE_URL = `${API_CONFIG.WORKOUT_SERVICE_URL}/api/group-sessions`;

export interface GroupSessionPayload {
  title: string;
  description: string;
  sessionDate: string;       // ISO date: "2025-07-25"
  sessionTime: string;       // "HH:mm"
  durationMins: number;
  availableSlots: number;
  branchIds: string[];
  notifyRoles: string[];
}

export interface GroupSessionResponse {
  id: string;
  title: string;
  description: string;
  sessionDate: string;
  sessionTime: string;
  durationMins: number;
  availableSlots: number;
  bookedCount: number;
  outCount?: number;
  remainingSlots: number;
  branchIds: string[];
  notifyRoles: string[];
  attendeeIds?: string[];
  outVoteIds?: string[];
  isBookedByMe?: boolean;
  myVote?: 'IN' | 'OUT' | null;
  status: string;
  cancellationReason?: string;
  cancelledAt?: string;
  orgId: string;
  createdAt: string;
}

/** Create a new group session */
export async function createGroupSession(payload: GroupSessionPayload): Promise<GroupSessionResponse> {
  const response = await fetchWithAuth(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

/** Update an existing group session */
export async function updateGroupSession(id: string, payload: Partial<GroupSessionPayload>): Promise<GroupSessionResponse> {
  const response = await fetchWithAuth(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return response.data;
}

/** Soft delete a group session */
export async function deleteGroupSession(id: string): Promise<void> {
  await fetchWithAuth(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
}

/** List all group sessions, optionally filtered by branchId */
export async function getGroupSessions(branchId?: string): Promise<GroupSessionResponse[]> {
  const url = branchId && branchId !== 'ALL'
    ? `${BASE_URL}?branchId=${encodeURIComponent(branchId)}`
    : BASE_URL;
  const response = await fetchWithAuth(url);
  return Array.isArray(response.data) ? response.data : [];
}

/** Cancel a group session with a mandatory reason */
export async function cancelGroupSession(id: string, reason: string): Promise<GroupSessionResponse> {
  const response = await fetchWithAuth(`${BASE_URL}/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
  return response.data;
}

/** Vote IN or OUT for a group session */
export async function voteGroupSession(id: string, voteType: 'IN' | 'OUT'): Promise<GroupSessionResponse> {
  const response = await fetchWithAuth(`${BASE_URL}/${id}/vote`, {
    method: 'POST',
    body: JSON.stringify({ voteType }),
  });
  return response.data;
}

/** Book a spot in a group session (defaults to IN vote) */
export async function bookGroupSession(id: string): Promise<GroupSessionResponse> {
  return voteGroupSession(id, 'IN');
}
