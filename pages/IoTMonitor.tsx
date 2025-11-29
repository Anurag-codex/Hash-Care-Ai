
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Badge, Button } from '../components/Common';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar
} from 'recharts';
import { Activity, Zap, AlertCircle, Wifi, Clock, Filter, BrainCircuit, Syringe, Droplets, Heart, Download } from 'lucide-react';

type TimeRange = 'Live' | '1h' | '6h' | '24h';

const getVitalStatus = (value: number, type: 'hr' | 'spo2' | 'glucose' | 'insulin') => {
  if (type === 'hr') {
    if (value > 120 || value < 50) return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', label: 'Critical' };
    if (value > 100 || value < 60) return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', label: 'Caution' };
    return { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', label: 'Normal' };
  }
  if (type === 'spo2') {
    if (value < 90) return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', label: 'Critical' };
    if (value < 95) return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', label: 'Low' };
    return { color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20', border: 'border-sky-200 dark:border-sky-800', label: 'Normal' };
  }
  if (type === 'glucose') {
     if (value > 180 || value < 70) return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', label: 'Critical' };
     if (value > 140 || value < 80) return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', label: 'Check' };
     return { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', label: 'Normal' };
  }
  if (type === 'insulin') {
     if (value > 5) return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', label: 'High Bolus' };
     return { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', label: 'Basal' };
  }
  return { color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', label: 'Unknown' };
};

// Generate mock historical data based on range
const generateData = (range: TimeRange) => {
    const now = new Date();
    const points = range === 'Live' ? 20 : range === '1h' ? 60 : range === '6h' ? 72 : 48;
    const intervalMinutes = range === 'Live' ? 0 : range === '1h' ? 1 : range === '6h' ? 5 : 30;
    
    return Array.from({ length: points }, (_, i) => {
        const time = new Date(now.getTime() - (points - 1 - i) * (range === 'Live' ? 1000 : intervalMinutes * 60000));
        return {
            time: range === 'Live' ? time.toLocaleTimeString([], { second: '2-digit', minute: '2-digit' }) : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            heartRate: 70 + Math.sin(i * 0.2) * 5 + Math.random() * 10 + (Math.random() > 0.95 ? 20 : 0),
            spo2: 96 + Math.random() * 3 - (Math.random() > 0.9 ? 2 : 0),
            glucose: 110 + Math.sin(i * 0.1) * 20 + Math.random() * 5,
            insulin: 0.5 + Math.random() * 0.1 + (Math.random() > 0.9 ? 1.5 : 0) // Spikes for bolus
        };
    });
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 border border-slate-100 dark:border-slate-700 shadow-xl rounded-2xl">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium flex items-center gap-1 border-b border-slate-100 dark:border-slate-700 pb-2">
              <Clock className="w-3 h-3" /> {label}
          </p>
          <div className="space-y-2">
              {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-6 min-w-[120px]">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">{entry.name === 'insulin' ? 'Insulin' : entry.name === 'glucose' ? 'Glucose' : entry.name === 'heartRate' ? 'Heart Rate' : 'SpO2'}</span>
                    </div>
                    <span className="text-sm font-bold font-mono text-slate-800 dark:text-white">
                        {entry.name === 'insulin' ? entry.value.toFixed(2) : Math.round(entry.value)} 
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                            {entry.name === 'heartRate' ? 'bpm' : entry.name === 'spo2' ? '%' : entry.name === 'insulin' ? 'U/hr' : 'mg/dL'}
                        </span>
                    </span>
                </div>
              ))}
          </div>
        </div>
      );
    }
    return null;
};

export const IoTMonitor: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('Live');
  const [data, setData] = useState(generateData('Live'));
  const [isConnected, setIsConnected] = useState(true);

  // Handle Live Updates
  useEffect(() => {
    if (timeRange !== 'Live') {
        setData(generateData(timeRange));
        return;
    }

    // Reset to initial live data when switching back to live
    setData(generateData('Live'));

    const interval = setInterval(() => {
      setData(prev => {
        const lastTime = new Date();
        const newDataPoint = {
          time: lastTime.toLocaleTimeString([], { second: '2-digit', minute: '2-digit' }),
          heartRate: 70 + Math.random() * 10 + (Math.random() > 0.9 ? 15 : 0), 
          spo2: 96 + Math.random() * 3,
          glucose: 110 + Math.random() * 5,
          insulin: 0.5 + (Math.random() > 0.95 ? 2.0 : 0) // Random bolus spike
        };
        // Keep only last 20 points
        const newArray = [...prev, newDataPoint];
        if (newArray.length > 20) newArray.shift();
        return newArray;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const currentData = data[data.length - 1];
  const hrStatus = getVitalStatus(currentData.heartRate, 'hr');
  const spo2Status = getVitalStatus(currentData.spo2, 'spo2');
  const glucoseStatus = getVitalStatus(currentData.glucose, 'glucose');
  const insulinStatus = getVitalStatus(currentData.insulin, 'insulin');

  const exportToCSV = () => {
    const headers = ['Time', 'Heart Rate (bpm)', 'SpO2 (%)', 'Glucose (mg/dL)', 'Insulin Rate (U/hr)'];
    const rows = data.map(row => [
        row.time,
        Math.round(row.heartRate),
        Math.round(row.spo2),
        Math.round(row.glucose),
        row.insulin.toFixed(2)
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vitals_report_${timeRange}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Live IoT Vitals Monitor</h1>
           <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
               <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
               </span>
               {isConnected ? 'Receiving real-time data from wearable sensors.' : 'Connection lost. Showing last known values.'}
            </p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                {(['Live', '1h', '6h', '24h'] as TimeRange[]).map((range) => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                         className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            timeRange === range 
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        {range}
                    </button>
                ))}
            </div>
             <Button icon={Download} variant="secondary" onClick={exportToCSV} title="Export Data">
                Export
             </Button>
             <Button icon={Wifi} variant={isConnected ? 'secondary' : 'danger'} onClick={() => setIsConnected(!isConnected)}>
                {isConnected ? 'Connected' : 'Reconnect'}
             </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`p-4 border-l-4 ${hrStatus.border} transition-all duration-300`}>
              <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${hrStatus.bg} ${hrStatus.color}`}>
                          <Activity className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Heart Rate</span>
                  </div>
                  <Badge className={`${hrStatus.bg} ${hrStatus.color} border-none`}>{hrStatus.label}</Badge>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{Math.round(currentData.heartRate)}</span>
                  <span className="text-xs font-bold text-slate-400">bpm</span>
              </div>
          </Card>

          <Card className={`p-4 border-l-4 ${spo2Status.border} transition-all duration-300`}>
              <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${spo2Status.bg} ${spo2Status.color}`}>
                          <Zap className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">SpO2</span>
                  </div>
                  <Badge className={`${spo2Status.bg} ${spo2Status.color} border-none`}>{spo2Status.label}</Badge>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{Math.round(currentData.spo2)}</span>
                  <span className="text-xs font-bold text-slate-400">%</span>
              </div>
          </Card>

          <Card className={`p-4 border-l-4 ${glucoseStatus.border} transition-all duration-300`}>
              <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${glucoseStatus.bg} ${glucoseStatus.color}`}>
                          <Droplets className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Glucose</span>
                  </div>
                  <Badge className={`${glucoseStatus.bg} ${glucoseStatus.color} border-none`}>{glucoseStatus.label}</Badge>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{Math.round(currentData.glucose)}</span>
                  <span className="text-xs font-bold text-slate-400">mg/dL</span>
              </div>
          </Card>

           <Card className={`p-4 border-l-4 ${insulinStatus.border} transition-all duration-300`}>
              <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${insulinStatus.bg} ${insulinStatus.color}`}>
                          <Syringe className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Insulin Rate</span>
                  </div>
                  <Badge className={`${insulinStatus.bg} ${insulinStatus.color} border-none`}>{insulinStatus.label}</Badge>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{currentData.insulin.toFixed(2)}</span>
                  <span className="text-xs font-bold text-slate-400">U/hr</span>
              </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Glucose & Insulin Chart */}
          <Card className="p-4 shadow-lg border-emerald-100 dark:border-emerald-900/20">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <BrainCircuit className="w-5 h-5 text-emerald-500" />
                          Metabolic Control
                      </h3>
                      <p className="text-xs text-slate-500">Real-time Glucose vs Insulin Delivery</p>
                  </div>
                  <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-emerald-500"></div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Glucose</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-purple-500"></div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Insulin</span>
                      </div>
                  </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data}>
                         <defs>
                            <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} minTickGap={30} />
                        <YAxis yAxisId="left" domain={[60, 200]} hide />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 5]} hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Area yAxisId="left" type="monotone" dataKey="glucose" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorGlucose)" />
                        <Bar yAxisId="right" dataKey="insulin" fill="#a855f7" barSize={10} radius={[4, 4, 0, 0]} opacity={0.6} />
                    </ComposedChart>
                </ResponsiveContainer>
              </div>
          </Card>

          {/* Cardiac & Respiratory Chart */}
          <Card className="p-4 shadow-lg border-rose-100 dark:border-rose-900/20">
               <div className="flex justify-between items-center mb-6">
                  <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <Heart className="w-5 h-5 text-rose-500" />
                          Cardio-Respiratory
                      </h3>
                      <p className="text-xs text-slate-500">Heart Rate & Blood Oxygen Saturation</p>
                  </div>
                  <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-rose-500"></div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">BPM</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-sky-500"></div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">SpO2</span>
                      </div>
                  </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} minTickGap={30} />
                        <YAxis domain={[40, 160]} hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                        <Line type="monotone" dataKey="spo2" stroke="#0ea5e9" strokeWidth={3} dot={false} activeDot={{r: 6}} strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
              </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-800 border-none">
              <div className="p-3 bg-white dark:bg-slate-700 rounded-full shadow-sm">
                  <Wifi className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">Active Sensors</h4>
                  <p className="text-xs text-slate-500">3 Devices Online (CGM, Pump, Watch)</p>
              </div>
          </Card>
          
           <Card className="p-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-800 border-none">
              <div className="p-3 bg-white dark:bg-slate-700 rounded-full shadow-sm">
                  <Activity className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">Data Frequency</h4>
                  <p className="text-xs text-slate-500">High Resolution (1Hz Sampling)</p>
              </div>
          </Card>

           <Card className="p-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-800 border-none">
              <div className="p-3 bg-white dark:bg-slate-700 rounded-full shadow-sm">
                  <BrainCircuit className="w-6 h-6 text-brand-500" />
              </div>
              <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">AI Anomaly Scan</h4>
                  <p className="text-xs text-slate-500">Running... No threats detected.</p>
              </div>
          </Card>
      </div>
    </div>
  );
};
