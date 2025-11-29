
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, Badge, Button, Avatar } from '../components/Common';
import { 
  Users, Bed, Pill, CreditCard, Calendar, Search, Filter, Plus, 
  Trash2, CheckCircle, Clock, MoreHorizontal, AlertCircle, CheckSquare, X,
  UserPlus, Briefcase, Phone, DollarSign, FileText, Edit2, Eye, AlertTriangle, User,
  Mail, Stethoscope, Shield, Truck, BrainCircuit, Sparkles, TrendingUp, Syringe, List,
  ShoppingCart, PackageCheck, Zap, AlertOctagon, UserCheck
} from 'lucide-react';
import { useHospital } from '../contexts/HospitalContext';
import { Staff, Appointment, InventoryItem, Bed as BedType } from '../types';
import { useNotification } from '../contexts/NotificationContext';
import { useAgent } from '../contexts/AgentContext';

// --- STAFF MANAGEMENT MODULE ---
export const StaffManagement: React.FC = () => {
  const { staff, addStaff, updateStaff, updateStaffStatus, departmentMetrics } = useHospital();
  const { addAction, addThought } = useAgent();
  const { addNotification } = useNotification();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Staff>>({ role: 'Doctor', status: 'On Duty', shift: 'Morning' });
  const [filterRole, setFilterRole] = useState<'All' | 'Doctor' | 'Nurse' | 'Support' | 'Admin'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Analysis Stats
  const fatiguedStaff = staff.filter(s => (s.fatigueLevel || 0) > 80);
  const understaffedDepts = departmentMetrics.filter(d => d.load > d.staffing);

  // Simulate Agent Thinking on Mount
  useEffect(() => {
      addThought("Analyzing real-time workforce distribution...", "Resource");
      if (fatiguedStaff.length > 0) {
          setTimeout(() => addThought(`ALERT: ${fatiguedStaff.length} staff members approaching burnout threshold.`, "Health"), 1000);
      }
      if (understaffedDepts.length > 0) {
          setTimeout(() => addThought(`OPTIMIZATION: ${understaffedDepts[0].name} is understaffed vs patient load.`, "Resource"), 2000);
      }
  }, []);

  const filteredStaff = staff.filter(s => {
      const matchesRole = filterRole === 'All' || s.role === filterRole;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSearch;
  });

  const handleAdd = () => {
    if (formData.name && formData.department) {
      addStaff({
        id: Date.now(),
        name: formData.name,
        role: formData.role as any,
        department: formData.department,
        status: 'Off Duty',
        shift: formData.shift as any,
        contact: formData.contact || '555-0000',
        image: '',
        fatigueLevel: 0
      } as Staff);
      setIsAdding(false);
      setFormData({ role: 'Doctor', status: 'On Duty', shift: 'Morning' });
    }
  };

  const startEdit = (member: Staff) => {
      setEditingId(member.id);
      setFormData(member);
      setIsAdding(true);
  };

  const handleEditSave = () => {
      if (editingId && formData.name) {
          updateStaff(formData as Staff);
          setEditingId(null);
          setIsAdding(false);
          setFormData({ role: 'Doctor', status: 'On Duty', shift: 'Morning' });
      }
  };

  const executeStaffAction = (type: 'relief' | 'reassign') => {
      addNotification('success', 'Agent Action Executed', type === 'relief' ? 'Relief staff dispatched. Breaks scheduled.' : 'Staff reallocation protocols initiated.');
      addThought(type === 'relief' ? 'Schedule updated: Mandatory breaks assigned.' : 'Re-balancing departmental density.', "Resource");
  };

  return (
    <div className="space-y-6">
      {/* Agent Workforce Command Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-3 bg-slate-900 border-slate-800 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-indigo-900/20"></div>
              <div className="p-6 relative z-10 flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                          <BrainCircuit className="w-6 h-6 text-brand-400 animate-pulse" />
                          <h3 className="text-lg font-bold">AI Workforce Optimizer</h3>
                      </div>
                      <p className="text-slate-400 text-sm mb-4">Real-time fatigue monitoring & predictive staffing allocation.</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                              <div className="text-xs text-slate-400 uppercase font-bold mb-1">Burnout Risk</div>
                              <div className={`text-2xl font-bold ${fatiguedStaff.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                  {fatiguedStaff.length > 0 ? 'CRITICAL' : 'LOW'}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">{`${fatiguedStaff.length} staff > 80% fatigue`}</div>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                              <div className="text-xs text-slate-400 uppercase font-bold mb-1">Shift Efficiency</div>
                              <div className="text-2xl font-bold text-blue-400">94%</div>
                              <div className="text-xs text-slate-500 mt-1">Optimal coverage</div>
                          </div>
                      </div>
                  </div>

                  <div className="flex-1 border-l border-slate-800 pl-0 md:pl-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Agent Recommendations</h4>
                      <div className="space-y-3">
                          {fatiguedStaff.slice(0, 1).map(s => (
                              <div key={s.id} className="flex items-center justify-between p-2 bg-red-900/20 border border-red-900/50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4 text-red-400" />
                                      <span className="text-sm text-red-200">Relieve <b>{s.name}</b> (Fatigue: {s.fatigueLevel}%)</span>
                                  </div>
                                  <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-500 border-none" onClick={() => executeStaffAction('relief')}>Approve</Button>
                              </div>
                          ))}
                          {understaffedDepts.map(d => (
                              <div key={d.name} className="flex items-center justify-between p-2 bg-amber-900/20 border border-amber-900/50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                      <Users className="w-4 h-4 text-amber-400" />
                                      <span className="text-sm text-amber-200"><b>{d.name}</b> Understaffed (Load: {d.load}%)</span>
                                  </div>
                                  <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-500 border-none" onClick={() => executeStaffAction('reassign')}>Auto-Fill</Button>
                              </div>
                          ))}
                          {fatiguedStaff.length === 0 && understaffedDepts.length === 0 && (
                              <div className="flex items-center gap-2 text-emerald-400 text-sm p-2">
                                  <CheckCircle className="w-4 h-4" /> System Optimal. No actions required.
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
             {['All', 'Doctor', 'Nurse', 'Support', 'Admin'].map(r => (
                 <button 
                    key={r}
                    onClick={() => setFilterRole(r as any)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterRole === r ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                 >
                     {r}
                 </button>
             ))}
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search name or department..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
              </div>
              <Button icon={Plus} onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ role: 'Doctor', status: 'On Duty', shift: 'Morning' }); }}>Add Staff</Button>
          </div>
      </div>

      {/* Add/Edit Form Modal (Inline for now) */}
      {isAdding && (
          <Card className="border-brand-200 dark:border-brand-900 bg-brand-50/50 dark:bg-brand-900/10">
              <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-brand-800 dark:text-brand-300">{editingId ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
                      <button onClick={() => setIsAdding(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <input type="text" placeholder="Full Name" className="p-2 rounded-lg border text-sm" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                      <select className="p-2 rounded-lg border text-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                          <option>Doctor</option><option>Nurse</option><option>Support</option><option>Admin</option>
                      </select>
                      <input type="text" placeholder="Department" className="p-2 rounded-lg border text-sm" value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} />
                      <select className="p-2 rounded-lg border text-sm" value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value as any})}>
                          <option>Morning</option><option>Evening</option><option>Night</option>
                      </select>
                      <input type="text" placeholder="Contact" className="p-2 rounded-lg border text-sm" value={formData.contact || ''} onChange={e => setFormData({...formData, contact: e.target.value})} />
                      
                      <div className="md:col-span-3 flex justify-end gap-2">
                          <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                          <Button onClick={editingId ? handleEditSave : handleAdd}>{editingId ? 'Save Changes' : 'Create Staff'}</Button>
                      </div>
                  </div>
              </div>
          </Card>
      )}

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStaff.map((member) => (
              <Card key={member.id} className="overflow-hidden group hover:shadow-lg transition-all">
                  <div className="p-5 flex flex-col items-center text-center">
                      <div className="relative">
                          <Avatar name={member.name} size="xl" className="mb-3 text-2xl" />
                          <div className={`absolute bottom-3 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                              member.status === 'On Duty' ? 'bg-emerald-500' : member.status === 'On Break' ? 'bg-amber-500' : 'bg-slate-400'
                          }`}></div>
                      </div>
                      
                      <h3 className="font-bold text-slate-800 dark:text-white truncate w-full">{member.name}</h3>
                      <p className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-1">{member.role}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{member.department} • {member.shift} Shift</p>
                      
                      {/* Fatigue Indicator */}
                      {(member.fatigueLevel !== undefined) && (
                          <div className="w-full mb-4">
                              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                  <span>Fatigue</span>
                                  <span>{member.fatigueLevel}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${member.fatigueLevel > 80 ? 'bg-red-500' : member.fatigueLevel > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                    style={{width: `${member.fatigueLevel}%`}}
                                  ></div>
                              </div>
                          </div>
                      )}

                      <div className="flex items-center gap-2 w-full">
                          <select 
                              className="flex-1 bg-slate-50 dark:bg-slate-700 text-xs border-none rounded-lg py-1.5 text-center focus:ring-0 cursor-pointer"
                              value={member.status}
                              onChange={(e) => updateStaffStatus(member.id, e.target.value as any)}
                          >
                              <option value="On Duty">On Duty</option>
                              <option value="On Break">On Break</option>
                              <option value="Off Duty">Off Duty</option>
                          </select>
                          <button onClick={() => startEdit(member)} className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-3 flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {member.contact}</span>
                      {member.fatigueLevel && member.fatigueLevel > 80 && (
                          <span className="flex items-center gap-1 text-red-500 font-bold"><AlertCircle className="w-3 h-3"/> Overworked</span>
                      )}
                  </div>
              </Card>
          ))}
      </div>
    </div>
  );
};


// --- BED ALLOCATION MODULE ---
export const BedAllocation: React.FC = () => {
  const { beds, assignBed, dischargeBed, erQueue } = useHospital();
  const { addThought } = useAgent();
  const { addNotification } = useNotification();
  const [selectedBed, setSelectedBed] = useState<BedType | null>(null);
  const [patientName, setPatientName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Highlighting Logic for newly occupied beds
  const [highlightedBeds, setHighlightedBeds] = useState<Set<string>>(new Set());

  // Agent Suggestions
  const [suggestedBedId, setSuggestedBedId] = useState<string | null>(null);

  const occupancyRate = Math.round((beds.filter(b => b.status === 'Occupied').length / beds.length) * 100);

  useEffect(() => {
      // Run Agent Analysis on Mount
      addThought("Scanning bed occupancy and incoming ER queue...", "Resource");
      if (occupancyRate > 85) {
          setTimeout(() => addThought("WARNING: Occupancy > 85%. Predicting shortage in ICU Ward within 4 hours.", "Resource"), 1500);
      }
  }, []);

  const handleAssign = () => {
      if (selectedBed && patientName) {
          assignBed(selectedBed.id, patientName);
          setHighlightedBeds(prev => new Set(prev).add(selectedBed.id));
          setTimeout(() => {
             setHighlightedBeds(prev => {
                 const newSet = new Set(prev);
                 newSet.delete(selectedBed.id);
                 return newSet;
             });
          }, 3000);
          setSelectedBed(null);
          setPatientName('');
          setSuggestedBedId(null);
          addNotification('success', 'Patient Admitted', `Bed ${selectedBed.number} assigned successfully.`);
      }
  };

  const handleDischarge = (bed: BedType) => {
      if (confirm(`Discharge patient from ${bed.ward} Bed ${bed.number}?`)) {
          dischargeBed(bed.id);
          addThought(`Bed ${bed.number} marked for cleaning cycle.`, "Logistics");
      }
  };

  // Smart Allocate: Find best bed for high severity patient
  const smartAllocate = (patient: any) => {
      const availableBeds = beds.filter(b => b.status === 'Available');
      // Heuristic: ICU for severity > 7, then General
      let bestBed = availableBeds.find(b => patient.aiSeverity > 7 ? b.ward === 'ICU' : b.ward === 'General');
      
      // Fallback
      if (!bestBed) bestBed = availableBeds[0];

      if (bestBed) {
          setSuggestedBedId(bestBed.id);
          setSelectedBed(bestBed);
          setPatientName(`[ER] ${patient.predictedDiagnosis}`); // Auto-fill
          addThought(`MATCH FOUND: Assigning ${patient.predictedDiagnosis} to ${bestBed.ward} Bed ${bestBed.number}.`, "Resource");
      } else {
          addNotification('error', 'Capacity Full', 'No suitable beds available for allocation.');
      }
  };

  return (
      <div className="space-y-6">
          {/* AI Bed Orchestrator */}
          <Card className="bg-slate-900 border-slate-800 text-white p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Bed className="w-32 h-32 text-white" /></div>
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                  <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                          <BrainCircuit className="w-6 h-6 text-purple-400" />
                          <h3 className="text-xl font-bold">AI Bed Orchestrator</h3>
                      </div>
                      <p className="text-slate-400 text-sm mb-4">Predictive capacity planning & intelligent triage allocation.</p>
                      <div className="flex gap-4">
                          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                              <div className="text-xs text-slate-500 uppercase font-bold">Occupancy</div>
                              <div className={`text-2xl font-bold ${occupancyRate > 90 ? 'text-red-400' : 'text-white'}`}>{occupancyRate}%</div>
                          </div>
                          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                              <div className="text-xs text-slate-500 uppercase font-bold">Prediction</div>
                              <div className="text-sm font-medium text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Stable Trend</div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="flex-1 border-l border-slate-800 pl-0 md:pl-8">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><AlertOctagon className="w-3 h-3 text-amber-500"/> Incoming High Priority</h4>
                      <div className="space-y-2">
                          {erQueue.filter(p => p.status === 'Triaged' || p.status === 'Incoming').slice(0, 2).map(p => (
                              <div key={p.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                                  <div>
                                      <div className="flex items-center gap-2">
                                          <span className="text-sm font-bold text-white">{p.predictedDiagnosis}</span>
                                          <Badge variant={p.aiSeverity > 8 ? 'danger' : 'warning'} className="text-[10px] py-0">Sev: {p.aiSeverity}</Badge>
                                      </div>
                                      <p className="text-xs text-slate-500">{p.symptoms}</p>
                                  </div>
                                  <Button size="sm" className="h-8 text-xs" icon={Zap} onClick={() => smartAllocate(p)}>Smart Allocate</Button>
                              </div>
                          ))}
                          {erQueue.length === 0 && <p className="text-sm text-slate-500">No pending ER cases.</p>}
                      </div>
                  </div>
              </div>
          </Card>

          <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bed Matrix</h2>
              <div className="flex items-center gap-2">
                  <div className="flex gap-2 text-xs font-medium mr-4">
                      <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Available</span>
                      <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Occupied</span>
                      <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Cleaning</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1 flex">
                      <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}><Users className="w-4 h-4"/></button>
                      <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}><List className="w-4 h-4"/></button>
                  </div>
              </div>
          </div>

          {/* Admission Modal */}
          {selectedBed && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
                  <Card className="w-96 p-6 shadow-2xl relative overflow-hidden">
                      {suggestedBedId === selectedBed.id && (
                          <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                      )}
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          Admit to {selectedBed.ward} - Bed {selectedBed.number}
                          {suggestedBedId === selectedBed.id && <Sparkles className="w-4 h-4 text-purple-500" />}
                      </h3>
                      <div className="space-y-4">
                          <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Patient Name / ID</label>
                              <input 
                                autoFocus
                                type="text" 
                                className="w-full border rounded-lg p-2 mt-1" 
                                value={patientName} 
                                onChange={e => setPatientName(e.target.value)} 
                                placeholder="Enter full name"
                              />
                          </div>
                          
                          {suggestedBedId === selectedBed.id && (
                              <div className="p-2 bg-purple-50 text-purple-700 text-xs rounded-lg border border-purple-100 flex items-center gap-2">
                                  <BrainCircuit className="w-3 h-3" /> AI Recommended Match based on Severity.
                              </div>
                          )}

                          <div className="flex gap-2 justify-end">
                              <Button variant="ghost" onClick={() => { setSelectedBed(null); setSuggestedBedId(null); }}>Cancel</Button>
                              <Button onClick={handleAssign} disabled={!patientName}>Confirm Admission</Button>
                          </div>
                      </div>
                  </Card>
              </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {beds.map(bed => {
                  const isHighlighted = highlightedBeds.has(bed.id);
                  const isSuggested = suggestedBedId === bed.id;
                  
                  return (
                    <Card 
                        key={bed.id} 
                        className={`relative overflow-hidden transition-all duration-500 
                            ${isHighlighted ? 'ring-4 ring-rose-500/50 scale-105 shadow-xl' : ''}
                            ${isSuggested ? 'ring-2 ring-purple-500 shadow-purple-500/20 shadow-xl scale-[1.02]' : 'hover:scale-[1.02]'}
                        `}
                    >
                        {/* Status Strip */}
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${
                            bed.status === 'Available' ? 'bg-emerald-500' : 
                            bed.status === 'Occupied' ? 'bg-rose-500' : 
                            bed.status === 'Cleaning' ? 'bg-amber-500' : 'bg-slate-300'
                        }`}></div>

                        <div className="p-4 pl-6">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="neutral" className="text-[10px]">{bed.type}</Badge>
                                <span className={`text-xs font-bold uppercase ${
                                    bed.status === 'Available' ? 'text-emerald-600' : 
                                    bed.status === 'Occupied' ? 'text-rose-600' : 'text-amber-600'
                                }`}>{bed.status}</span>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Bed {bed.number}</h3>
                            <p className="text-xs text-slate-500 uppercase font-bold mb-4">{bed.ward} Ward</p>

                            {bed.status === 'Occupied' ? (
                                <div className="space-y-3">
                                    <div className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                                        <p className="text-xs text-slate-400">Patient</p>
                                        <p className="font-semibold text-sm text-slate-800 dark:text-white truncate">{bed.patientName}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3"/> {bed.admissionTime}</p>
                                    </div>
                                    <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => handleDischarge(bed)}>
                                        Discharge
                                    </Button>
                                </div>
                            ) : bed.status === 'Available' ? (
                                <Button 
                                    size="sm" 
                                    className={`w-full border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 ${isSuggested ? 'bg-purple-600 text-white hover:bg-purple-700 border-none animate-pulse' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                                    icon={isSuggested ? Sparkles : UserPlus}
                                    onClick={() => setSelectedBed(bed)}
                                >
                                    {isSuggested ? 'Accept Recommendation' : 'Assign Patient'}
                                </Button>
                            ) : (
                                <div className="text-center py-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                                    Housekeeping Active
                                </div>
                            )}
                        </div>
                    </Card>
                  );
              })}
          </div>
      </div>
  );
};

// ... Helper for Loader Icon ...
function Loader2(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>;
}


// --- PHARMACY MODULE ---
export const Pharmacy: React.FC = () => {
    const { inventory, updateInventory } = useHospital();
    const { addNotification } = useNotification();
    const [search, setSearch] = useState('');
    
    // Procurement State
    const [isProcurementOpen, setIsProcurementOpen] = useState(false);
    const [orderSummary, setOrderSummary] = useState<{items: any[], totalCost: number} | null>(null);

    // AI Logic for Insights
    const insights = useMemo(() => {
        const alerts = [];
        const expiringSoon = inventory.filter(i => {
             const expiry = new Date(i.expiry);
             const now = new Date();
             const threeMonths = new Date();
             threeMonths.setMonth(now.getMonth() + 3);
             return expiry < threeMonths;
        });
        const lowStock = inventory.filter(i => i.status === 'Low' || i.status === 'Critical');

        if (lowStock.length > 0) {
            alerts.push({ 
                type: 'critical', 
                title: 'Immediate Restock Required', 
                items: lowStock.slice(0, 3).map(i => `${i.name} (${i.stock} ${i.unit})`)
            });
        }
        if (expiringSoon.length > 0) {
            alerts.push({
                type: 'warning',
                title: 'Expiry Watchlist',
                items: expiringSoon.slice(0, 3).map(i => `Dispose ${i.name} by ${i.expiry}`)
            });
        }
        return alerts;
    }, [inventory]);

    const handleGenerateOrder = () => {
        const lowStock = inventory.filter(i => i.status === 'Low' || i.status === 'Critical');
        if (lowStock.length === 0) {
            addNotification('info', 'Inventory Healthy', 'No low stock items found. Procurement unnecessary.');
            return;
        }

        const items = lowStock.map(i => ({
            ...i,
            qtyNeeded: Math.max(0, (i.minLevel * 2) - i.stock),
            estCost: (Math.random() * 500 + 100).toFixed(0) // Mock cost
        }));

        const totalCost = items.reduce((acc, curr) => acc + (parseInt(curr.estCost) * 1), 0); // Simplified calc
        setOrderSummary({ items, totalCost });
        setIsProcurementOpen(true);
    };

    const confirmOrder = () => {
        if (!orderSummary) return;
        
        // Update Inventory
        orderSummary.items.forEach(item => {
            updateInventory(item.id, item.stock + item.qtyNeeded);
        });

        setIsProcurementOpen(false);
        addNotification('success', 'Order Placed', `Procurement order #${Math.floor(Math.random()*10000)} initiated successfully.`);
    };

    const filteredInventory = inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            
            {/* Procurement Modal */}
            {isProcurementOpen && orderSummary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <Card className="w-full max-w-lg p-0 overflow-hidden shadow-2xl">
                         <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                             <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-brand-500" /> Procurement Order
                                </h3>
                                <p className="text-xs text-slate-500">Auto-generated based on low stock levels</p>
                             </div>
                             <button onClick={() => setIsProcurementOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                         </div>
                         <div className="p-6 max-h-[60vh] overflow-y-auto">
                             <table className="w-full text-sm">
                                 <thead className="text-xs font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800">
                                     <tr>
                                         <th className="p-2 text-left">Item</th>
                                         <th className="p-2 text-center">Current</th>
                                         <th className="p-2 text-center">Order Qty</th>
                                         <th className="p-2 text-right">Est. Cost</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                     {orderSummary.items.map((item, i) => (
                                         <tr key={i}>
                                             <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{item.name}</td>
                                             <td className="p-3 text-center text-red-500 font-bold">{item.stock}</td>
                                             <td className="p-3 text-center text-emerald-600 font-bold">+{item.qtyNeeded}</td>
                                             <td className="p-3 text-right">₹{item.estCost}</td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                         <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                             <div className="text-lg font-bold text-slate-800 dark:text-white">
                                 Total: <span className="text-brand-600">₹{orderSummary.totalCost.toLocaleString()}</span>
                             </div>
                             <div className="flex gap-3">
                                 <Button variant="ghost" onClick={() => setIsProcurementOpen(false)}>Cancel</Button>
                                 <Button onClick={confirmOrder} icon={PackageCheck}>Confirm Order</Button>
                             </div>
                         </div>
                    </Card>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                {/* AI Insight Section */}
                <Card className="md:w-1/3 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none shadow-xl">
                    <CardHeader 
                        title="AI Inventory Intelligence" 
                        icon={<BrainCircuit className="w-5 h-5 text-indigo-400" />}
                        className="border-white/10"
                    />
                    <CardContent className="space-y-4">
                        {insights.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-indigo-200/50">
                                <CheckCircle className="w-10 h-10 mb-2" />
                                <p className="text-sm">Inventory Optimized</p>
                            </div>
                        ) : (
                            insights.map((insight, idx) => (
                                <div key={idx} className={`p-3 rounded-xl ${insight.type === 'critical' ? 'bg-rose-500/20 border border-rose-500/30' : 'bg-amber-500/20 border border-amber-500/30'}`}>
                                    <h4 className={`text-sm font-bold mb-2 flex items-center gap-2 ${insight.type === 'critical' ? 'text-rose-300' : 'text-amber-300'}`}>
                                        {insight.type === 'critical' ? <AlertCircle className="w-4 h-4"/> : <Clock className="w-4 h-4"/>}
                                        {insight.title}
                                    </h4>
                                    <ul className="text-xs space-y-1 text-slate-300">
                                        {insight.items.map((item, i) => <li key={i}>• {item}</li>)}
                                    </ul>
                                </div>
                            ))
                        )}
                        <Button 
                            className="w-full bg-indigo-600 hover:bg-indigo-500 border-none text-xs"
                            onClick={handleGenerateOrder}
                        >
                            Generate Procurement Order
                        </Button>
                    </CardContent>
                </Card>

                {/* Main Table */}
                <div className="md:w-2/3 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search inventory..."
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <Button icon={Plus} variant="secondary">Add Item</Button>
                    </div>

                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="p-4">Item Name</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Stock Level</th>
                                        <th className="p-4">Expiry</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredInventory.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4 font-medium text-slate-800 dark:text-white">
                                                {item.name}
                                                {item.status !== 'Good' && (
                                                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${item.status === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                        {item.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-slate-500">{item.category}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${item.status === 'Good' ? 'bg-emerald-500' : item.status === 'Low' ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                            style={{ width: `${Math.min(100, (item.stock / (item.minLevel * 2)) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-mono">{item.stock} {item.unit}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-500 font-mono">{item.expiry}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button 
                                                        onClick={() => updateInventory(item.id, item.stock + 10)}
                                                        className="p-1 hover:bg-emerald-50 text-emerald-600 rounded" title="Add Stock"
                                                    ><Plus className="w-4 h-4"/></button>
                                                    <button className="p-1 hover:bg-slate-100 text-slate-400 rounded"><MoreHorizontal className="w-4 h-4"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};


// --- APPOINTMENTS MODULE ---
export const Appointments: React.FC = () => {
    const { appointments, addAppointment, updateAppointmentStatus, staff } = useHospital();
    const [isScheduling, setIsScheduling] = useState(false);
    
    // Form State
    const [newAppt, setNewAppt] = useState({
        patientName: '',
        doctorName: '',
        type: 'Check-up',
        date: '',
        time: ''
    });

    const doctors = staff.filter(s => s.role === 'Doctor');

    const handleSchedule = () => {
        if (newAppt.patientName && newAppt.doctorName && newAppt.date) {
            addAppointment({
                id: Date.now(),
                patientName: newAppt.patientName,
                doctorName: newAppt.doctorName,
                type: newAppt.type,
                date: newAppt.date,
                time: newAppt.time || '09:00 AM', // Default if missed
                status: 'Scheduled'
            });
            setIsScheduling(false);
            setNewAppt({ patientName: '', doctorName: '', type: 'Check-up', date: '', time: '' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Appointment Management</h2>
                <Button icon={Plus} onClick={() => setIsScheduling(true)}>New Appointment</Button>
            </div>

            {/* Scheduling Modal */}
            {isScheduling && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <Card className="w-full max-w-md p-6 shadow-2xl relative">
                        <button onClick={() => setIsScheduling(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-brand-500" /> Schedule Visit
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Patient Name</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 mt-1"
                                    placeholder="Enter full name"
                                    value={newAppt.patientName}
                                    onChange={e => setNewAppt({...newAppt, patientName: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Assign Doctor</label>
                                <select 
                                    className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 mt-1"
                                    value={newAppt.doctorName}
                                    onChange={e => setNewAppt({...newAppt, doctorName: e.target.value})}
                                >
                                    <option value="">Select a Doctor</option>
                                    {doctors.map(d => <option key={d.id} value={d.name}>{d.name} ({d.department})</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 mt-1"
                                        value={newAppt.date}
                                        onChange={e => setNewAppt({...newAppt, date: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Time</label>
                                    <input 
                                        type="time" 
                                        className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 mt-1"
                                        value={newAppt.time}
                                        onChange={e => setNewAppt({...newAppt, time: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Visit Type</label>
                                <div className="flex gap-2 mt-1">
                                    {['Check-up', 'Consultation', 'Follow-up', 'Emergency'].map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setNewAppt({...newAppt, type})}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${newAppt.type === type ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-slate-200 text-slate-600'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button className="w-full" onClick={handleSchedule} disabled={!newAppt.patientName || !newAppt.doctorName}>
                                    Confirm Schedule
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {appointments.map(appt => (
                    <Card key={appt.id} className="flex flex-col md:flex-row items-center p-4 gap-4 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-600 dark:text-slate-300">
                                <span className="text-xs font-bold uppercase">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-xl font-bold">{new Date(appt.date).getDate()}</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{appt.patientName}</h3>
                                <Badge variant={appt.status === 'Checked In' ? 'success' : appt.status === 'Pending' ? 'warning' : 'neutral'}>
                                    {appt.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-3">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {appt.time}</span>
                                <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3"/> {appt.doctorName}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            {appt.status === 'Scheduled' && (
                                <Button size="sm" onClick={() => updateAppointmentStatus(appt.id, 'Checked In')} className="flex-1 md:flex-none">Check In</Button>
                            )}
                            {appt.status === 'Checked In' && (
                                <Button size="sm" variant="secondary" onClick={() => updateAppointmentStatus(appt.id, 'Completed')} className="flex-1 md:flex-none">Complete</Button>
                            )}
                            <Button size="sm" variant="ghost" icon={MoreHorizontal} className="hidden md:flex"/>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
