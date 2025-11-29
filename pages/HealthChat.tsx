
import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Avatar } from '../components/Common';
import { Send, Bot, User, AlertTriangle, Sparkles, Globe, Eraser } from 'lucide-react';
import { getHealthBotResponse } from '../services/geminiService';
import { useUser } from '../contexts/UserContext';

interface ChatMessage {
    id: string;
    role: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

export const HealthChat: React.FC = () => {
    const { user } = useUser();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'welcome', role: 'bot', text: "Namaste! I am your AI Health Advisor. I can provide general wellness tips in English, Hindi, Tamil, or Malayalam. How can I help you today?", timestamp: new Date() }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('English');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await getHealthBotResponse(input, language);
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (e) {
            // error handling in UI if needed
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-brand-500" /> AI Health Chat
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Verified wellness suggestions • Multilingual Support</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg border border-slate-200 dark:border-slate-600">
                        <Globe className="w-4 h-4 text-slate-500 ml-2" />
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer"
                        >
                            <option>English</option>
                            <option>Hindi</option>
                            <option>Tamil</option>
                            <option>Malayalam</option>
                        </select>
                    </div>
                    <Button variant="ghost" size="sm" icon={Eraser} onClick={() => setMessages([])}>Clear</Button>
                </div>
            </div>

            {/* Chat Area */}
            <Card className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 relative">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'bot' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                                    <Bot className="w-4 h-4" />
                                </div>
                            )}
                            <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-brand-600 text-white rounded-tr-sm' 
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-slate-700'
                            }`}>
                                <p>{msg.text}</p>
                                <p className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-brand-200' : 'text-slate-400'}`}>
                                    {msg.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                            {msg.role === 'user' && (
                                <Avatar name={user?.name || "User"} size="sm" className="shrink-0" />
                            )}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                            </div>
                        </div>
                    )}
                    <div ref={endRef} />
                </div>

                {/* Disclaimer */}
                <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-100 dark:border-amber-800/30 flex items-center justify-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    <span>AI suggestions are for informational purposes only. Consult a doctor for medical advice.</span>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder={`Type a message in ${language}...`}
                            className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl py-3.5 pl-4 pr-12 text-sm focus:ring-2 focus:ring-brand-500 dark:text-white"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
