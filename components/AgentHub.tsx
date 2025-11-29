
import React, { useEffect, useRef } from 'react';
import { useAgent } from '../contexts/AgentContext';
import { BrainCircuit, Activity, Zap, Shield, Truck, Check, X, Play, Cpu, Terminal } from 'lucide-react';
import { Card } from './Common';

export const AgentHub: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { thoughts, actions, isThinking, activeAgents, executeAction, rejectAction } = useAgent();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll thoughts
  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
      }
  }, [thoughts]);

  const getIcon = (cat: string) => {
      switch (cat) {
          case 'Health': return <Activity className="w-4 h-4 text-rose-500" />;
          case 'Logistics': return <Truck className="w-4 h-4 text-amber-500" />;
          case 'Security': return <Shield className="w-4 h-4 text-red-500" />;
          case 'Environment': return <Zap className="w-4 h-4 text-cyan-500" />;
          default: return <BrainCircuit className="w-4 h-4 text-brand-500" />;
      }
  };

  return (
    <div className="h-full flex flex-col rounded-3xl overflow-hidden bg-[#0a0a0a] border border-slate-800 shadow-2xl relative group">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50"></div>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-900 bg-[#0f0f0f] flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${isThinking ? 'shadow-[0_0_15px_rgba(45,212,191,0.3)]' : ''}`}>
                    <Cpu className={`w-5 h-5 ${isThinking ? 'text-brand-400 animate-pulse' : 'text-slate-500'}`} />
                </div>
                <div>
                    <h3 className="font-mono text-sm font-bold text-white tracking-wider">NEURAL CORE</h3>
                    <div className="flex gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                        {activeAgents.slice(0, 2).map((a, i) => (
                            <span key={i} className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {a}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Live Status Indicator */}
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold font-mono tracking-widest ${isThinking ? 'text-brand-400' : 'text-slate-500'}`}>
                        {isThinking ? 'COMPUTING...' : 'STANDBY'}
                    </span>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isThinking ? 'bg-brand-400' : 'bg-slate-700'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isThinking ? 'bg-brand-500' : 'bg-slate-600'}`}></span>
                    </span>
                </div>
            </div>
        </div>

        {/* Pending Actions (High Priority Overlay) */}
        {actions.filter(a => a.status === 'pending').length > 0 && (
            <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 p-3 space-y-2 animate-in slide-in-from-top-2 z-20">
                <div className="flex items-center justify-between">
                     <h4 className="text-[10px] font-bold text-brand-400 uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="w-3 h-3" /> Protocol Request
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">{actions.length} Pending</span>
                </div>
               
                {actions.filter(a => a.status === 'pending').map(action => (
                    <div key={action.id} className="bg-black border border-slate-700 rounded-lg p-3 shadow-lg relative overflow-hidden group/action">
                        {/* Progress Bar for Auto-Execute */}
                        {action.autoExecuteIn && (
                            <div className="absolute bottom-0 left-0 h-0.5 bg-slate-800 w-full">
                                <div className="h-full bg-brand-500 animate-[width_3s_linear_infinite]" style={{width: '100%'}}></div>
                            </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-1">
                            <h5 className="font-bold text-white text-xs font-mono">{action.title}</h5>
                            <span className="text-[9px] bg-brand-500/10 text-brand-400 px-1.5 py-0.5 rounded uppercase border border-brand-500/20">{action.type}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">{action.description}</p>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => executeAction(action.id)}
                                className="flex-1 bg-white hover:bg-slate-200 text-black text-[10px] font-bold py-2 rounded flex items-center justify-center gap-1 transition-all active:scale-95"
                            >
                                <Play className="w-3 h-3 fill-current" /> EXECUTE
                            </button>
                            <button 
                                onClick={() => rejectAction(action.id)}
                                className="px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-[10px] font-bold py-2 rounded transition-all active:scale-95"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Neural Stream (Logs) */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#050505] relative">
             {/* Scanline Effect */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>

             <div className="p-2 border-b border-slate-900 bg-[#0a0a0a] flex justify-between items-center z-10">
                 <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-2">Neural Stream</h4>
                 <div className="flex gap-1">
                     <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                     <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                     <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                 </div>
             </div>
             
             <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs scroll-smooth z-10">
                 {thoughts.length === 0 && (
                     <div className="text-slate-500 text-center mt-10 text-[10px]">INITIALIZING NEURAL NET...</div>
                 )}
                 {thoughts.map((thought) => (
                     <div key={thought.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300 group hover:bg-slate-900/30 p-2 rounded -mx-2">
                         <div className="mt-0.5 opacity-90 shrink-0">{getIcon(thought.category)}</div>
                         <div className="min-w-0">
                             <div className="flex items-center gap-2 mb-1">
                                 <span className="text-[10px] text-slate-500 font-bold">{thought.timestamp.toLocaleTimeString([], {hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span>
                                 <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">[{thought.category}]</span>
                             </div>
                             <p className="text-white leading-relaxed text-[12px] font-medium transition-opacity">
                                 {thought.text}
                                 {thought.status === 'thinking' && (
                                     <span className="inline-block w-1.5 h-3 bg-brand-500 ml-1 animate-pulse align-middle"></span>
                                 )}
                             </p>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    </div>
  );
};
