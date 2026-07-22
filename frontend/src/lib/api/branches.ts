import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';
import { Branch } from '../../types';

// Mirrors com.gymbross.usermanagement.dto.BranchDtos.BranchRequest.
export interface BranchRequest {
  branchCode?: string;
  name: string;
  adminUserId: string;
}

export async function getBranches(): Promise<Branch[]> {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/branches`;
  const response = await fetchWithAuth(url);
  return response.data || [];
}

export async function createBranch(branch: BranchRequest): Promise<Branch> {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/branches`;
  // POST /branches returns the BranchResponse directly, not wrapped in { data }.
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(branch),
  });
}

export async function updateBranch(id: string, branch: BranchRequest): Promise<Branch> {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/branches/${id}`;
  // PUT /branches/{id} returns the BranchResponse directly, not wrapped in { data }.
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(branch),
  });
}

export async function deleteBranch(id: string): Promise<void> {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/branches/${id}`;
  await fetchWithAuth(url, {
    method: 'DELETE',
  });
}

export async function updateBranchStatus(id: string, isActive: boolean): Promise<void> {
  // Backend takes isActive as a @RequestParam, not a JSON body, and returns 204.
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/branches/${id}/status?isActive=${isActive}`;
  await fetchWithAuth(url, {
    method: 'PATCH',
  });
}
