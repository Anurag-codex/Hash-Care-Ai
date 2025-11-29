
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Badge, Button, Avatar } from '../components/Common';
import { 
  Users, Bed, Activity, DollarSign, AlertTriangle, Clock, Plus, Pill, 
  TrendingUp, TrendingDown, Stethoscope, HeartPulse, ShieldAlert,
  ArrowRight, FileText, CheckCircle, ChevronDown, List, History, UserPlus, Zap,
  BarChart2, Flame, AlertOctagon, BrainCircuit, Radar, Layers
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useHospital } from '../contexts/HospitalContext';
import { useAgent } from '../contexts/AgentContext';
import { AgentHub } from '../components/AgentHub';
import { AgentWorkflow } from '../components/AgentWorkflow';
import { Page } from '../types';

const admissionData = [
  { time: 'Mon', admissions: 24, discharges: 18 },
  { time: 'Tue', admissions: 30, discharges: 22 },
  { time: 'Wed', admissions: 45, discharges: 35 },
  { time: 'Thu', admissions: 32, discharges: 28 },
  { time: 'Fri', admissions: 50, discharges: 42 },
  { time: 'Sat', admissions: 38, discharges: 30 },
  { time: 'Sun', admissions: 20, discharges: 15 },
];

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; noPadding?: boolean; onClick?: () => void }> = ({ children, className = '', noPadding = false, onClick }) => (
  <div onClick={onClick} className={`bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700 shadow-lg rounded-2xl overflow-hidden transition-all hover:scale-[1.01] ${className}`}>
    <div className={noPadding ? '' : 'p-6'}>
      {children}
    </div>
  </div>
);

interface HospitalDashboardProps {
  onNavigate?: (page: Page) => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ onNavigate }) => {
  const { staff, beds, inventory, alerts, erQueue, departmentMetrics } = useHospital();
  const { triggerScenario } = useAgent();
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- Computed Stats ---
  const doctorsOnDuty = staff.filter(s => s.role === 'Doctor' && s.status === 'On Duty').length;
  const bedsAvailable = beds.filter(b => b.status === 'Available').length;
  const totalBeds = beds.length;
  const occupancyRate = Math.round(((totalBeds - bedsAvailable) / totalBeds) * 100);
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

   useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">Command Center</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2 text-lg">
               <BrainCircuit className="w-5 h-5 text-brand-500" /> AI-Orchestrated Hospital Operations
           </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <div className="text-3xl font-mono font-bold text-slate-800 dark:text-white tracking-widest leading-none">
                 {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </div>
            <div className="flex items-center gap-3 mt-2">
                <Button 
                    size="sm" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                    onClick={() => triggerScenario('StaffBurnout')}
                >
                    Simulate Surge
                </Button>
                <Button 
                    size="sm" 
                    icon={Plus} 
                    className="bg-slate-900 text-white dark:bg-white dark:text-slate-900" 
                    onClick={() => onNavigate && onNavigate(Page.BED_ALLOCATION)}
                >
                    Admit Patient
                </Button>
            </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Agent & Triage (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
              {/* Agent Hub */}
              <div className="h-[400px]">
                  <AgentHub />
              </div>

              {/* Live ER Triage Feed */}
              <GlassCard className="border-t-4 border-t-rose-500" noPadding>
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-rose-50 dark:bg-rose-900/10 flex justify-between items-center">
                      <h3 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                          <AlertOctagon className="w-5 h-5" /> Live ER Triage
                      </h3>
                      <Badge variant="danger" className="animate-pulse">Active</Badge>
                  </div>
                  <div className="p-0">
                      {erQueue.map((patient, i) => (
                          <div key={patient.id} className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${i === erQueue.length - 1 ? 'border-0' : ''}`}>
                              <div className="flex justify-between items-start mb-1">
                                  <span className="font-mono text-xs font-bold text-slate-400">{patient.time}</span>
                                  <div className={`text-xs font-bold px-2 py-0.5 rounded ${
                                      patient.aiSeverity >= 8 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                      Severity: {patient.aiSeverity}/10
                                  </div>
                              </div>
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-0.5">{patient.predictedDiagnosis}</h4>
                              <p className="text-xs text-slate-500 truncate">{patient.symptoms}</p>
                              <div className="mt-2 flex gap-2">
                                  <Button size="sm" className="h-7 text-xs px-2 py-0" variant="outline">View Vitals</Button>
                                  <Button size="sm" className="h-7 text-xs px-2 py-0">Admit</Button>
                              </div>
                          </div>
                      ))}
                  </div>
              </GlassCard>
          </div>

          {/* RIGHT COLUMN: Stats & Analytics (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
              
              {/* Top Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Occupancy */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white shadow-xl group cursor-pointer" onClick={() => onNavigate && onNavigate(Page.BED_ALLOCATION)}>
                      <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-3xl transition-transform duration-500 group-hover:scale-150"></div>
                      <div className="relative z-10">
                          <div className="mb-4 flex items-center justify-between">
                              <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                  <Bed className="h-6 w-6 text-white" />
                              </div>
                              <Badge className="border-0 bg-white/20 text-white backdrop-blur-sm">{occupancyRate}% Full</Badge>
                          </div>
                          <h3 className="mb-1 text-3xl font-bold">{totalBeds - bedsAvailable} <span className="text-lg font-normal opacity-70">/ {totalBeds}</span></h3>
                          <p className="text-sm font-medium text-blue-100">Total Occupancy</p>
                      </div>
                  </div>

                  {/* Active Staff */}
                  <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg border border-slate-200 dark:border-slate-700 group cursor-pointer" onClick={() => onNavigate && onNavigate(Page.STAFF_MANAGEMENT)}>
                      <div className="mb-4 flex items-center justify-between">
                          <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2 text-emerald-600 dark:text-emerald-400">
                              <Users className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-1 rounded-full flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Optimal
                          </span>
                      </div>
                      <h3 className="mb-1 text-3xl font-bold text-slate-800 dark:text-white">{doctorsOnDuty}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Doctors On Duty</p>
                  </div>

                  {/* Critical Alerts */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 p-6 text-white shadow-xl">
                      <div className="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
                      <div className="relative z-10">
                          <div className="mb-4 flex items-center justify-between">
                              <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm animate-pulse">
                                  <AlertTriangle className="h-6 w-6 text-white" />
                              </div>
                              <Badge className="border-0 bg-white text-rose-600">{criticalAlerts} Critical</Badge>
                          </div>
                          <h3 className="mb-1 text-3xl font-bold">{alerts.length}</h3>
                          <p className="text-sm font-medium text-rose-100">Active Incidents</p>
                      </div>
                  </div>
              </div>

              {/* Resource Heatmap & Efficiency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Resource Heatmap */}
                  <GlassCard>
                      <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                          <Flame className="w-5 h-5 text-orange-500" /> Resource Heatmap
                      </h3>
                      <div className="space-y-4">
                          {departmentMetrics.map(dept => (
                              <div key={dept.name} className="space-y-1">
                                  <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                                      <span>{dept.name}</span>
                                      <span className={`${dept.load > 80 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>{dept.load}% Load</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${dept.load > 80 ? 'bg-red-500' : dept.load > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                        style={{ width: `${dept.load}%` }}
                                      ></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </GlassCard>

                  {/* Staff Efficiency Radar */}
                  <GlassCard>
                      <h3 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                          <Radar className="w-5 h-5 text-indigo-500" /> Staff Efficiency Matrix
                      </h3>
                      <div className="h-60 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={departmentMetrics}>
                                  <PolarGrid stroke="#94a3b8" strokeOpacity={0.2} />
                                  <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                  <Radar name="Efficiency" dataKey="efficiency" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.4} />
                                  <Radar name="Staffing" dataKey="staffing" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
                                  <Legend wrapperStyle={{fontSize: '10px'}} />
                                  <Tooltip contentStyle={{borderRadius: '8px', fontSize: '12px'}} />
                              </RadarChart>
                          </ResponsiveContainer>
                      </div>
                  </GlassCard>
              </div>

               {/* Predictive Analytics */}
              <GlassCard>
                  <CardHeader 
                      title="Admission Predictions" 
                      subtitle="AI Forecast vs Actual (7 Days)" 
                      icon={<TrendingUp className="w-5 h-5 text-brand-500" />}
                      className="px-0 pt-0"
                  />
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={admissionData}>
                            <defs>
                                <linearGradient id="colorAdm" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Area type="monotone" name="Admissions" dataKey="admissions" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAdm)" />
                        </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </GlassCard>
          </div>
      </div>
      
      {/* Agent Workflow Visualization */}
      <AgentWorkflow />
    </div>
  );
};
