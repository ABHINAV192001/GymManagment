import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Send, User, CheckCheck, Sparkles, MessageCircle, X } from 'lucide-react';
import { ChatMessage } from '../../types';
import { getChatHistory, sendChatMessage } from '../../lib/api/chat';

export const Chat: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ triggerAnnouncement: (msg: string) => void }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [activeUser, setActiveUser] = useState<'m-1' | 'm-2'>('m-1');

  useEffect(() => {
    getChatHistory().then(data => setMessages(data)).catch(err => triggerAnnouncement(`Failed to load chat history: ${err.message}`));
  }, [triggerAnnouncement]);

  const activeMessages = messages.filter(
    (m) =>
      (m.senderId === activeUser && m.receiverId === 's-1') ||
      (m.senderId === 's-1' && m.receiverId === activeUser)
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    sendChatMessage({
      senderType: 'STAFF',
      senderId: 's-1',
      receiverId: activeUser,
      message: typedMessage.trim(),
    }).then(newMsg => {
      setMessages([...messages, newMsg]);
      setTypedMessage('');
      triggerAnnouncement('Message transmitted successfully.');
    }).catch(err => {
      triggerAnnouncement(`Failed to send message: ${err.message}`);
    });

    // Simulate real member auto replies
    setTimeout(() => {
      const autoResponses: { [key: string]: string[] } = {
        'm-1': [
          'Thanks Coach Rahul! Got it. Will focus on L4 stability squats today.',
          'Perfect, I will log my weight progress in the dashboard before starting.',
          'Understood. Should I increase sets or stick to 4?',
        ],
        'm-2': [
          'Hey Sanjana! Yes, the Ashtanga Yoga class this morning was fantastic.',
          'Will carry my asthma inhaler to the CrossFit studio tomorrow.',
          'Thanks for the posture guide, back feels much better!',
        ],
      };

      const replies = autoResponses[activeUser] || ['Understood coach.'];
      const chosenReply = replies[Math.floor(Math.random() * replies.length)];

      sendChatMessage({
        senderType: 'USER',
        senderId: activeUser,
        receiverId: 's-1',
        message: chosenReply,
      }).then(autoMsg => {
        setMessages(prev => [...prev, autoMsg]);
        triggerAnnouncement('New message received from member.');
      }).catch(err => console.error(err));
    }, 1800);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[480px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden text-xs">
      
      {/* Sidebar contact directory */}
      <div className="md:col-span-1 border-r border-zinc-150 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900/40 space-y-4">
        <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Client Threads</span>
        
        <div className="space-y-1.5">
          {[
            { id: 'm-1', name: 'Amit Sharma', desc: 'Assigned Trainer: Rahul K', avatar: 'AS' },
            { id: 'm-2', name: 'Priya Patel', desc: 'Assigned Trainer: Sanjana S', avatar: 'PP' },
          ].map((client) => (
            <button
              key={client.id}
              onClick={() => setActiveUser(client.id as any)}
              className={`w-full p-3 rounded-lg text-left transition ${
                activeUser === client.id
                  ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900/50'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/30 text-[11px] font-bold text-blue-600 flex items-center justify-center">
                  {client.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-100">{client.name}</h4>
                  <p className="text-[10px] text-zinc-400">{client.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Primary chat window */}
      <div className="md:col-span-2 flex flex-col justify-between h-full">
        {/* Header */}
        <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                {activeUser === 'm-1' ? 'Amit Sharma' : 'Priya Patel'}
              </h3>
              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Connected via Client Portal
              </p>
            </div>
          </div>
        </div>

        {/* Message body logs */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-zinc-50/20 dark:bg-zinc-950/35">
          {activeMessages.map((msg) => {
            const isMe = msg.senderType === 'STAFF';
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`p-3 rounded-xl max-w-xs space-y-1 ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-tl-none shadow-sm'
                }`}>
                  <p className="leading-relaxed leading-snug">{msg.message}</p>
                  <span className={`block text-[9px] text-right ${isMe ? 'text-blue-200' : 'text-zinc-400'} font-mono`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex gap-2">
          <input
            type="text"
            placeholder="Type guidance message..."
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
            aria-label="Type message input"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-1 shadow focus:outline-2 focus:outline-blue-500"
          >
            <span>Transmit</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

    </div>
  );
};
