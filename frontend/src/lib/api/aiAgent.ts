import { API_CONFIG } from '../../config/api';

const AI_BASE_URL = `${API_CONFIG.USER_MANAGEMENT_URL}/api/ai-chat`;

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentId?: string;
  content: string;
  reasoning?: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface AiSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export async function streamAgentResponse(
  message: string,
  agentId: string,
  systemPrompt: string,
  sessionId: string | null,
  callbacks: {
    onSessionId?: (sessionId: string) => void;
    onThinking?: (thinkingText: string) => void;
    onChunk: (chunk: string) => void;
    onError?: (errMessage: string) => void;
  }
): Promise<string> {
  try {
    const token = localStorage.getItem('gymos_token') || localStorage.getItem('accessToken') || '';
    const res = await fetch(`${AI_BASE_URL}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        message,
        agentId,
        systemPrompt,
        sessionId: sessionId || '',
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`AI Agent request failed with status ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6).trim();
          try {
            const evt = JSON.parse(jsonStr);
            if (evt.type === 'session' && evt.data?.sessionId) {
              if (callbacks.onSessionId) callbacks.onSessionId(evt.data.sessionId);
            } else if (evt.type === 'thinking' && evt.data?.text) {
              if (callbacks.onThinking) callbacks.onThinking(evt.data.text);
            } else if (evt.type === 'content' && evt.data?.text) {
              fullText += evt.data.text;
              callbacks.onChunk(evt.data.text);
            } else if (evt.type === 'error' && evt.data?.message) {
              if (callbacks.onError) callbacks.onError(evt.data.message);
            }
          } catch (e) {
            // Handle plain string chunk if any fallback
            fullText += jsonStr;
            callbacks.onChunk(jsonStr);
          }
        }
      }
    }

    return fullText;
  } catch (err: any) {
    console.error('AI streaming error:', err);
    if (callbacks.onError) callbacks.onError(err.message || 'Stream error');
    return '';
  }
}

export async function fetchUserSessions(): Promise<AiSession[]> {
  try {
    const token = localStorage.getItem('gymos_token') || localStorage.getItem('accessToken') || '';
    const res = await fetch(`${AI_BASE_URL}/sessions`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch AI chat sessions:', e);
    return [];
  }
}

export async function fetchSessionMessages(sessionId: string): Promise<AgentChatMessage[]> {
  try {
    const token = localStorage.getItem('gymos_token') || localStorage.getItem('accessToken') || '';
    const res = await fetch(`${AI_BASE_URL}/sessions/${sessionId}/messages`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((msg: any) => ({
      id: msg.id,
      sender: msg.sender,
      content: msg.content,
      reasoning: msg.reasoning,
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  } catch (e) {
    console.error('Failed to fetch session messages:', e);
    return [];
  }
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('gymos_token') || localStorage.getItem('accessToken') || '';
    const res = await fetch(`${AI_BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to delete chat session:', e);
    return false;
  }
}
