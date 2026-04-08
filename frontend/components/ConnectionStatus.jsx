"use client";

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../lib/api/config';

export default function ConnectionStatus() {
    const [status, setStatus] = useState('checking'); // 'online', 'offline', 'checking'
    const [lastPing, setLastPing] = useState(null);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                // Short timeout for the ping
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    // Use GET instead of OPTIONS as simple check
                    method: 'GET',
                    mode: 'cors',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                setStatus('online');
                setLastPing(new Date());
            } catch (error) {
                setStatus('offline');
                console.warn('Backend reachability check failed:', API_BASE_URL);
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 30000); // Check every 30s

        return () => clearInterval(interval);
    }, []);

    if (status === 'online') return null; // Hide if online

    return (
        <div className="connection-status-badge">
            <div className={`status-dot ${status}`}></div>
            <span>
                {status === 'checking' ? 'Checking Connectivity...' : 'Backend Unreachable (192.168.18.109)'}
            </span>
            <style jsx>{`
                .connection-status-badge {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: rgba(0, 0, 0, 0.85);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    z-index: 9999;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.1);
                    backdrop-filter: blur(5px);
                }
                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                .status-dot.checking { background: #ffc107; animation: pulse 1.5s infinite; }
                .status-dot.offline { background: #ff4d4d; }
                .status-dot.online { background: #00e676; }

                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
