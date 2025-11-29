
import React, { useState, useCallback } from 'react';
import { useAgent } from '../contexts/AgentContext';
import { Card, Button, Badge } from './Common';
import { 
    FileText, Upload, BrainCircuit, CheckCircle2, AlertTriangle, 
    Clock, File, Mic, MessageSquare, Scan, Activity, X 
} from 'lucide-react';

export const MedicalAgentPanel: React.FC = () => {
    const { processDocument, processTranscript, documents, medicalMemory, isThinking } = useAgent();
    const [activeTab, setActiveTab] = useState<'docs' | 'memory'>('docs');
    const [transcriptInput, setTranscriptInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsProcessing(true);
            processDocument(e.target.files[0]).finally(() => setIsProcessing(false));
        }
    };

    const handleTranscriptSubmit = () => {
        if (transcriptInput.trim()) {
            setIsProcessing(true);
            processTranscript(transcriptInput).finally(() => {
                setIsProcessing(false);
                setTranscriptInput('');
            });
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800 text-white overflow-hidden flex flex-col shadow-2xl h-full min-h-[500px]">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-900/50 to-slate-900 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                        <BrainCircuit className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-tight">Medical Intelligence Core</h3>
                        <p className="text-xs text-slate-400">Autonomous Document Handler & Memory Agent</p>
                    </div>
                </div>
                {isThinking && (
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-900/50 animate-pulse">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        PROCESSING...
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800">
                <button 
                    onClick={() => setActiveTab('docs')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'docs' ? 'bg-slate-800 text-white border-b-2 border-indigo-500' : 'text-slate-500 hover:bg-slate-800/50'}`}
                >
                    <FileText className="w-4 h-4 inline-block mr-2 -mt-0.5" /> Document Agent
                </button>
                <button 
                    onClick={() => setActiveTab('memory')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'memory' ? 'bg-slate-800 text-white border-b-2 border-indigo-500' : 'text-slate-500 hover:bg-slate-800/50'}`}
                >
                    <Activity className="w-4 h-4 inline-block mr-2 -mt-0.5" /> Conversation Memory
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-950">
                
                {/* DOCUMENT HANDLER TAB */}
                {activeTab === 'docs' && (
                    <div className="space-y-6">
                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 text-center hover:bg-slate-900/50 transition-colors relative group">
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleFileUpload}
                                disabled={isProcessing}
                            />
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {isProcessing ? <Scan className="w-8 h-8 text-indigo-400 animate-pulse" /> : <Upload className="w-8 h-8 text-indigo-400" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-200">Upload Reports or Prescriptions</h4>
                                    <p className="text-xs text-slate-500 mt-1">AI autonomously reads, tags, and extracts action items.</p>
                                </div>
                            </div>
                        </div>

                        {/* Document List */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Analysis</h4>
                            {documents.length === 0 && (
                                <p className="text-slate-600 text-sm italic text-center py-4">No documents processed yet.</p>
                            )}
                            {documents.map(doc => (
                                <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-in slide-in-from-left-2">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-800 rounded text-slate-400">
                                                <File className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-sm text-slate-200">{doc.name}</h5>
                                                <p className="text-[10px] text-slate-500">{new Date(doc.dateUploaded).toLocaleTimeString()} • {doc.type.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <Badge variant={doc.status === 'processed' ? 'success' : doc.status === 'error' ? 'danger' : 'warning'}>
                                            {doc.status}
                                        </Badge>
                                    </div>
                                    
                                    {doc.summary && (
                                        <div className="bg-slate-950/50 p-3 rounded-lg mb-3 border border-slate-800/50">
                                            <p className="text-xs text-slate-300 italic">"{doc.summary}"</p>
                                        </div>
                                    )}

                                    {doc.abnormalities.length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                            {doc.abnormalities.map((abn, i) => (
                                                <span key={i} className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] rounded border border-red-500/20 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> {abn}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CONVERSATION MEMORY TAB */}
                {activeTab === 'memory' && (
                    <div className="space-y-6">
                        {/* Input Area */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Add Doctor's Voice Note / Text</label>
                            <div className="flex gap-2">
                                <textarea 
                                    className="flex-1 bg-black/30 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none h-20"
                                    placeholder="Paste transcript or type notes here..."
                                    value={transcriptInput}
                                    onChange={e => setTranscriptInput(e.target.value)}
                                ></textarea>
                                <div className="flex flex-col gap-2">
                                    <button onClick={handleTranscriptSubmit} disabled={isProcessing} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex-1 flex items-center justify-center">
                                        <BrainCircuit className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg flex-1 flex items-center justify-center">
                                        <Mic className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative border-l border-slate-800 ml-3 space-y-6 pb-4">
                            {medicalMemory.length === 0 && (
                                <p className="text-slate-600 text-sm italic pl-6">Memory empty. AI waiting for input.</p>
                            )}
                            {medicalMemory.map(mem => (
                                <div key={mem.id} className="relative pl-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                                        mem.type === 'medication' ? 'bg-emerald-500' : 
                                        mem.type === 'instruction' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}></div>
                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 hover:border-slate-700 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                                mem.type === 'medication' ? 'bg-emerald-900/30 text-emerald-400' : 
                                                mem.type === 'instruction' ? 'bg-amber-900/30 text-amber-400' : 'bg-blue-900/30 text-blue-400'
                                            }`}>
                                                {mem.type}
                                            </span>
                                            <span className="text-[10px] text-slate-500">{new Date(mem.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 font-medium leading-relaxed">{mem.detail}</p>
                                        <div className="mt-2 pt-2 border-t border-slate-800/50 flex justify-between items-center">
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Detected automatically
                                            </span>
                                            <div className="flex gap-2">
                                                <button className="text-[10px] text-slate-400 hover:text-white transition-colors">Edit</button>
                                                <button className="text-[10px] text-slate-400 hover:text-red-400 transition-colors">Ignore</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};
