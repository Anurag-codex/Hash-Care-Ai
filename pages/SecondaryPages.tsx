
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Badge, Button, Avatar } from '../components/Common';
import { CheckSquare, Calendar, Shield, AlertTriangle, Map, Plus, Star, Filter, Repeat, Trash2, X, CheckCircle2, Circle, Sparkles, BrainCircuit, Zap, Droplets, Footprints, Sun, Moon, Laptop, RefreshCw, User, Smartphone, Ruler, Activity, Info, Check, ArrowRight, ExternalLink, Newspaper, Loader2, Share2, Clock, Upload, FileText, Download, Eye, DollarSign, LogOut } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useAgent } from '../contexts/AgentContext';
import { getHealthNews } from '../services/geminiService';
import { AgentHub } from '../components/AgentHub';
import { useNotification } from '../contexts/NotificationContext';

// --- Medical Tracker ---
export const MedicalTracker: React.FC = () => {
  const { triggerScenario } = useAgent();
  const [medications, setMedications] = useState([
    { id: 1, time: '08:00 AM', name: 'Metformin', dose: '500mg', taken: true, priority: false, recurrence: 'Daily', specificDays: [] as string[], type: 'medication' },
    { id: 2, time: '01:00 PM', name: 'Hydration Check', dose: 'Drink 1 glass', taken: false, priority: false, recurrence: 'Daily', specificDays: [] as string[], type: 'reminder' },
    { id: 3, time: '08:00 PM', name: 'Telma 40', dose: '10mg', taken: false, priority: true, recurrence: 'Daily', specificDays: [] as string[], type: 'medication' },
    { id: 4, time: '09:00 PM', name: 'Atorvastatin', dose: '20mg', taken: false, priority: false, recurrence: 'Daily', specificDays: [] as string[], type: 'medication' },
  ]);

  const [filter, setFilter] = useState<'all' | 'todo' | 'done' | 'priority'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'name'>('priority');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newMed, setNewMed] = useState({ 
      name: '', 
      dose: '', 
      time: '', 
      recurrence: 'Daily', 
      specificDays: [] as string[],
      priority: false, 
      type: 'medication' 
  });

  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const [waterIntake, setWaterIntake] = useState(4);
  const waterGoal = 8;
  const [steps, setSteps] = useState(4500);
  const stepGoal = 10000;

  const playSuccessSound = () => {
      try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3');
          audio.volume = 0.2;
          audio.play().catch(e => console.log("Audio play blocked", e));
      } catch (e) {
          console.error("Audio error", e);
      }
  };

  const togglePriority = (id: number) => {
    setMedications(prev => prev.map(med => 
        med.id === id ? { ...med, priority: !med.priority } : med
    ));
  };

  const toggleTaken = (id: number) => {
    const item = medications.find(m => m.id === id);
    if (!item) return;
    
    if (!item.taken) {
        playSuccessSound();
        setAnimatingId(id);
        setTimeout(() => setAnimatingId(null), 800);
    }
    
    setMedications(prev => prev.map(med => 
        med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  const confirmDelete = () => {
    if (deleteId) {
        setMedications(prev => prev.filter(m => m.id !== deleteId));
        setDeleteId(null);
    }
  };

  const handleAddMedication = () => {
    if (!newMed.name || !newMed.time) return;
    
    let [hours, mins] = newMed.time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHours = h % 12 || 12;
    const formattedTime = `${formattedHours.toString().padStart(2, '0')}:${mins} ${ampm}`;

    setMedications(prev => [
        ...prev, 
        { 
            id: Date.now(), 
            name: newMed.name, 
            dose: newMed.dose || 'No details', 
            time: formattedTime, 
            taken: false, 
            priority: newMed.priority,
            recurrence: newMed.recurrence,
            specificDays: newMed.specificDays,
            type: newMed.type
        }
    ]);
    setNewMed({ name: '', dose: '', time: '', recurrence: 'Daily', specificDays: [], priority: false, type: 'medication' });
    setIsAdding(false);
  };

  const processedMedications = medications
    .filter(med => {
        if (filter === 'todo') return !med.taken;
        if (filter === 'done') return med.taken;
        if (filter === 'priority') return med.priority;
        return true;
    })
    .sort((a, b) => {
        if (sortBy === 'priority') {
            if (a.priority === b.priority) return new Date('1/1/2000 ' + a.time).getTime() - new Date('1/1/2000 ' + b.time).getTime();
            return a.priority ? -1 : 1;
        }
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'time') return new Date('1/1/2000 ' + a.time).getTime() - new Date('1/1/2000 ' + b.time).getTime();
        return 0;
    });

  return (
    <div className="space-y-6 relative">
        {deleteId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-slate-100 dark:border-slate-700 transform scale-100 transition-transform">
                    <div className="flex items-center gap-3 text-red-500 mb-4">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Confirm Deletion</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Are you sure you want to permanently delete this reminder? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Medical & Diet Tracker</h1>
            <div className="flex items-center gap-2">
                 <button onClick={() => triggerScenario('LowStock')} className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors">
                    Simulate Low Stock
                </button>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
                    {(['all', 'todo', 'done', 'priority'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${filter === f ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Daily Goals Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <Card className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-4 border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 relative">
                         <span className="text-lg font-bold">{waterIntake}</span>
                         <span className="text-[10px] absolute bottom-1">/ {waterGoal}</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">Hydration</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Daily Goal: {waterGoal} cups</p>
                    </div>
                </div>
                <Button onClick={() => setWaterIntake(prev => Math.min(prev + 1, waterGoal))} size="sm" className="rounded-full w-10 h-10 p-0 bg-blue-100 text-blue-600 hover:bg-blue-200 border-none dark:bg-blue-900/30 dark:text-blue-400"><Plus className="w-5 h-5" /></Button>
            </Card>
            
            <Card className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-white dark:from-slate-800 dark:to-slate-800">
                <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14">
                         <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-emerald-100 dark:text-emerald-900/30" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            <path className="text-emerald-500 transition-all duration-1000 ease-out" strokeDasharray={`${(steps/stepGoal)*100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                         </svg>
                         <div className="absolute inset-0 flex items-center justify-center">
                             <Footprints className="w-5 h-5 text-emerald-500" />
                         </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">Steps</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{steps} / {stepGoal} steps</p>
                    </div>
                </div>
                <div className="text-right">
                     <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{Math.round((steps/stepGoal)*100)}%</p>
                     <p className="text-[10px] text-slate-400">Completed</p>
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader 
                    title="Schedule & Reminders" 
                    subtitle="Manage medications and custom reminders" 
                    icon={<Calendar className="w-5 h-5" />} 
                    action={
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-1 mr-2">
                                <span className="text-xs text-slate-400 font-medium">Sort:</span>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="text-xs border-none bg-slate-50 dark:bg-slate-700 rounded-lg py-1 pl-2 pr-6 focus:ring-0 text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                                >
                                    <option value="time">Time</option>
                                    <option value="priority">Priority</option>
                                    <option value="name">Name</option>
                                </select>
                            </div>
                            <Button 
                                variant={isAdding ? 'secondary' : 'ghost'} 
                                onClick={() => setIsAdding(!isAdding)} 
                                className="text-xs px-2" 
                                icon={isAdding ? X : Plus}
                            >
                                {isAdding ? 'Cancel' : 'Add'}
                            </Button>
                        </div>
                    }
                />
                
                {isAdding && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2">
                         <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase mb-3">Create New Reminder</h4>
                         <div className="flex flex-col gap-2">
                             <input 
                                 type="text" 
                                 placeholder="Medication Name" 
                                 className="w-full text-sm p-2 rounded-lg border" 
                                 value={newMed.name}
                                 onChange={e => setNewMed({...newMed, name: e.target.value})}
                             />
                             <input 
                                 type="time" 
                                 className="w-full text-sm p-2 rounded-lg border" 
                                 value={newMed.time}
                                 onChange={e => setNewMed({...newMed, time: e.target.value})}
                             />
                             <Button onClick={handleAddMedication}>Save</Button>
                         </div>
                    </div>
                )}

                <CardContent className="space-y-3 min-h-[300px]">
                    {processedMedications.map((med) => (
                        <div 
                            key={med.id} 
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-500 ${
                                med.taken 
                                ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 opacity-75' 
                                : med.priority
                                    ? 'bg-amber-50/40 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30 shadow-sm'
                                    : 'bg-white dark:bg-slate-700/50 border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm'
                            } ${animatingId === med.id ? 'scale-[1.03] ring-2 ring-emerald-400 ring-offset-2 bg-emerald-100 dark:bg-emerald-900/30 shadow-lg' : ''}`}
                        >
                             <div className="flex items-center gap-4 flex-1">
                                    <button 
                                        onClick={() => togglePriority(med.id)}
                                        className={`p-1.5 rounded-full transition-all ${
                                            med.priority 
                                            ? 'text-amber-500 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200' 
                                            : 'text-slate-300 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 focus:opacity-100'
                                        }`}
                                        title={med.priority ? "Remove Priority" : "Mark as High Priority"}
                                    >
                                        <Star className={`w-4 h-4 ${med.priority ? 'fill-amber-500' : ''}`} />
                                    </button>

                                    <div className="flex flex-col items-center w-16 text-center border-r border-slate-100 dark:border-slate-600 pr-4">
                                        <span className={`text-sm font-bold tabular-nums ${med.taken ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {med.time.split(' ')[0]}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-medium uppercase">
                                            {med.time.split(' ')[1]}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold truncate ${med.taken ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-800 dark:text-white'}`}>
                                                {med.name}
                                            </span>
                                            {med.priority && !med.taken && (
                                                <Badge variant="warning" className="text-[10px] py-0 px-1.5 h-5 flex items-center shadow-sm">PRIORITY</Badge>
                                            )}
                                            {med.type === 'reminder' && (
                                                 <Badge variant="neutral" className="text-[10px] py-0 px-1.5 h-5 flex items-center">REMINDER</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            <span>{med.dose}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="flex items-center gap-1">
                                                <Repeat className="w-3 h-3" /> 
                                                {med.recurrence === 'Specific Days' ? med.specificDays.join(', ') : med.recurrence}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pl-2">
                                    <button 
                                        onClick={() => toggleTaken(med.id)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
                                            med.taken 
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 rotate-0' 
                                            : 'bg-slate-100 dark:bg-slate-600 text-slate-400 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-500 hover:text-slate-600'
                                        }`}
                                        title={med.taken ? "Mark as not taken" : "Mark as taken"}
                                    >
                                        {med.taken ? <CheckCircle2 className="w-6 h-6 animate-in zoom-in duration-300" /> : <Circle className="w-6 h-6" />}
                                    </button>
                                    <button 
                                        onClick={() => setDeleteId(med.id)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            
            <div className="flex flex-col gap-6">
                <div className="h-[400px]">
                    <AgentHub />
                </div>
                
                <Card>
                    <CardHeader title="Your Appointments" />
                    <CardContent className="space-y-4">
                        {[
                            { name: "Dr. Anjali Sharma", dept: "Cardiology", time: "Tomorrow, 10:00 AM", status: "Confirmed" },
                            { name: "Dr. Vikram Singh", dept: "General", time: "Oct 30, 04:30 PM", status: "Pending" }
                        ].map((apt, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                    {apt.name.split(' ')[1][0]}{apt.name.split(' ')[2]?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{apt.name}</p>
                                    <p className="text-xs text-slate-500">{apt.dept} • {apt.time}</p>
                                </div>
                                {apt.status === 'Confirmed' ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <Circle className="w-4 h-4 text-amber-500" />
                                )}
                            </div>
                        ))}
                        <Button variant="outline" className="w-full text-xs">Manage All</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
};

// --- Insurance Tracker ---
export const InsuranceTracker: React.FC = () => {
    const [showComparison, setShowComparison] = useState(false);
    const startDate = new Date('2025-01-01').getTime();
    const endDate = new Date('2025-12-31').getTime();
    const today = new Date().getTime();
    const percentage = Math.min(100, Math.max(0, ((today - startDate) / (endDate - startDate)) * 100));
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    const recommendedPlans = [
        { name: "Star Comprehensive", provider: "Star Health", cover: "₹10 Lakhs", premium: "₹12,450/yr", rating: 4.8, features: ["No Room Rent Limit", "Free Annual Checkup", "Bariatric Surgery Cover"], link: "https://www.starhealth.in" },
        { name: "HDFC ERGO Optima Secure", provider: "HDFC ERGO", cover: "₹20 Lakhs", premium: "₹15,200/yr", rating: 4.9, features: ["4X Cover Benefit", "No Claim Bonus", "Global Coverage"], link: "https://www.hdfcergo.com" },
        { name: "Niva Bupa ReAssure 2.0", provider: "Niva Bupa", cover: "₹15 Lakhs", premium: "₹13,800/yr", rating: 4.7, features: ["Unlimited Reinstatement", "Lock the Clock (Age)", "Booster Benefit"], link: "https://www.nivabupa.com" },
        { name: "ICICI Lombard Health Shield", provider: "ICICI Lombard", cover: "₹10 Lakhs", premium: "₹11,500/yr", rating: 4.6, features: ["Reset Benefit", "Wellness Program", "Tele-consultation"], link: "https://www.icicilombard.com" },
        { name: "Tata AIG Medicare", provider: "Tata AIG", cover: "₹10 Lakhs", premium: "₹12,800/yr", rating: 4.7, features: ["Global Cover", "Consumables Covered", "Restoration Benefit"], link: "https://www.tataaig.com" },
        { name: "Care Supreme", provider: "Care Health", cover: "₹15 Lakhs", premium: "₹14,100/yr", rating: 4.5, features: ["Cumulative Bonus", "Health Checkup", "Unlimited E-Consult"], link: "https://www.careinsurance.com" },
        { name: "Aditya Birla Activ Health", provider: "Aditya Birla", cover: "₹10 Lakhs", premium: "₹12,000/yr", rating: 4.6, features: ["Chronic Mgmt", "HealthReturns", "Day 1 Cover"], link: "https://www.adityabirlacapital.com" },
        { name: "ManipalCigna ProHealth", provider: "ManipalCigna", cover: "₹20 Lakhs", premium: "₹16,500/yr", rating: 4.7, features: ["Guaranteed Bonus", "Worldwide Emergency", "Restoration"], link: "https://www.manipalcigna.com" },
        { name: "Bajaj Allianz Health Guard", provider: "Bajaj Allianz", cover: "₹10 Lakhs", premium: "₹11,900/yr", rating: 4.5, features: ["Maternity Cover", "Ayush Benefit", "Recharge Benefit"], link: "https://www.bajajallianz.com" },
        { name: "SBI Arogya Premier", provider: "SBI General", cover: "₹20 Lakhs", premium: "₹15,800/yr", rating: 4.4, features: ["No Pre-policy Check", "Cumulative Bonus", "Alt Treatments"], link: "https://www.sbigeneral.in" }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Insurance & Claims</h1>
                <Button variant="secondary" icon={ExternalLink} onClick={() => window.open('https://www.policybazaar.com/health-insurance/', '_blank')}>
                    Compare on PolicyBazaar
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-800 text-white relative overflow-hidden border-none shadow-xl shadow-blue-600/20 dark:shadow-none min-h-[220px]">
                     <CardContent className="h-full flex flex-col justify-between p-6">
                         <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                                    <Shield className="w-8 h-8 text-blue-100" />
                                </div>
                                <div>
                                    <p className="text-blue-200 text-xs uppercase tracking-wider font-bold mb-1">Current Provider</p>
                                    <h2 className="text-2xl font-bold tracking-tight">Star Health & Allied</h2>
                                    <p className="text-blue-100 opacity-80 text-sm mt-1">Family Optima Plan • ₹10L Cover</p>
                                </div>
                            </div>
                            <Badge className="bg-emerald-400/20 text-emerald-100 border border-emerald-400/30 backdrop-blur-sm px-3 py-1">Active</Badge>
                         </div>
                         <div className="grid grid-cols-3 gap-8 mt-6">
                             <div><p className="text-blue-300 text-[10px] uppercase font-bold mb-1">Policy No.</p><p className="font-mono text-lg tracking-wider">SH-8921-4421</p></div>
                             <div><p className="text-blue-300 text-[10px] uppercase font-bold mb-1">Valid Until</p><p className="font-medium">31 Dec, 2025</p></div>
                             <div><p className="text-blue-300 text-[10px] uppercase font-bold mb-1">Claim Status</p><p className="font-medium flex items-center gap-2"><Check className="w-4 h-4" /> No Claims</p></div>
                         </div>
                         <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-xs text-blue-200"><span>Policy Term Progress</span><span>{daysLeft} days remaining</span></div>
                            <div className="relative h-1.5 bg-blue-900/40 rounded-full overflow-hidden">
                                <div className="absolute top-0 left-0 h-full bg-blue-300 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                            </div>
                         </div>
                     </CardContent>
                </Card>
                <Card className="flex flex-col justify-center gap-3 p-6">
                     <h3 className="font-bold text-slate-800 dark:text-white mb-2">Policy Actions</h3>
                     <Button className="w-full justify-between group" variant="secondary">File a New Claim <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" /></Button>
                     <Button className="w-full justify-between group" variant="secondary">Download E-Card <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" /></Button>
                     <Button className="w-full justify-between group" variant="secondary">Network Hospitals <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" /></Button>
                </Card>
            </div>

            <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Top Rated Plans in India</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedPlans.map((plan, i) => (
                            <Card key={i} className="flex flex-col h-full hover:shadow-lg transition-shadow">
                                <CardContent className="p-5 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div><Badge variant="neutral" className="mb-2">{plan.provider}</Badge><h4 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{plan.name}</h4></div>
                                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-xs font-bold text-amber-700 dark:text-amber-400">{plan.rating}</span></div>
                                    </div>
                                    <div className="space-y-3 mb-6 flex-1">
                                        <div className="flex justify-between text-sm py-1 border-b border-dashed border-slate-100 dark:border-slate-700"><span className="text-slate-500">Coverage</span><span className="font-bold text-slate-700 dark:text-slate-200">{plan.cover}</span></div>
                                        <div className="flex justify-between text-sm py-1 border-b border-dashed border-slate-100 dark:border-slate-700"><span className="text-slate-500">Premium</span><span className="font-bold text-slate-700 dark:text-slate-200">{plan.premium}</span></div>
                                        <div className="pt-2"><p className="text-xs font-bold text-slate-400 uppercase mb-2">Highlights</p><ul className="space-y-1">{plan.features.map((feature, idx) => (<li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {feature}</li>))}</ul></div>
                                    </div>
                                    <a href={plan.link} target="_blank" rel="noopener noreferrer" className="block mt-auto"><Button className="w-full">Apply Now</Button></a>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
            </div>
        </div>
    );
};

// --- Community Page ---
export const CommunityPage: React.FC = () => {
    const [news, setNews] = useState<any[]>([
        { tag: "TOI Health", title: "Air pollution: Tips to protect your lungs this winter", desc: "As AQI levels rise in northern India, doctors recommend these dietary changes and masks to safeguard respiratory health.", time: "4h ago", bg: "bg-red-50 dark:bg-red-900/20 text-red-700", source: "Times of India", link: "https://timesofindia.indiatimes.com/life-style/health-fitness/health-news" },
        { tag: "Fitness", title: "5 Yoga asanas for better digestion and gut health", desc: "Simple morning routines that can help alleviate acidity and bloating according to wellness experts.", time: "6h ago", bg: "bg-blue-50 dark:bg-blue-900/20 text-blue-700", source: "Times of India", link: "https://timesofindia.indiatimes.com/life-style/health-fitness/fitness" },
        { tag: "Nutrition", title: "Why adding ghee to your diet might be beneficial", desc: "Recent studies highlight the benefits of healthy fats found in traditional Indian diets.", time: "1d ago", bg: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700", source: "Times of India", link: "https://timesofindia.indiatimes.com/life-style/food-news" },
    ]);
    const openLink = (url: string) => { if (url) window.open(url, '_blank'); };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-slate-800 dark:text-white">Community Health Feed</h1><div className="flex items-center gap-2 text-xs text-slate-500"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>Live updates from India</div></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    {news.map((item, i) => (
                        <Card key={i} className="hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer group" onClick={() => openLink(item.link)}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Badge className={`${item.bg} border-0`}>{item.tag}</Badge><span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span></div><ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" /></div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{item.title}</h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">{item.desc}</p>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-700/50"><span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Newspaper className="w-3 h-3" /> {item.source || "Source"}</span><button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">Read Full Article</button></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="space-y-4">
                    <Card className="bg-gradient-to-br from-brand-600 to-teal-700 text-white border-none relative overflow-hidden"><div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div><CardContent><h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5 text-yellow-300" /> Daily Health Tip</h3><p className="text-sm opacity-90 mb-4 font-medium leading-relaxed">"Drinking warm water with lemon in the morning aids digestion and boosts vitamin C."</p><div className="flex items-center gap-2 text-xs opacity-75 bg-black/20 p-2 rounded-lg inline-flex"><BrainCircuit className="w-3 h-3" /> AI Curated</div></CardContent></Card>
                    <Card><CardHeader title="Local Events" /><CardContent className="space-y-3"><div className="flex gap-3 items-start p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"><div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-2 text-center min-w-[3.5rem]"><span className="block text-xs text-slate-500 font-bold">OCT</span><span className="block text-lg font-bold text-slate-800 dark:text-white">28</span></div><div><h4 className="font-bold text-sm text-slate-800 dark:text-white">Free Eye Checkup Camp</h4><p className="text-xs text-slate-500">Community Centre, Block B</p></div></div><div className="flex gap-3 items-start p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"><div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-2 text-center min-w-[3.5rem]"><span className="block text-xs text-slate-500 font-bold">NOV</span><span className="block text-lg font-bold text-slate-800 dark:text-white">02</span></div><div><h4 className="font-bold text-sm text-slate-800 dark:text-white">Yoga in the Park</h4><p className="text-xs text-slate-500">Central Park, 6:00 AM</p></div></div></CardContent></Card>
                </div>
            </div>
        </div>
    );
};

// --- Mass Alerts ---
export const MassAlerts: React.FC = () => {
    return (
         <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Public Safety Alerts</h1>
            <div className="grid grid-cols-1 gap-4">
                 <Card className="border-l-4 border-l-red-500"><CardContent className="flex items-start gap-4"><div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400"><AlertTriangle className="w-6 h-6" /></div><div><div className="flex items-center gap-2 mb-1"><h3 className="font-bold text-lg text-slate-800 dark:text-white">Severe Air Quality Warning</h3><Badge variant="danger">Critical</Badge></div><p className="text-slate-600 dark:text-slate-300 text-sm mb-2">AQI levels have crossed 400 in the downtown area. Residents with respiratory issues are advised to stay indoors.</p><p className="text-xs text-slate-400">Issued by City Health Dept • 2 hours ago</p></div></CardContent></Card>
                 <Card className="border-l-4 border-l-amber-500"><CardContent className="flex items-start gap-4"><div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400"><Shield className="w-6 h-6" /></div><div><div className="flex items-center gap-2 mb-1"><h3 className="font-bold text-lg text-slate-800 dark:text-white">Viral Flu Outbreak</h3><Badge variant="warning">Moderate</Badge></div><p className="text-slate-600 dark:text-slate-300 text-sm mb-2">Increased cases of viral fever reported. Ensure proper hydration and hygiene. Vaccination camps active at Sector 4.</p><p className="text-xs text-slate-400">Issued by Community Health Center • 1 day ago</p></div></CardContent></Card>
            </div>
         </div>
    );
};

// --- Settings Page ---
interface SettingsPageProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ theme, onToggleTheme }) => {
    const { user, updateProfile, logout } = useUser();
    const { addNotification } = useNotification();
    const [activeTab, setActiveTab] = useState<'profile' | 'reports' | 'system'>('reports');
    
    // Profile State
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        height: user?.height || '',
        weight: user?.weight || '',
        emergencyContactName: user?.emergencyContactName || ''
    });

    // Reports State
    const [reports, setReports] = useState([
        { id: 1, name: 'Blood Work - Oct 2023.pdf', date: '2023-10-25', category: 'Lab Results', size: '2.4 MB' },
        { id: 2, name: 'MRI Scan - Knee.jpg', date: '2023-09-15', category: 'Imaging', size: '15 MB' },
        { id: 3, name: 'Prescription - Cardio.pdf', date: '2023-08-10', category: 'Prescription', size: '1.1 MB' },
    ]);
    const [uploading, setUploading] = useState(false);

    const handleSaveProfile = () => {
        updateProfile(profileForm);
        addNotification('success', 'Profile Updated', 'Your changes have been saved successfully.');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            const file = e.target.files[0];
            setTimeout(() => {
                setReports(prev => [{
                    id: Date.now(),
                    name: file.name,
                    date: new Date().toISOString().split('T')[0],
                    category: 'Uncategorized',
                    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
                }, ...prev]);
                setUploading(false);
                addNotification('success', 'File Uploaded', `${file.name} added to your records.`);
            }, 1500);
        }
    };

    const deleteReport = (id: number) => {
        setReports(prev => prev.filter(r => r.id !== id));
        addNotification('info', 'Report Deleted', 'File removed from secure storage.');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Settings & Records</h1>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 space-y-2">
                    <Card className="p-2 bg-white dark:bg-slate-800">
                        {['reports', 'profile', 'system'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between group ${
                                    activeTab === tab 
                                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                <span className="capitalize">{tab === 'reports' ? 'Medical Reports' : tab === 'profile' ? 'Profile & Vitals' : 'App Settings'}</span>
                                {activeTab === tab && <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>}
                            </button>
                        ))}
                    </Card>
                    
                    <Card className="p-4 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none">
                        <div className="flex items-center gap-3 mb-3">
                            <Avatar name={user?.name || 'User'} className="bg-white/20 text-white" />
                            <div>
                                <p className="font-bold text-sm">{user?.name}</p>
                                <p className="text-xs text-indigo-200">{user?.role === 'admin' ? 'Admin' : 'Patient'}</p>
                            </div>
                        </div>
                        <Button variant="secondary" size="sm" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={logout} icon={LogOut}>
                            Sign Out
                        </Button>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {/* MEDICAL REPORTS TAB */}
                    {activeTab === 'reports' && (
                        <Card className="bg-white dark:bg-slate-800 min-h-[500px]">
                            <CardHeader 
                                title="Medical Records" 
                                subtitle="Securely manage your lab results and prescriptions" 
                                icon={<FileText className="w-5 h-5 text-brand-500" />}
                            />
                            <CardContent className="space-y-6">
                                {/* Upload Area */}
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors relative">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                    <div className="flex flex-col items-center gap-3 pointer-events-none">
                                        {uploading ? (
                                            <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                                        ) : (
                                            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">
                                                {uploading ? 'Uploading...' : 'Click or Drag files to upload'}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reports List */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Documents</h3>
                                    {reports.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-500 border border-slate-200 dark:border-slate-600">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800 dark:text-white">{file.name}</p>
                                                    <div className="flex gap-2 text-[10px] text-slate-500 uppercase font-medium mt-0.5">
                                                        <span>{file.category}</span>
                                                        <span>•</span>
                                                        <span>{file.date}</span>
                                                        <span>•</span>
                                                        <span>{file.size}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-500 transition-colors" title="View">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-500 transition-colors" title="Download">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => deleteReport(file.id)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 rounded-lg text-slate-400 transition-colors" 
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                         <Card className="bg-white dark:bg-slate-800">
                            <CardHeader title="Edit Profile" subtitle="Update your personal details" icon={<User className="w-5 h-5" />} />
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 mt-1 text-sm"
                                            value={profileForm.name}
                                            onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                                        <input 
                                            type="email" 
                                            className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 mt-1 text-sm opacity-60 cursor-not-allowed"
                                            value={profileForm.email}
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Height</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 mt-1 text-sm"
                                            value={profileForm.height}
                                            onChange={e => setProfileForm({...profileForm, height: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Weight</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 mt-1 text-sm"
                                            value={profileForm.weight}
                                            onChange={e => setProfileForm({...profileForm, weight: e.target.value})}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Emergency Contact</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 mt-1 text-sm"
                                            value={profileForm.emergencyContactName}
                                            onChange={e => setProfileForm({...profileForm, emergencyContactName: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button onClick={handleSaveProfile}>Save Changes</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* SYSTEM TAB */}
                    {activeTab === 'system' && (
                        <Card className="bg-white dark:bg-slate-800">
                            <CardHeader title="System Preferences" icon={<Laptop className="w-5 h-5" />} />
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 dark:text-white">Theme Preference</p>
                                        <p className="text-xs text-slate-500">Switch between light and dark mode</p>
                                    </div>
                                    <Button onClick={onToggleTheme} variant="secondary" icon={theme === 'light' ? Moon : Sun}>
                                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                    </Button>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 dark:text-white">Data Synchronization</p>
                                        <p className="text-xs text-slate-500">Last synced: Just now</p>
                                    </div>
                                    <Button variant="ghost" icon={RefreshCw}>Sync Now</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
