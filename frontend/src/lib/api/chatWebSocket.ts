import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type MessageHandler = (message: any) => void;

class ChatWebSocketClient {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map();
  private handlers: Set<MessageHandler> = new Set();
  private isConnected = false;
  private currentUsername: string | null = null;

  public connect(username: string) {
    if (!username) return;
    if (this.isConnected && this.currentUsername === username) {
      return;
    }

    this.disconnect();
    this.currentUsername = username;

    const token = localStorage.getItem('gymos_token') || localStorage.getItem('accessToken') || '';

    // Determine backend WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.host;
    const wsUrl = process.env.NODE_ENV === 'production'
      ? `${protocol}//${host}/ws/chat`
      : 'http://localhost:8080/ws/chat';

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: () => {},
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      this.isConnected = true;
      if (this.currentUsername) {
        this.subscribeToTopic(`/topic/messages/${this.currentUsername}`);
      }
    };

    this.client.onStompError = (frame) => {
      console.warn('[STOMP Error]', frame.headers['message']);
      this.isConnected = false;
    };

    this.client.onWebSocketClose = () => {
      this.isConnected = false;
    };

    this.client.activate();
  }

  public subscribeToTopic(topic: string) {
    if (!this.client || !this.isConnected) return;
    if (this.subscriptions.has(topic)) return;

    try {
      const sub = this.client.subscribe(topic, (message) => {
        try {
          const body = JSON.parse(message.body);
          this.notifyHandlers(body);
        } catch (e) {
          console.error('Error parsing STOMP message:', e);
        }
      });
      this.subscriptions.set(topic, sub);
    } catch (err) {
      console.warn('Failed to subscribe to STOMP topic:', topic, err);
    }
  }

  public onMessage(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  private notifyHandlers(msg: any) {
    this.handlers.forEach((h) => {
      try {
        h(msg);
      } catch (err) {
        console.error('Error in message handler:', err);
      }
    });
  }

  public sendMessage(receiverUsername: string, content: string) {
    if (!this.client || !this.isConnected) return false;

    try {
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({
          receiverUsername,
          content,
        }),
      });
      return true;
    } catch (err) {
      console.warn('Failed to publish STOMP message:', err);
      return false;
    }
  }

  public disconnect() {
    if (this.client) {
      this.subscriptions.forEach((sub) => {
        try { sub.unsubscribe(); } catch {}
      });
      this.subscriptions.clear();
      try { this.client.deactivate(); } catch {}
      this.client = null;
    }
    this.isConnected = false;
    this.currentUsername = null;
  }
}

export const chatWebSocket = new ChatWebSocketClient();
