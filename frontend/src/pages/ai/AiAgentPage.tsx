import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  User,
  Bot,
  Plus,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  BrainCircuit,
  ChevronDown
} from 'lucide-react';
import {
  streamAgentResponse,
  AgentChatMessage,
  fetchUserSessions,
  fetchSessionMessages,
  deleteSession,
  AiSession
} from '../../lib/api/aiAgent';
import { FormattedMarkdown } from '../../components/chat/FormattedMarkdown';

export const AiAgentPage: React.FC = () => {
  const outletCtx = useOutletContext<{ triggerAnnouncement?: (msg: string) => void }>() || {};
  const triggerAnnouncement = outletCtx?.triggerAnnouncement || (() => {});

  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);

  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingText, setThinkingText] = useState('');
  const [showThinkingDetails, setShowThinkingDetails] = useState<Record<string, boolean>>({});

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load User Sessions on Mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, isThinking, thinkingText]);

  const loadSessions = async () => {
    const list = await fetchUserSessions();
    setSessions(list);
  };

  const handleSelectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsGenerating(false);
    setIsThinking(false);
    const history = await fetchSessionMessages(sessionId);
    setMessages(history);
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setIsGenerating(false);
    setIsThinking(false);
    setThinkingText('');
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const success = await deleteSession(sessionId);
    if (success) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
      triggerAnnouncement('Deleted chat session');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isGenerating) return;

    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const agentMsgId = `agent-${Date.now()}`;
    const initialAgentMsg: AgentChatMessage = {
      id: agentMsgId,
      sender: 'agent',
      content: '',
      reasoning: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMsg, initialAgentMsg]);
    if (!textToSend) setInputMessage('');

    setIsGenerating(true);
    setIsThinking(true);
    setThinkingText('');

    let accumulatedText = '';
    let accumulatedReasoning = '';

    try {
      await streamAgentResponse(
        query,
        'ai-assistant',
        'You are a helpful AI Assistant for gym members and staff.',
        currentSessionId,
        {
          onSessionId: (newSessionId) => {
            setCurrentSessionId(newSessionId);
            loadSessions();
          },
          onThinking: (chunk) => {
            accumulatedReasoning += chunk;
            setThinkingText(accumulatedReasoning);
            setMessages(prev =>
              prev.map(msg =>
                msg.id === agentMsgId
                  ? { ...msg, reasoning: accumulatedReasoning }
                  : msg
              )
            );
          },
          onChunk: (chunk) => {
            setIsThinking(false); // Stop thinking spinner once content starts streaming
            accumulatedText += chunk;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === agentMsgId
                  ? { ...msg, content: accumulatedText }
                  : msg
              )
            );
          },
          onError: (errMessage) => {
            setIsThinking(false);
            setMessages(prev =>
              prev.map(msg =>
                msg.id === agentMsgId
                  ? { ...msg, content: `⚠️ Error: ${errMessage}` }
                  : msg
              )
            );
          }
        }
      );
    } catch (err: any) {
      console.error('AI Streaming error:', err);
    } finally {
      setIsGenerating(false);
      setIsThinking(false);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === agentMsgId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
      loadSessions();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    triggerAnnouncement('Copied to clipboard');
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const toggleThinkingDetails = (msgId: string) => {
    setShowThinkingDetails(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="h-full w-full bg-zinc-950 text-zinc-100 flex overflow-hidden font-sans">
      
      {/* ── Left Sidebar (Chat History) ────────────────────────── */}
      <div
        className={`bg-zinc-900/90 border-r border-zinc-800/80 flex flex-col transition-all duration-300 z-20 shrink-0 ${
          isSidebarOpen ? 'w-64 md:w-72 p-3' : 'w-16 p-2.5 items-center'
        }`}
      >
        {/* Toggle Header Button */}
        <div className={`flex items-center mb-3 w-full ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {isSidebarOpen && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">
              History
            </span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title={isSidebarOpen ? 'Collapse History' : 'Expand History'}
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className={`rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer mb-3 shrink-0 ${
            isSidebarOpen ? 'w-full py-2.5 px-4' : 'w-10 h-10 p-0'
          }`}
          title="New Chat"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {isSidebarOpen && <span>New Chat</span>}
        </button>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 w-full pr-0.5 scrollbar-none">
          {sessions.length === 0 ? (
            isSidebarOpen ? (
              <div className="text-center text-xs text-zinc-600 py-6">
                No previous chats
              </div>
            ) : null
          ) : (
            sessions.map((s) => {
              const isActive = currentSessionId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectSession(s.id)}
                  title={s.title || 'New Chat'}
                  className={`group flex items-center rounded-xl cursor-pointer text-xs transition ${
                    isSidebarOpen ? 'justify-between p-2.5' : 'justify-center p-2.5 w-10 h-10 mx-auto'
                  } ${
                    isActive
                      ? 'bg-zinc-800 text-white font-semibold shadow-xs ring-1 ring-indigo-500/30'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                    {isSidebarOpen && <span className="truncate">{s.title || 'New Chat'}</span>}
                  </div>
                  
                  {isSidebarOpen && (
                    <button
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition rounded"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main Chat Area (Normal Clean Full-Page Layout) ─────── */}
      <div className="flex-1 flex flex-col h-full bg-zinc-950 relative overflow-hidden">
        
        {/* Top Minimal Toolbar */}
        <div className="px-4 py-2.5 border-b border-zinc-800/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Assistant
            </span>
          </div>

          <div className="text-[11px] text-zinc-500 font-mono">
            NVIDIA Nemotron 3 Ultra
          </div>
        </div>

        {/* Clean Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-none">
          {messages.length === 0 && !isThinking ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 p-6">
              <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 mb-4">
                <Bot className="w-10 h-10 text-indigo-400 animate-pulse" />
              </div>
              <h2 className="font-bold text-zinc-200 text-base mb-1">How can I help you today?</h2>
              <p className="text-xs text-zinc-500 max-w-sm">
                Ask about gym workouts, diet macros, member management, or custom splits.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 md:gap-4 max-w-4xl mx-auto ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* User / Agent Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                    isUser ? 'bg-blue-600 text-white' : 'bg-indigo-600 text-white'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Clean Normal Text Container (No outer card borders) */}
                  <div className={`flex-1 space-y-2 text-sm leading-relaxed ${
                    isUser ? 'text-right' : 'text-left'
                  }`}>
                    
                    {/* Message Header */}
                    <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span className="font-semibold text-xs text-zinc-400">
                        {isUser ? 'You' : 'AI Assistant'}
                      </span>
                      <span className="text-[10px] text-zinc-600 font-mono">{msg.timestamp}</span>

                      {!isUser && msg.content && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1 rounded text-zinc-500 hover:text-white transition ml-2"
                          title="Copy text"
                        >
                          {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    {/* Reasoning / Thinking Accordion */}
                    {msg.reasoning && (
                      <div className="text-left my-1.5">
                        <button
                          onClick={() => toggleThinkingDetails(msg.id)}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition py-0.5"
                        >
                          <BrainCircuit className="w-3.5 h-3.5" />
                          <span>{showThinkingDetails[msg.id] ? 'Hide thinking process' : 'Thought process'}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform ${showThinkingDetails[msg.id] ? 'rotate-180' : ''}`} />
                        </button>
                        {showThinkingDetails[msg.id] && (
                          <div className="mt-1.5 p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-xs text-zinc-300 font-mono leading-relaxed max-h-56 overflow-y-auto">
                            <FormattedMarkdown content={msg.reasoning} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Body Content */}
                    {isUser ? (
                      <div className="inline-block bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-left text-xs md:text-sm leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="text-zinc-200">
                        <FormattedMarkdown content={msg.content} />
                        {msg.isStreaming && !isThinking && (
                          <span className="inline-block w-1.5 h-3.5 bg-indigo-400 animate-pulse ml-1 align-middle" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Thinking Animation (GPT / Claude / Gemini Style) */}
          {isThinking && (
            <div className="flex gap-3 md:gap-4 max-w-4xl mx-auto">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex items-center gap-2 py-1.5">
                <span className="text-xs font-semibold text-indigo-400 animate-pulse flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 animate-bounce text-indigo-400" />
                  Thinking...
                </span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping delay-300" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Field (Normal Clean Toolbar) */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 max-w-4xl w-full mx-auto shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 focus-within:border-indigo-500 rounded-2xl p-2 transition shadow-lg"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Message AI Assistant..."
              disabled={isGenerating}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs md:text-sm text-white placeholder-zinc-500 focus:outline-none transition disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isGenerating}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition cursor-pointer shrink-0 flex items-center justify-center"
              title="Send Message"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
