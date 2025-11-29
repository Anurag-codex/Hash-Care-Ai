
import React, { useState } from 'react';
import { useFleet } from '../contexts/FleetContext';
import { GoogleMapFleet } from '../components/GoogleMapFleet';
import { Card, Button, Badge } from '../components/Common';
import { 
    Ambulance as AmbIcon, Zap, AlertOctagon, 
    Navigation, BrainCircuit, Activity, Radio, CheckCircle2, Siren, MapPin,
    User, Star, Clock
} from 'lucide-react';
import { DispatchJob } from '../types';
import { AgentWorkflow } from '../components/AgentWorkflow';

export const AmbulanceCommand: React.FC = () => {
    const { ambulances, drivers, activeJobs, dispatchAmbulance, addJob } = useFleet();
    const [incomingCallText, setIncomingCallText] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [suggestedDispatch, setSuggestedDispatch] = useState<{ job: DispatchJob, ambulanceId: string } | null>(null);

    // Calculate Fleet Center for Map
    const validAmbulances = ambulances.filter(a => a.location && a.location.lat);
    const fleetCenter = validAmbulances.length > 0 
        ? { 
            lat: validAmbulances.reduce((acc, cur) => acc + cur.location.lat, 0) / validAmbulances.length,
            lng: validAmbulances.reduce((acc, cur) => acc + cur.location.lng, 0) / validAmbulances.length
          } 
        : { lat: 28.6139, lng: 77.2090 };

    const handleAIAnalyze = () => {
        if (!incomingCallText) return;
        setAnalyzing(true);
        
        // Simulate AI Processing
        setTimeout(() => {
            const newJob: DispatchJob = {
                id: `JOB-${Date.now()}`,
                patientLocation: { lat: 28.61 + (Math.random()-0.5)*0.03, lng: 77.21 + (Math.random()-0.5)*0.03, address: "Detected via NLP" },
                severity: "Critical",
                status: "Pending",
                timestamp: new Date(),
                description: incomingCallText
            };

            const nearestAmb = ambulances.find(a => a.status === 'Available');

            if (nearestAmb) {
                setSuggestedDispatch({ job: newJob, ambulanceId: nearestAmb.id });
            } else {
                addJob(newJob);
            }
            setAnalyzing(false);
            setIncomingCallText("");
        }, 1500);
    };

    const confirmDispatch = () => {
        if (suggestedDispatch) {
            dispatchAmbulance(suggestedDispatch.job, suggestedDispatch.ambulanceId);
            setSuggestedDispatch(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Main Command Interface */}
            <div className="relative h-[600px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
                
                {/* Top HUD Bar */}
                <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <div className="bg-slate-900/80 backdrop-blur px-4 py-1.5 rounded-full border border-slate-700 flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <AmbIcon className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold text-white">{ambulances.filter(a => a.status === 'Available').length} Ready</span>
                            </div>
                            <div className="w-px h-3 bg-slate-600"></div>
                            <div className="flex items-center gap-2">
                                <AlertOctagon className="w-4 h-4 text-red-500" />
                                <span className="text-xs font-bold text-white">{activeJobs.filter(j => j.status !== 'Completed').length} Active</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* AI Status */}
                    <div className="bg-indigo-950/80 backdrop-blur px-4 py-1.5 rounded-full border border-indigo-500/30 flex items-center gap-2 pointer-events-auto">
                        <BrainCircuit className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-mono font-bold text-indigo-200">DISPATCH AI: {analyzing ? 'ANALYZING...' : 'ONLINE'}</span>
                    </div>
                </div>

                {/* Map Layer */}
                <div className="absolute inset-0 z-0">
                    <GoogleMapFleet 
                        ambulances={ambulances} 
                        jobs={activeJobs} 
                        center={fleetCenter} 
                        zoom={14} 
                    />
                </div>

                {/* Minimal Overlay Grid */}
                <div className="absolute inset-0 z-10 pointer-events-none flex">
                    {/* Left Side: Fleet List */}
                    <div className="w-80 h-full p-4 flex flex-col justify-center pointer-events-none">
                        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden pointer-events-auto max-h-[500px] flex flex-col shadow-2xl">
                            <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fleet Status</h3>
                                <span className="text-[9px] text-slate-500 font-mono">{ambulances.length} UNITS</span>
                            </div>
                            <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                {ambulances.map(amb => {
                                    const driver = drivers.find(d => d.id === amb.driverId);
                                    return (
                                        <div key={amb.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-[11px] font-mono font-bold text-white">{amb.plateNumber}</p>
                                                    <p className="text-[9px] text-slate-500">{amb.type} UNIT</p>
                                                </div>
                                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                    amb.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    amb.status === 'Dispatched' ? 'bg-red-500/10 text-red-400' :
                                                    'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                                        amb.status === 'Available' ? 'bg-emerald-500' :
                                                        amb.status === 'Dispatched' ? 'bg-red-500 animate-pulse' :
                                                        'bg-amber-500'
                                                    }`}></div>
                                                    {amb.status}
                                                </div>
                                            </div>
                                            
                                            {/* Driver Info */}
                                            <div className="flex items-center gap-3 pt-2 border-t border-slate-800/50">
                                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <User className="w-3 h-3" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-300 truncate">{driver?.name || 'Unassigned'}</p>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-2 h-2 text-yellow-500 fill-yellow-500" />
                                                        <span className="text-[9px] text-slate-500">{driver?.rating.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                                {/* Fatigue Alert if rating drops or status is break */}
                                                {(driver?.status === 'Break' || (driver?.rating || 5) < 4.0) && (
                                                    <div className="flex items-center gap-1 text-[9px] text-orange-400 font-bold bg-orange-950/30 px-1.5 py-0.5 rounded border border-orange-900/50">
                                                        <Clock className="w-2 h-2" /> Fatigue
                                                    </div>
                                                )}
                                            </div>

                                            {/* Telemetry */}
                                            <div className="mt-2 grid grid-cols-2 gap-2">
                                                <div className="bg-slate-950 rounded p-1 text-center">
                                                    <span className="text-[9px] text-slate-500 block">SPEED</span>
                                                    <span className="text-[10px] font-mono text-white">{Math.round(amb.speed)} km/h</span>
                                                </div>
                                                <div className="bg-slate-950 rounded p-1 text-center relative overflow-hidden">
                                                    <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-500" style={{width: `${amb.fuelLevel}%`}}></div>
                                                    <span className="text-[9px] text-slate-500 block">FUEL</span>
                                                    <span className="text-[10px] font-mono text-white">{Math.round(amb.fuelLevel)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1"></div>

                    {/* Right Side: Dispatcher */}
                    <div className="w-80 h-full p-4 flex flex-col justify-center pointer-events-none">
                        <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden pointer-events-auto flex flex-col shadow-2xl">
                            
                            {/* Active Alert Card (Dynamic) */}
                            {suggestedDispatch ? (
                                <div className="p-4 bg-indigo-950/30 border-b border-indigo-500/20 animate-in slide-in-from-right-10">
                                    <div className="flex items-center gap-2 mb-3 text-indigo-400">
                                        <Siren className="w-5 h-5 animate-pulse" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Dispatch Recommended</span>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Incident</span>
                                            <span className="text-white font-medium text-right">{suggestedDispatch.job.description}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Nearest Unit</span>
                                            <span className="text-emerald-400 font-mono">{ambulances.find(a => a.id === suggestedDispatch.ambulanceId)?.plateNumber}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Est. Arrival</span>
                                            <span className="text-white font-mono">3 mins</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => setSuggestedDispatch(null)} className="py-2 rounded bg-slate-800 text-[10px] font-bold text-slate-400 hover:bg-slate-700">DISMISS</button>
                                        <button onClick={confirmDispatch} className="py-2 rounded bg-emerald-600 text-[10px] font-bold text-white hover:bg-emerald-500">CONFIRM SEND</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Emergency Input Stream</label>
                                    <div className="relative">
                                        <textarea 
                                            className="w-full bg-black/50 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none h-20 font-mono"
                                            placeholder="Type incident details (e.g., 'Cardiac arrest at Sector 4')..."
                                            value={incomingCallText}
                                            onChange={e => setIncomingCallText(e.target.value)}
                                        ></textarea>
                                        <div className="absolute bottom-2 right-2">
                                            <button 
                                                onClick={handleAIAnalyze}
                                                disabled={analyzing || !incomingCallText}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-md disabled:opacity-50 transition-colors"
                                            >
                                                <BrainCircuit className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Live Jobs List */}
                            <div className="flex-1 overflow-y-auto p-4 border-t border-slate-800">
                                <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Recent Incidents</h4>
                                <div className="space-y-2">
                                    {activeJobs.slice(0, 4).map(job => (
                                        <div key={job.id} className="flex items-start gap-3 p-2 rounded bg-slate-900/50 border border-slate-800/50">
                                            <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${job.status === 'Completed' ? 'bg-slate-600' : 'bg-blue-500 animate-pulse'}`}></div>
                                            <div>
                                                <p className="text-[10px] text-slate-300 leading-tight">{job.description}</p>
                                                <p className="text-[9px] text-slate-500 font-mono mt-0.5">{job.status} • {job.eta || 'Calculating...'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agent Workflow Visualization */}
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-700">
                <AgentWorkflow />
            </div>
        </div>
    );
};
