
import React from 'react';
import { Activity, BrainCircuit, Database, Zap, ArrowRight, MessageSquare, Shield, Server, Wifi } from 'lucide-react';
import { Card } from './Common';

export const AgentWorkflow: React.FC = () => {
  return (
    <Card className="bg-slate-950 border-slate-800 text-slate-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 opacity-50"></div>
      
      <div className="p-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                    Agentic AI Workflow
                </h3>
                <p className="text-xs text-slate-500 mt-1">Real-time data processing pipeline visualization</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                SYSTEM ACTIVE
            </div>
        </div>

        <div className="relative">
            {/* Connection Lines (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                {/* Stage 1: Ingestion */}
                <div className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center relative shadow-lg group-hover:border-blue-500 transition-colors">
                        <Activity className="w-8 h-8 text-blue-500" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                    </div>
                    <div className="text-center">
                        <h4 className="font-bold text-white text-sm">Data Ingestion</h4>
                        <p className="text-[10px] text-slate-500 mt-1">IoT Sensors • Vitals • Env</p>
                        <div className="mt-2 text-[10px] font-mono text-blue-400 bg-blue-900/10 px-2 py-0.5 rounded border border-blue-900/30 inline-block">
                            Raw Stream
                        </div>
                    </div>
                </div>

                {/* Stage 2: Processing (The Brain) */}
                <div className="flex flex-col items-center gap-4 group">
                     <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-purple-500/50 flex items-center justify-center relative shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform duration-500">
                        <BrainCircuit className="w-10 h-10 text-purple-400" />
                        {/* Orbiting particles */}
                        <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-purple-500/30"></div>
                    </div>
                    <div className="text-center">
                        <h4 className="font-bold text-white text-sm">Gemini AI Core</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Context Analysis • RAG</p>
                        <div className="mt-2 text-[10px] font-mono text-purple-400 bg-purple-900/10 px-2 py-0.5 rounded border border-purple-900/30 inline-block">
                            Inference
                        </div>
                    </div>
                </div>

                {/* Stage 3: Decision */}
                <div className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center relative shadow-lg group-hover:border-amber-500 transition-colors">
                        <Server className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="text-center">
                        <h4 className="font-bold text-white text-sm">Decision Engine</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Rule Matching • Safety Checks</p>
                        <div className="mt-2 text-[10px] font-mono text-amber-400 bg-amber-900/10 px-2 py-0.5 rounded border border-amber-900/30 inline-block">
                            Logic Layer
                        </div>
                    </div>
                </div>

                 {/* Stage 4: Execution */}
                 <div className="flex flex-col items-center gap-4 group">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center relative shadow-lg group-hover:border-emerald-500 transition-colors">
                        <Zap className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="text-center">
                        <h4 className="font-bold text-white text-sm">Action Execution</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Alerts • Smart Home • Reports</p>
                        <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-900/10 px-2 py-0.5 rounded border border-emerald-900/30 inline-block">
                            Outcome
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Arrows */}
            <div className="md:hidden flex flex-col items-center gap-2 py-4 absolute inset-0 pointer-events-none opacity-20">
                <ArrowRight className="rotate-90" />
                <ArrowRight className="rotate-90 mt-24" />
                <ArrowRight className="rotate-90 mt-24" />
            </div>
        </div>

        {/* Live Data Packets Animation (Simplified for React) */}
        <div className="mt-12 bg-slate-900/50 rounded-xl p-3 border border-slate-800 flex justify-between items-center font-mono text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
                <Wifi className="w-3 h-3 text-slate-500" />
                <span>Last Packet: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
                <span>Latency: 12ms</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
        </div>
      </div>
    </Card>
  );
};
