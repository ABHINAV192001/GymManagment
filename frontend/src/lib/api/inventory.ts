import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';
import { InventoryItem } from '../../types';

const BASE_URL = `${API_CONFIG.USER_MANAGEMENT_URL}/api/inventory`;

export async function getInventory(): Promise<InventoryItem[]> {
  const response = await fetchWithAuth(BASE_URL);
  return response.data || [];
}

export async function getInventoryDashboard(): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/dashboard`);
  return response.data;
}

export async function createInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
  const response = await fetchWithAuth(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return response.data;
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
  const response = await fetchWithAuth(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
  return response.data;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await fetchWithAuth(`${BASE_URL}/${id}`, { method: 'DELETE' });
}

export async function sellInventoryItem(id: string, quantity: number): Promise<InventoryItem> {
  const response = await fetchWithAuth(`${BASE_URL}/${id}/sell?quantity=${quantity}`, {
    method: 'POST',
  });
  return response.data;
}
