
import React, { useEffect, useState } from 'react';
import { 
  Activity, Heart, Wind, TrendingUp, TrendingDown, 
  CheckCircle2, Clock, Calendar, ChevronRight, Zap, 
  Droplets, Footprints, BrainCircuit, Moon, Sun, ArrowRight, MapPin, X, Plus, User, Stethoscope, Lightbulb, Thermometer, FileText, ChevronDown, Printer,
  Syringe, AlertOctagon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, CartesianGrid, PieChart, Pie
} from 'recharts';
import { getDailyTip } from '../services/geminiService';
import { useUser } from '../contexts/UserContext';
import { useHospital } from '../contexts/HospitalContext';
import { useAgent, DailyReportData } from '../contexts/AgentContext';
import { Avatar, Button, Card, Badge } from '../components/Common';
import { AgentHub } from '../components/AgentHub';
import { AgentWorkflow } from '../components/AgentWorkflow';
import { HealthBot } from '../components/HealthBot';

// --- Data Sets ---
const weeklyData = [
  { name: 'Mon', steps: 6500, calories: 2100, sleep: 7.2 },
  { name: 'Tue', steps: 8200, calories: 2400, sleep: 6.8 },
  { name: 'Wed', steps: 9100, calories: 2600, sleep: 7.5 },
  { name: 'Thu', steps: 7800, calories: 2300, sleep: 8.0 },
  { name: 'Fri', steps: 5500, calories: 1900, sleep: 6.5 },
  { name: 'Sat', steps: 10200, calories: 2800, sleep: 9.0 },
  { name: 'Sun', steps: 9800, calories: 2700, sleep: 8.5 },
];

const heartData = [
  { time: '00:00', bpm: 62 }, { time: '04:00', bpm: 58 },
  { time: '08:00', bpm: 85 }, { time: '12:00', bpm: 72 },
  { time: '16:00', bpm: 90 }, { time: '20:00', bpm: 78 },
];

const glucoseInsulinData = [
    { time: '08:00', glucose: 110, insulin: 0.5 },
    { time: '09:00', glucose: 140, insulin: 2.5 }, // Post-breakfast spike + bolus
    { time: '10:00', glucose: 135, insulin: 1.0 },
    { time: '11:00', glucose: 115, insulin: 0.2 },
    { time: '12:00', glucose: 105, insulin: 0.2 },
    { time: '13:00', glucose: 95, insulin: 0.2 },
    { time: '14:00', glucose: 150, insulin: 3.0 }, // Lunch spike + bolus
    { time: '15:00', glucose: 130, insulin: 0.5 },
];

// --- Components ---

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; noPadding?: boolean; onClick?: () => void }> = ({ children, className = '', noPadding = false, onClick }) => (
  <div onClick={onClick} className={`bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700 shadow-sm rounded-3xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.005] ${className}`}>
    <div className={noPadding ? '' : 'p-6'}>
      {children}
    </div>
  </div>
);

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  unit: string; 
  trend: string; 
  trendUp: boolean; 
  icon: React.ReactNode; 
  color: string 
}> = ({ title, value, unit, trend, trendUp, icon, color }) => (
  <GlassCard className="relative overflow-hidden group cursor-pointer">
    {/* Background Gradient Blob */}
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl transition-all group-hover:opacity-20 group-hover:scale-150 ${color}`}></div>
    
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 text-slate-700 dark:text-white`}>
        {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })
            : icon}
      </div>
      <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}`}>
        {trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {trend}
      </div>
    </div>
    
    <div>
      <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{value}</span>
        <span className="text-sm font-medium text-slate-400">{unit}</span>
      </div>
    </div>
  </GlassCard>
);

interface DashboardProps {
    onNavigate?: (page: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useUser();
  const { triggerScenario, generateDailyReport } = useAgent();
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Summary Report State
  const [reportView, setReportView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState<DailyReportData | null>(null);

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting("Good Morning");
    else if (hr < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenReport = () => {
      setReportData(generateDailyReport());
      setIsReportOpen(true);
  };

  return (
    <div className="space-y-8 pb-10 relative">
      {/* --- Aesthetic Background --- */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-200/30 dark:bg-teal-900/20 rounded-full blur-[100px]"></div>
      </div>

      {/* --- Detailed Report Modal --- */}
      {isReportOpen && reportData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4 overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col my-8 max-h-[90vh]">
                  {/* Report Header */}
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 rounded-t-3xl">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-brand-500 rounded-2xl text-white shadow-lg shadow-brand-500/30">
                              <FileText className="w-6 h-6" />
                          </div>
                          <div>
                              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Daily Health Intelligence</h2>
                              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                          </div>
                      </div>
                      <button onClick={() => setIsReportOpen(false)} className="p-2 hover:bg-slate-200 dark:bg-slate-800 rounded-full transition-colors">
                          <X className="w-5 h-5 text-slate-500" />
                      </button>
                  </div>
                  
                  {/* Report Content */}
                  <div className="p-8 overflow-y-auto space-y-8">
                      {/* Score & Summary */}
                      <div className="flex flex-col md:flex-row gap-6">
                          <div className="flex-1 space-y-2">
                              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Executive Summary</h4>
                              <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                  {reportData.summary}
                              </p>
                          </div>
                          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl min-w-[150px]">
                              <div className="text-4xl font-black text-brand-500">{reportData.score}</div>
                              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Score</div>
                          </div>
                      </div>

                      {/* Detailed Metrics Grid */}
                      <div>
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Biometric Analysis</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Sleep */}
                              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                                  <div className="flex items-center gap-2 mb-3">
                                      <Moon className="w-4 h-4 text-indigo-500" />
                                      <h5 className="font-bold text-indigo-900 dark:text-indigo-300">Sleep</h5>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                      <div className="flex justify-between"><span className="text-slate-500">Duration</span> <span className="font-bold text-slate-700 dark:text-white">{reportData.metrics.sleep.duration}</span></div>
                                      <div className="flex justify-between"><span className="text-slate-500">Quality</span> <span className="font-bold text-slate-700 dark:text-white">{reportData.metrics.sleep.quality}</span></div>
                                      <div className="flex justify-between"><span className="text-slate-500">Deep Sleep</span> <span className="font-bold text-slate-700 dark:text-white">{reportData.metrics.sleep.deepSleep}</span></div>
                                  </div>
                              </div>

                               {/* Heart */}
                               <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30">
                                  <div className="flex items-center gap-2 mb-3">
                                      <Heart className="w-4 h-4 text-rose-500" />
                                      <h5 className="font-bold text-rose-900 dark:text-rose-300">Cardiac</h5>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                      <div className="flex justify-between"><span className="text-slate-500">Avg HR</span> <span className="font-bold text-slate-700 dark:text-white">{reportData.metrics.heart.avgBpm} bpm</span></div>
                                      <div className="flex justify-between"><span className="text-slate-500">HRV</span> <span className="font-bold text-slate-700 dark:text-white">{reportData.metrics.heart.hrv} ms</span></div>
                                      <div className="flex justify-between"><span className="text-slate-500">Status</span> <span className="font-bold text-emerald-600">{reportData.metrics.heart.status}</span></div>
                                  </div>
                              </div>

                               {/* Activity */}
                               <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                                  <div className="flex items-center gap-2 mb-3">
                                      <Footprints className="w-4 h-4 text-emerald-500" />
                                      <h5 className="font-bold text-emerald-900 dark:text-emerald-300">Activity</h5>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                      <div className="flex justify-between"><span className="text-slate-500">Steps</span> <span className="font-bold text-slate-700 dark:text-white">{reportData.metrics.activity.steps}</span></div>
                                      <div className="flex justify-between"><span className="text-slate-500">Burn</span> <span className="font-bold text-slate-700 dark:text-white">{reportData.metrics.activity.calories} cal</span></div>
                                      <div className="flex justify-between"><span className="text-slate-500">Goal</span> <span className="font-bold text-emerald-600">{reportData.metrics.activity.status}</span></div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* AI Insights & Plan */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <BrainCircuit className="w-4 h-4 text-brand-500" /> AI Insights
                                </h4>
                                <ul className="space-y-3">
                                    {reportData.insights.map((insight, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"></div>
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                           </div>
                           <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" /> Action Plan
                                </h4>
                                <ul className="space-y-3">
                                    {reportData.actionPlan.map((action, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                                            <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                                            {action}
                                        </li>
                                    ))}
                                </ul>
                           </div>
                      </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950 rounded-b-3xl">
                      <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print Report</Button>
                      <Button onClick={() => setIsReportOpen(false)}>Close Report</Button>
                  </div>
              </div>
          </div>
      )}

      {/* --- Header & Controls --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {greeting}, <span className="text-slate-900 dark:text-white uppercase">{user?.name}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium flex items-center gap-2">
               <span>Your personal health ecosystem is active.</span>
            </p>
        </div>

        {/* Real-time Clock & Debug */}
        <div className="flex flex-col items-end gap-3">
             <div className="flex gap-2 mb-1">
                <button onClick={() => triggerScenario('HighHR')} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold border border-red-100 hover:bg-red-100 transition-colors">
                    ! High HR
                </button>
                <button onClick={() => triggerScenario('LowStock')} className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100 hover:bg-amber-100 transition-colors">
                    ! Low Meds
                </button>
            </div>
            <div className="text-right hidden md:block pl-6 border-l border-slate-200 dark:border-slate-700">
               <div className="text-3xl font-mono font-bold text-slate-800 dark:text-white tracking-widest leading-none">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
               </div>
               <div className="text-[10px] font-bold text-brand-500 uppercase tracking-[0.2em] mt-1 flex justify-end items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div> Live Biometrics
               </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Col: Agent & Smart Home */}
         <div className="space-y-6">
             {/* The Agent Hub */}
             <div className="h-[420px]">
                 <AgentHub />
             </div>

             {/* Smart Environment Controls */}
             <GlassCard className="space-y-4">
                 <div className="flex items-center justify-between">
                     <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                         <Zap className="w-4 h-4 text-brand-500" /> Biometric Environment
                     </h3>
                     <span className="text-xs text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">Auto-Optimized</span>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                     <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                         <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                             <Lightbulb className="w-5 h-5" />
                         </div>
                         <div>
                             <p className="text-xs text-slate-400 font-bold uppercase">Lighting</p>
                             <p className="text-sm font-bold text-slate-800 dark:text-white">Circadian</p>
                         </div>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700">
                         <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                             <Thermometer className="w-5 h-5" />
                         </div>
                         <div>
                             <p className="text-xs text-slate-400 font-bold uppercase">Temp</p>
                             <p className="text-sm font-bold text-slate-800 dark:text-white">22°C</p>
                         </div>
                     </div>
                 </div>
             </GlassCard>
         </div>

         {/* Middle & Right: Stats & Charts */}
         <div className="lg:col-span-2 space-y-6">
            {/* Vitals Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Heart Rate" value="72" unit="bpm" trend="+2%" trendUp={true} icon={<Heart />} color="bg-rose-500" />
                <StatCard title="BP" value="118/78" unit="" trend="-1%" trendUp={false} icon={<Activity />} color="bg-blue-500" />
                <StatCard title="Glucose" value="110" unit="mg" trend="Stable" trendUp={true} icon={<Droplets />} color="bg-emerald-500" />
                <StatCard title="Insulin Rate" value="0.5" unit="U/hr" trend="Basal" trendUp={true} icon={<Syringe />} color="bg-purple-500" />
            </div>

            {/* Endocrine & Metabolic Control Section */}
            <GlassCard className="relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                           <Syringe className="w-5 h-5 text-purple-500" /> Endocrine & Metabolic Control
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Automated Insulin Delivery & CGM</p>
                    </div>
                    <div className="flex gap-2">
                         <div className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center gap-2 border border-purple-100 dark:border-purple-800">
                             <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                             <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Closed Loop Active</span>
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Pump Status */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pump Status</h4>
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <span className="text-2xl font-bold text-slate-800 dark:text-white">1.25</span>
                                <span className="text-xs text-slate-500 ml-1">U</span>
                            </div>
                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">Active IOB</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-purple-500 w-[60%]"></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                            <span>Reservoir: 140U</span>
                            <span>Batt: 85%</span>
                        </div>
                    </div>

                     {/* Ketones */}
                     <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ketones</h4>
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                                 <AlertOctagon className="w-5 h-5" />
                             </div>
                             <div>
                                 <div className="text-2xl font-bold text-slate-800 dark:text-white">0.4</div>
                                 <div className="text-[10px] text-emerald-500 font-bold uppercase">Negative / Trace</div>
                             </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">Optimal range &lt; 0.6 mmol/L</p>
                    </div>

                    {/* Prediction */}
                     <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI Prediction (30m)</h4>
                        <div className="flex items-center gap-3">
                             <TrendingUp className="w-8 h-8 text-emerald-500" />
                             <div>
                                 <div className="text-2xl font-bold text-slate-800 dark:text-white">108 <span className="text-xs font-normal text-slate-400">mg/dL</span></div>
                                 <div className="text-[10px] text-emerald-500 font-bold uppercase">Stable Trend</div>
                             </div>
                        </div>
                         <p className="text-[10px] text-slate-400 mt-2">Probability of Hypo: &lt; 2%</p>
                    </div>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={glucoseInsulinData}>
                            <defs>
                                <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorInsulin" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                            <YAxis yAxisId="left" domain={[60, 200]} hide />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 5]} hide />
                            <Tooltip 
                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                                labelStyle={{color: '#64748b', fontSize: '12px'}}
                            />
                            <Area yAxisId="left" type="monotone" name="Glucose (mg/dL)" dataKey="glucose" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGlucose)" />
                            <Area yAxisId="right" type="monotone" name="Insulin (U)" dataKey="insulin" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorInsulin)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Glucose</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-600"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Insulin Delivery</div>
                </div>
            </GlassCard>

             {/* Bottom Summary Section */}
            <GlassCard className="relative overflow-hidden border-t-4 border-t-brand-500">
               <div className="flex flex-col md:flex-row gap-6">
                   {/* Wellness Score Ring */}
                   <div className="md:w-1/3 flex flex-col justify-between">
                       <div>
                           <h3 className="text-slate-800 dark:text-white font-bold text-lg mb-1">Health Summary</h3>
                           <p className="text-slate-500 text-xs">AI Aggregated Score</p>
                       </div>
                       
                       <div className="flex items-center gap-4 mt-4">
                            <div className="relative w-24 h-24">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-slate-100 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                    <path className="text-brand-500 drop-shadow-lg" strokeDasharray="88, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-slate-800 dark:text-white">88</span>
                                    <span className="text-[10px] text-brand-500 font-bold uppercase">Excellent</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-xs">
                                    <span className="text-slate-400 block uppercase text-[10px] font-bold">Physical</span>
                                    <span className="font-bold text-emerald-500">92/100</span>
                                </div>
                                <div className="text-xs">
                                    <span className="text-slate-400 block uppercase text-[10px] font-bold">Mental</span>
                                    <span className="font-bold text-brand-500">85/100</span>
                                </div>
                            </div>
                       </div>
                   </div>

                   {/* Report Selection & Preview */}
                   <div className="md:w-2/3 flex flex-col border-l border-slate-100 dark:border-slate-700 pl-0 md:pl-6 pt-6 md:pt-0">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                                {['daily', 'weekly', 'monthly'].map((view) => (
                                    <button
                                        key={view}
                                        onClick={() => setReportView(view as any)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                                            reportView === view 
                                            ? 'bg-white dark:bg-slate-600 text-brand-600 shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                    >
                                        {view}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={handleOpenReport}
                                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
                            >
                                View Full Report <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>

                        <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 relative overflow-hidden">
                             <div className="flex items-start gap-3">
                                 <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg shrink-0">
                                     <BrainCircuit className="w-5 h-5" />
                                 </div>
                                 <div>
                                     <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                                         {reportView === 'daily' ? 'Today\'s Insight' : reportView === 'weekly' ? 'Weekly Analysis' : 'Monthly Overview'}
                                     </h4>
                                     <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                         {reportView === 'daily' 
                                            ? "Your HRV metrics are 5% above baseline. Recovery from yesterday's exercise is complete. Hydration levels optimal."
                                            : "Consistency in sleep schedule has improved energy levels by 15%. Step count average is 8,500, meeting the target."
                                         }
                                     </p>
                                 </div>
                             </div>
                        </div>
                   </div>
               </div>
            </GlassCard>
            
            {/* Health Bot */}
            <HealthBot />
            
            {/* New: Agent Workflow Visualization */}
            <AgentWorkflow />
         </div>
      </div>
    </div>
  );
};
