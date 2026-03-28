"use client";
import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useRouter } from 'next/navigation';

export default function ChatDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);

    const [activeChat, setActiveChat] = useState('admin'); // Default to admin for now
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    // Sample contacts list (In real app, fetch from API)
    const [contacts, setContacts] = useState([
        { username: 'admin', name: 'Support Admin' },
        { username: 'trainer1', name: 'John Trainer' },
        { username: 'user2', name: 'Alice User' }
    ]);

    const messagesEndRef = useRef(null);

    // 1. Check Auth & Connect WebSocket
    useEffect(() => {
        const storedUser = localStorage.getItem('chatUser');
        if (!storedUser) {
            router.push('/chat-app');
            return;
        }
        const currentUser = JSON.parse(storedUser);
        setUser(currentUser);

        // STOMP Client Setup
        const socket = new SockJS('http://localhost:8082/chat');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSocket');
                setConnected(true);

                // Subscribe to my private requests
                client.subscribe(`/topic/messages/${currentUser.username}`, (msg) => {
                    const receivedMsg = JSON.parse(msg.body);
                    setMessages(prev => [...prev, receivedMsg]);
                });
            },
            onDisconnect: () => {
                setConnected(false);
                console.log('Disconnected');
            }
        });

        client.activate();
        setStompClient(client);

        return () => {
            if (client) client.deactivate();
        };
    }, []);

    // 2. Fetch History when active chat changes
    useEffect(() => {
        if (!user || !activeChat) return;

        const fetchHistory = async () => {
            try {
                const res = await fetch(`http://localhost:8082/api/messages/${user.username}/${activeChat}`);
                if (res.ok) {
                    const history = await res.json();
                    setMessages(history);
                }
            } catch (e) {
                console.error("Failed to load history", e);
            }
        };
        fetchHistory();
    }, [user, activeChat]);

    // 3. Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim() || !stompClient || !connected) return;

        const msgPayload = {
            senderUsername: user.username,
            receiverUsername: activeChat,
            content: newMessage
        };

        stompClient.publish({
            destination: "/app/send",
            body: JSON.stringify(msgPayload)
        });

        setNewMessage("");
        // Optimistic update is optional since server sends back to sender too in my controller logic
    };

    if (!user) return <div className="p-10">Loading...</div>;

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user.username[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-700">{user.username} (You)</span>
                    </div>
                    <button onClick={() => { localStorage.removeItem('chatUser'); router.push('/chat-app'); }} className="text-xs text-red-500">Logout</button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {contacts.map(contact => (
                        <div
                            key={contact.username}
                            onClick={() => setActiveChat(contact.username)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition ${activeChat === contact.username ? 'bg-blue-50 border-r-4 border-blue-500' : ''}`}
                        >
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                {contact.name[0]}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{contact.name}</h3>
                                <p className="text-sm text-gray-500 truncate">Click to chat</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#e5ddd5]">
                {/* Header */}
                <div className="p-4 bg-white border-b shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                        {activeChat[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">{activeChat}</h3>
                        <p className={`text-xs ${connected ? 'text-green-500' : 'text-red-500'}`}>
                            {connected ? 'Online' : 'Connecting...'}
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderUsername === user.username;
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-lg shadow-sm text-sm ${isMe ? 'bg-[#d9fdd3] text-gray-800 rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                                    <p>{msg.content}</p>
                                    <span className="text-[10px] text-gray-500 block text-right mt-1">
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white flex gap-2 items-center">
                    <input
                        className="flex-1 p-3 bg-gray-100 rounded-full border-none focus:ring-1 focus:ring-gray-300 outline-none"
                        placeholder="Type a message"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        className="bg-[#00a884] text-white p-3 rounded-full hover:bg-[#008f72] transition w-10 h-10 flex items-center justify-center"
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
}
