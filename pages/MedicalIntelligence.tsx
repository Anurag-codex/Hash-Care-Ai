
import React, { useState } from 'react';
import { MedicalAgentPanel } from '../components/MedicalAgentPanel';
import { useHospital } from '../contexts/HospitalContext';
import { useUser } from '../contexts/UserContext';
import { Calendar, Plus, X } from 'lucide-react';
import { Button, Avatar, Badge } from '../components/Common';

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; noPadding?: boolean; onClick?: () => void }> = ({ children, className = '', noPadding = false, onClick }) => (
  <div onClick={onClick} className={`bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700 shadow-sm rounded-3xl overflow-hidden transition-all hover:shadow-md hover:scale-[1.005] ${className}`}>
    <div className={noPadding ? '' : 'p-6'}>
      {children}
    </div>
  </div>
);

export const MedicalIntelligence: React.FC = () => {
    const { user } = useUser();
    const { appointments, addAppointment, staff } = useHospital();
    
    // Appointment Booking State
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingStep, setBookingStep] = useState(1);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const upcomingAppointments = appointments
        .filter(a => a.status !== 'Completed' && a.status !== 'Cancelled')
        .slice(0, 5);

    const handleBookAppointment = () => {
        if (selectedDoctor && selectedTime) {
            addAppointment({
                id: Date.now(),
                patientName: user?.name || 'Patient',
                doctorName: selectedDoctor,
                type: 'Consultation',
                date: new Date().toISOString().split('T')[0],
                time: selectedTime,
                status: 'Scheduled'
            });
            setIsBookingOpen(false);
            // Reset
            setBookingStep(1); setSelectedDept(''); setSelectedDoctor(''); setSelectedTime('');
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Medical Intelligence</h1>
                <p className="text-slate-500 dark:text-slate-400">Autonomous health insights and schedule management</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Medical Agent Panel (Takes up 2 cols on large screens) */}
                <div className="lg:col-span-2 h-[600px]">
                    <MedicalAgentPanel />
                </div>

                {/* Upcoming Appointments Section */}
                <div className="space-y-6">
                    <GlassCard className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-500" /> Upcoming Appointments
                            </h3>
                            <Button size="sm" variant="ghost" onClick={() => setIsBookingOpen(true)} icon={Plus}>Book New</Button>
                        </div>
                        <div className="space-y-4 overflow-y-auto flex-1 pr-1 max-h-[500px]">
                            {upcomingAppointments.length > 0 ? upcomingAppointments.map((appt) => (
                                <div key={appt.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="neutral" className="text-[10px]">{appt.type}</Badge>
                                        <span className="text-xs font-bold text-slate-400">{appt.time}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Avatar name={appt.doctorName} size="sm" />
                                        <div>
                                            <p className="font-bold text-sm text-slate-800 dark:text-white">{appt.doctorName}</p>
                                            <p className="text-xs text-slate-500">{new Date(appt.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center text-slate-400 text-sm py-10 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                    No upcoming appointments.
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* --- Booking Modal --- */}
            {isBookingOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Book Appointment</h3>
                            <button onClick={() => setIsBookingOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        
                        {bookingStep === 1 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-500">Select Department</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Cardiology', 'General', 'Neurology', 'Pediatrics'].map(dept => (
                                        <button 
                                            key={dept} 
                                            onClick={() => { setSelectedDept(dept); setBookingStep(2); }}
                                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-left transition-all"
                                        >
                                            <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{dept}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {bookingStep === 2 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-500">Select Doctor</p>
                                <div className="space-y-2">
                                    {staff.filter(s => s.role === 'Doctor' && (selectedDept === 'General' || s.department === selectedDept)).map(doc => (
                                        <button 
                                            key={doc.id} 
                                            onClick={() => { setSelectedDoctor(doc.name); setBookingStep(3); }}
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-left flex items-center gap-3 transition-all"
                                        >
                                            <Avatar name={doc.name} />
                                            <div>
                                                <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{doc.name}</p>
                                                <p className="text-xs text-slate-500">{doc.department}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <Button variant="ghost" onClick={() => setBookingStep(1)} className="w-full">Back</Button>
                            </div>
                        )}

                        {bookingStep === 3 && (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-500">Select Time Slot</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'].map(time => (
                                        <button 
                                            key={time} 
                                            onClick={() => setSelectedTime(time)}
                                            className={`p-2 rounded-lg text-xs font-bold border transition-all ${selectedTime === time ? 'bg-brand-500 text-white border-brand-500' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <Button variant="ghost" onClick={() => setBookingStep(2)} className="flex-1">Back</Button>
                                    <Button onClick={handleBookAppointment} disabled={!selectedTime} className="flex-1">Confirm</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
