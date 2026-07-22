import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';
import { Organization } from '../../types';

const BASE_URL = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/organizations`;

export async function getMyOrg(): Promise<Organization> {
  const response = await fetchWithAuth(`${BASE_URL}/me`);
  return response.data;
}

export async function updateMyOrg(org: Partial<Organization>): Promise<Organization> {
  const response = await fetchWithAuth(`${BASE_URL}/me`, {
    method: 'PUT',
    body: JSON.stringify(org),
  });
  return response.data;
}
