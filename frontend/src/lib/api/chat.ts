import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';

const CHAT_URL = `${API_CONFIG.CHAT_SERVICE_URL}`;

export interface ChatContact {
  id: string;
  name: string;
  role: string;
  isStaff: boolean;
  subtitle: string;
  avatar: string;
  email?: string;
  userCode?: string;
  // Used as username for chat — maps to email or userCode
  username?: string;
}

export interface ChatMsg {
  id: string;
  senderUsername: string;
  receiverUsername: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  readAt?: string;
}

export interface ConversationSummary {
  contactUsername: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const res = await fetchWithAuth(`${CHAT_URL}/api/chat/conversations`);
  return res.data || [];
}

export interface SendChatMessageInput {
  senderType?: string;
  senderId?: string;
  receiverId?: string;
  message?: string;
  senderUsername?: string;
  receiverUsername?: string;
  content?: string;
}

export interface GetChatHistoryInput {
  userId?: string;
  user1?: string;
  user2?: string;
}

export async function getChatHistory(
  param1: string | GetChatHistoryInput,
  param2?: string
): Promise<any[]> {
  let u1 = 'current-user';
  let u2 = '';

  if (typeof param1 === 'object' && param1 !== null) {
    u1 = param1.user1 || 'current-user';
    u2 = param1.user2 || param1.userId || '';
  } else if (typeof param1 === 'string') {
    u1 = param1;
    u2 = param2 || '';
  }

  if (!u2) {
    u2 = u1;
  }

  try {
    const res = await fetchWithAuth(`${CHAT_URL}/api/chat/history/${encodeURIComponent(u1)}/${encodeURIComponent(u2)}`);
    const list = res.data || [];
    return list.map((item: any) => ({
      ...item,
      id: item.id || `msg-${Math.random()}`,
      senderId: item.senderUsername || item.senderId || u1,
      receiverId: item.receiverUsername || item.receiverId || u2,
      message: item.content || item.message || '',
      createdAt: item.timestamp || item.createdAt || new Date().toISOString(),
      senderType: item.senderType || 'USER',
    }));
  } catch (err) {
    console.warn('Failed to fetch chat history:', err);
    return [];
  }
}

export async function sendChatMessage(
  payloadOrSender: SendChatMessageInput | string,
  receiverUsername?: string,
  content?: string
): Promise<any> {
  let sender = '';
  let receiver = '';
  let msgContent = '';

  if (typeof payloadOrSender === 'string') {
    sender = payloadOrSender;
    receiver = receiverUsername || '';
    msgContent = content || '';
  } else {
    sender = payloadOrSender.senderUsername || payloadOrSender.senderId || '';
    receiver = payloadOrSender.receiverUsername || payloadOrSender.receiverId || '';
    msgContent = payloadOrSender.content || payloadOrSender.message || '';
  }

  const res = await fetchWithAuth(`${CHAT_URL}/api/chat/send`, {
    method: 'POST',
    body: JSON.stringify({
      senderUsername: sender,
      receiverUsername: receiver,
      content: msgContent,
    }),
  });

  const data = res.data || res;
  return {
    ...data,
    id: data?.id || `msg-${Date.now()}`,
    senderId: data?.senderUsername || sender,
    receiverId: data?.receiverUsername || receiver,
    message: data?.content || msgContent,
    createdAt: data?.timestamp || new Date().toISOString(),
    senderType: 'USER',
  };
}

export const sendChatMessageRest = sendChatMessage;

export async function markConversationRead(senderUsername: string): Promise<void> {
  await fetchWithAuth(`${CHAT_URL}/api/chat/mark-read?senderUsername=${encodeURIComponent(senderUsername)}`, {
    method: 'POST',
  });
}
