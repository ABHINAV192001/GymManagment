"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? 'http://localhost:8082/auth/login' : 'http://localhost:8082/auth/signup';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role: 'USER' })
            });

            if (res.ok) {
                if (isLogin) {
                    const data = await res.json();
                    localStorage.setItem('chatUser', JSON.stringify(data));
                    router.push('/chat-app/dashboard');
                } else {
                    alert('Signup successful! Please login.');
                    setIsLogin(true);
                }
            } else {
                alert('Authentication failed');
            }
        } catch (err) {
            console.error(err);
            alert('Error connecting to Chat Service');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">WaitChat Login</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <input
                        className="w-full p-2 border rounded"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        {isLogin ? 'Login' : 'Signup'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Need an account? Signup' : 'Have account? Login'}
                </p>
            </div>
        </div>
    );
}
