import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

let stompClient = null;

export const initStomp = (onConnected) => {
    if (stompClient && stompClient.connected) {
        if (onConnected) onConnected(stompClient);
        return;
    }

    const socket = new SockJS('http://localhost:8082/chat');
    stompClient = Stomp.over(socket);

    // Disable debug logging in production
    stompClient.debug = () => { };

    stompClient.connect({}, (frame) => {
        console.log('Connected to WebSocket: ' + frame);
        if (onConnected) onConnected(stompClient);
    }, (error) => {
        console.error('WebSocket Error: ', error);
        // Retry logic could be added here
    });
};

export const subscribeToTopic = (topic, onMessage) => {
    if (!stompClient || !stompClient.connected) {
        console.warn('STOMP not connected, cannot subscribe to ' + topic);
        return null;
    }

    return stompClient.subscribe(topic, (message) => {
        if (message.body) {
            onMessage(JSON.parse(message.body));
        }
    });
};

export const disconnectStomp = () => {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    console.log("Disconnected");
};
