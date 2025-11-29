
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge, Avatar } from '../components/Common';
import { 
  ShieldAlert, Radio, Activity, MapPin, Lock, Zap, 
  Siren, UserCheck, Stethoscope, ChevronRight, AlertTriangle, 
  CheckCircle2, Loader2, Wifi, Send, Unlock, ArrowRight,
  Fingerprint, Navigation, PhoneOff, BrainCircuit
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useAgent } from '../contexts/AgentContext';

type EmergencyState = 'standby' | 'activating' | 'searching' | 'active' | 'resolved';

export const EmergencySOS: React.FC = () => {
  const { user } = useUser();
  const { triggerScenario, addThought } = useAgent();
  const [status, setStatus] = useState<EmergencyState>('standby');
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(180); // seconds
  const [actionsLog, setActionsLog] = useState<string[]>([]);
  const holdInterval = useRef<any>(null);

  // Countdown timer for ETA
  useEffect(() => {
    let timer: any;
    if (status === 'active' && eta > 0) {
        timer = setInterval(() => setEta(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [status, eta]);

  // Simulated AI Actions
  useEffect(() => {
      if (status === 'searching') {
          triggerScenario('SOS'); // Trigger the Agent Brain
          
          // Enhanced AI Responder Sequence
          const searchSequence = [
              { t: 500, m: 'Agent: Initiating Critical Distress Protocol Omega...' },
              { t: 1500, m: 'Agent: Triangulating precise GPS location (Accuracy: 3m)...' },
              { t: 2500, m: 'Agent: Broadcasting biometric distress packet (HR: 125, BP: 160/95)...' },
              { t: 3500, m: 'Agent: Querying nearby Emergency Room capacity...' },
              { t: 4500, m: 'Network: City General Hospital (1.2km) - ER Full / Wait > 45m.' },
              { t: 6000, m: 'Network: Apollo Trauma Center (2.4km) - Trauma Team Available.' },
              { t: 7000, m: 'Agent: Selecting Apollo Trauma. Routing high-priority request...' },
              { t: 8000, m: 'Network: Dispatch Center Handshake Successful.' },
          ];

          searchSequence.forEach(step => {
              setTimeout(() => addLog(step.m), step.t);
          });

          setTimeout(() => {
              setStatus('active');
              addLog('Network: Responder Assigned - Dr. Anjali Sharma (Apollo Trauma)');
          }, 9500);
      }

      if (status === 'active') {
          const activeSequence = [
              { t: 1000, m: 'Agent: Unlocking Main Entrance Smart Lock [Front_Door]...' },
              { t: 3000, m: 'Agent: Overriding Elevator B control - Recalling to Ground Floor...' },
              { t: 5000, m: 'Agent: Transmitting Medical History & Allergy Profile to Paramedics...' },
              { t: 7000, m: 'Agent: Alerting Emergency Contact (Priya Verma) with live tracking...' },
              { t: 9000, m: 'Agent: Secure Audio Link established with Ambulance.' }
          ];

          activeSequence.forEach(step => {
              setTimeout(() => addLog(step.m), step.t);
          });
      }
  }, [status]);

  const addLog = (msg: string) => {
      setActionsLog(prev => [msg, ...prev]);
  };

  const startActivation = () => {
      if (status !== 'standby') return;
      
      let p = 0;
      holdInterval.current = setInterval(() => {
          p += 2; 
          setProgress(p);
          if (p >= 100) {
              clearInterval(holdInterval.current);
              setStatus('searching');
              setProgress(0);
          }
      }, 20); 
  };

  const cancelActivation = () => {
      if (status === 'active' || status === 'searching') return;
      clearInterval(holdInterval.current);
      setProgress(0);
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-[calc(100vh-8rem)] relative flex flex-col items-center justify-center">
        
        {/* State: Standby */}
        {status === 'standby' && (
            <div className="flex flex-col items-center justify-between h-full w-full py-8 animate-in fade-in zoom-in duration-500">
                
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Emergency Sentinel</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-brand-500" />
                        AI Guardian Active
                    </p>
                </div>

                {/* Main Button */}
                <div className="relative">
                    {/* Pulsing Background - Minimal */}
                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-20"></div>
                    
                    <button
                        className="relative w-64 h-64 rounded-full bg-white dark:bg-slate-800 shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-transform active:scale-95 group border-4 border-slate-100 dark:border-slate-700"
                        onMouseDown={startActivation}
                        onMouseUp={cancelActivation}
                        onMouseLeave={cancelActivation}
                        onTouchStart={startActivation}
                        onTouchEnd={cancelActivation}
                        style={{ userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
                    >
                        {/* Progress Fill Background */}
                        <div 
                            className="absolute bottom-0 left-0 w-full bg-red-500 transition-all duration-75 ease-linear opacity-10"
                            style={{ height: `${progress}%` }}
                        />
                        <div 
                            className="absolute bottom-0 left-0 w-full bg-red-500 transition-all duration-75 ease-linear mix-blend-overlay"
                            style={{ height: `${progress}%` }}
                        />

                        {/* Icon & Text */}
                        <div className="relative z-10 flex flex-col items-center gap-2 pointer-events-none">
                            <Fingerprint className={`w-20 h-20 transition-colors duration-200 ${progress > 0 ? 'text-red-500 scale-110' : 'text-slate-300 dark:text-slate-600'}`} />
                            <span className={`text-2xl font-black tracking-widest transition-colors duration-200 ${progress > 0 ? 'text-red-500' : 'text-slate-300 dark:text-slate-600'}`}>
                                SOS
                            </span>
                        </div>
                    </button>
                    <p className="text-center text-xs font-bold text-slate-400 mt-6 uppercase tracking-widest">Hold to Activate</p>
                </div>

                {/* Footer Badges - Minimal */}
                <div className="flex gap-4 opacity-50">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <MapPin className="w-4 h-4" /> Auto-Locate
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <Lock className="w-4 h-4" /> Smart Unlock
                    </div>
                </div>
            </div>
        )}

        {/* State: Searching / Activating */}
        {(status === 'searching' || status === 'activating') && (
             <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto animate-in zoom-in duration-300 w-full">
                <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 relative">
                    <span className="absolute inset-0 rounded-full border-4 border-red-500/30 animate-ping"></span>
                    <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Agent Activating</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Coordinating emergency protocols...</p>
                
                <div className="w-full space-y-3 h-64 overflow-y-auto pr-2">
                     {actionsLog.map((log, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 animate-in slide-in-from-bottom-2 fade-in">
                            <BrainCircuit className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                            <span className="text-slate-700 dark:text-slate-300 font-medium text-left leading-relaxed">{log}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

         {/* State: Active */}
         {status === 'active' && (
            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-500 px-4 h-full py-4">
                 <div className="space-y-4 flex flex-col justify-center">
                    <Card className="bg-red-500 text-white border-none shadow-xl overflow-hidden relative">
                         <div className="p-8 text-center">
                            <div className="animate-pulse mb-2 inline-block p-3 bg-white/20 rounded-full"><Siren className="w-8 h-8 text-white"/></div>
                            <h2 className="text-5xl font-black mb-1">{formatTime(eta)}</h2>
                            <p className="text-red-100 font-medium text-lg">Responder Arrival</p>
                         </div>
                    </Card>
                    <Card className="p-4 flex items-center gap-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <Avatar name="Dr. Anjali Sharma" size="lg" />
                        <div>
                             <h3 className="font-bold text-slate-800 dark:text-white text-lg">Dr. Anjali Sharma</h3>
                             <p className="text-sm text-brand-600 dark:text-brand-400">Cardiologist • Apollo Trauma</p>
                        </div>
                        <Button size="sm" variant="secondary" className="ml-auto rounded-full w-10 h-10 p-0"><PhoneOff className="w-4 h-4 text-slate-400"/></Button>
                    </Card>
                 </div>

                 <div className="flex flex-col h-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                     <div className="p-4 bg-slate-950/50 flex items-center justify-between border-b border-slate-800">
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-2"><Wifi className="w-3 h-3"/> AGENT LINK</span>
                        <span className="text-xs text-slate-500">Autonomous Mode</span>
                     </div>
                     <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        {actionsLog.map((log, i) => (
                                <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                                    <div className="w-1 h-full bg-slate-800 mx-auto relative"><div className="w-2 h-2 bg-blue-500 rounded-full absolute -left-0.5 top-0"></div></div>
                                    <div className="pb-4 flex-1">
                                        <div className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-start gap-2">
                                            {log.includes('Agent') && <BrainCircuit className="w-3 h-3 text-brand-400 mt-1 shrink-0" />}
                                            {log.includes('Network') && <Wifi className="w-3 h-3 text-emerald-400 mt-1 shrink-0" />}
                                            <span className="leading-relaxed">{log}</span>
                                        </div>
                                    </div>
                                </div>
                        ))}
                     </div>
                     <div className="p-4">
                        <button onClick={() => setStatus('resolved')} className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">I am Safe</button>
                     </div>
                 </div>
            </div>
         )}
         
         {/* State: Resolved */}
         {status === 'resolved' && (
             <div className="flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                 <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                     <CheckCircle2 className="w-10 h-10" />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Emergency Resolved</h2>
                 <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs">All systems normalized. Incident report has been filed and sent to your doctor.</p>
                 <Button onClick={() => { setStatus('standby'); setEta(180); setActionsLog([]); }} className="mt-4">Back to Safety</Button>
             </div>
         )}

    </div>
  );
};
