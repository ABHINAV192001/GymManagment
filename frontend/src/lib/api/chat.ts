import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';
import { ChatMessage } from '../../types';

const BASE_URL = `${API_CONFIG.USER_MANAGEMENT_URL}/api/chat`;

export async function sendChatMessage(message: any): Promise<ChatMessage> {
  const response = await fetchWithAuth(`${BASE_URL}/send`, {
    method: 'POST',
    body: JSON.stringify(message),
  });
  return response.data;
}

export async function getChatHistory(params?: any): Promise<ChatMessage[]> {
  let url = `${BASE_URL}/history`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }
  const response = await fetchWithAuth(url);
  return response.data || [];
}

export async function markChatRead(messageIds: string[]): Promise<void> {
  await fetchWithAuth(`${BASE_URL}/mark-read`, {
    method: 'POST',
    body: JSON.stringify(messageIds),
  });
}
