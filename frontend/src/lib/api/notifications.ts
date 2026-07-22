import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';
import { NotificationTemplate, NotificationLog } from '../../types';

const BASE_URL = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/notifications`;

export async function getTemplates(): Promise<NotificationTemplate[]> {
  const response = await fetchWithAuth(`${BASE_URL}/templates`);
  return response.data || [];
}

export async function createTemplate(template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
  const response = await fetchWithAuth(`${BASE_URL}/templates`, {
    method: 'POST',
    body: JSON.stringify(template),
  });
  return response.data;
}

export async function updateTemplate(id: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
  const response = await fetchWithAuth(`${BASE_URL}/templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(template),
  });
  return response.data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await fetchWithAuth(`${BASE_URL}/templates/${id}`, { method: 'DELETE' });
}

export async function sendNotification(payload: any): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/send`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function getNotificationLogs(): Promise<NotificationLog[]> {
  const response = await fetchWithAuth(`${BASE_URL}/logs`);
  return response.data || [];
}

export async function getNotificationStats(): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/stats`);
  return response.data;
}
