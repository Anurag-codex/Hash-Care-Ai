
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Globe, Sparkles, Bot, User, AlertTriangle, Minimize2, Maximize2 } from 'lucide-react';
import { Card, Button } from './Common';
import { getHealthBotResponse } from '../services/geminiService';
import { useUser } from '../contexts/UserContext';

interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

export const HealthBot: React.FC = () => {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'bot', text: "Hello! I'm your personal health guide. Ask me about wellness, symptoms, or nutrition.", timestamp: new Date() }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('English');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isMinimized]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await getHealthBotResponse(userMsg.text, language);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: response,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Bot Error", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-full shadow-2xl hover:scale-105 transition-transform group"
            >
                <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
        );
    }

    return (
        <div className={`fixed z-50 transition-all duration-300 ${isMinimized ? 'bottom-6 right-6 w-72' : 'bottom-6 right-6 w-full max-w-sm md:w-96 h-[600px] max-h-[80vh]'}`}>
            <Card className="flex flex-col h-full shadow-2xl border-brand-500/20 overflow-hidden bg-white dark:bg-slate-900">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-brand-600 to-teal-700 text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Health Assistant</h3>
                            <p className="text-[10px] text-brand-100">AI Powered • Verified Tips</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Language Bar */}
                        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
                            <span className="text-slate-500 flex items-center gap-1"><Globe className="w-3 h-3" /> Language:</span>
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-transparent border-none font-bold text-brand-600 focus:ring-0 cursor-pointer"
                            >
                                <option>English</option>
                                <option>Hindi</option>
                                <option>Tamil</option>
                                <option>Malayalam</option>
                            </select>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'bot' && (
                                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0 border border-brand-200 dark:border-brand-800">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-brand-600 text-white rounded-tr-sm' 
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-slate-700'
                                    }`}>
                                        <p>{msg.text}</p>
                                        <span className={`text-[9px] block mt-1 opacity-70 ${msg.role === 'user' ? 'text-brand-100' : 'text-slate-400'}`}>
                                            {msg.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-brand-500" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 flex gap-1 items-center">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Disclaimer */}
                        <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/10 text-[10px] text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1 border-t border-amber-100 dark:border-amber-800/20">
                            <AlertTriangle className="w-3 h-3" />
                            <span>AI info only. Not medical advice.</span>
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                            <div className="relative flex items-center gap-2">
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a health question..."
                                    className="flex-1 bg-slate-100 dark:bg-slate-900 border-none rounded-xl py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-brand-500 dark:text-white"
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading}
                                    className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-brand-500/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};
