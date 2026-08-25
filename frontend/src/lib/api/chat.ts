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

export async function getChatContacts(): Promise<ChatContact[]> {
  try {
    const res = await fetchWithAuth(`${CHAT_URL}/api/chat/contacts`);
    const list = res.data || [];
    return list.map((item: any) => {
      const rawRole = (item.role || '').toUpperCase();
      let displayRole = 'Member';
      let isStaffOrAdmin = false;

      if (rawRole.includes('ADMIN') || rawRole.includes('OWNER')) {
        displayRole = 'Admin';
        isStaffOrAdmin = true;
      } else if (rawRole.includes('TRAINER')) {
        displayRole = 'Trainer';
        isStaffOrAdmin = true;
      } else if (rawRole.includes('STAFF') || rawRole.includes('EMPLOYEE') || rawRole.includes('MANAGER') || rawRole.includes('RECEPTIONIST')) {
        displayRole = 'Staff';
        isStaffOrAdmin = true;
      } else if (item.isStaff || item.staff) {
        displayRole = 'Staff';
        isStaffOrAdmin = true;
      }

      let displayName = item.name;
      if (!displayName || displayName === 'string' || displayName === 'null' || displayName.trim() === '') {
        displayName = displayRole;
      }

      const cleanNameForAvatar = displayName.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const avatarInitials = cleanNameForAvatar.includes(' ')
        ? cleanNameForAvatar.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : cleanNameForAvatar.substring(0, 2).toUpperCase();

      return {
        id: item.id,
        name: displayName,
        role: displayRole,
        isStaff: isStaffOrAdmin,
        subtitle: `${displayRole} • Active`,
        avatar: avatarInitials || displayRole.substring(0, 2).toUpperCase(),
        email: item.email,
        userCode: item.userCode,
        username: item.username,
        unreadCount: item.unreadCount || 0,
      };
    });
  } catch (err) {
    console.warn('Failed to fetch chat contacts:', err);
    return [];
  }
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

function normalizeUtcTimestamp(timestamp?: string): string {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') {
    if (!timestamp.endsWith('Z') && !timestamp.includes('+')) {
      return timestamp + 'Z';
    }
  }
  return timestamp;
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
      createdAt: normalizeUtcTimestamp(item.timestamp || item.createdAt),
      senderType: item.senderType || 'USER',
      edited: Boolean(item.edited),
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
    sender = payloadOrSender.senderUsername || payloadOrSender.senderId || 'current-user';
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

  const item = res.data;
  if (!item) return null;
  return {
    ...item,
    id: item.id || `msg-${Math.random()}`,
    senderId: item.senderUsername || item.senderId || sender,
    receiverId: item.receiverUsername || item.receiverId || receiver,
    message: item.content || item.message || msgContent,
    createdAt: normalizeUtcTimestamp(item.timestamp || item.createdAt),
    senderType: item.senderType || 'USER',
    edited: Boolean(item.edited),
  };
}

export async function editChatMessage(messageId: string, content: string): Promise<any> {
  const res = await fetchWithAuth(`${CHAT_URL}/api/chat/messages/${encodeURIComponent(messageId)}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
  return res.data;
}

export async function deleteChatMessage(messageId: string): Promise<any> {
  const res = await fetchWithAuth(`${CHAT_URL}/api/chat/messages/${encodeURIComponent(messageId)}`, {
    method: 'DELETE',
  });
  return res.data;
}

export const sendChatMessageRest = sendChatMessage;

export async function markConversationRead(senderUsername: string): Promise<void> {
  await fetchWithAuth(`${CHAT_URL}/api/chat/mark-read?senderUsername=${encodeURIComponent(senderUsername)}`, {
    method: 'POST',
  });
}
