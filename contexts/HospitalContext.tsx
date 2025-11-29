
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Staff, Bed, InventoryItem, Appointment, Invoice, AlertIncident } from '../types';

export interface ERTriagePatient {
  id: string;
  time: string;
  symptoms: string;
  aiSeverity: number; // 1-10 score
  predictedDiagnosis: string;
  status: 'Incoming' | 'Triaged' | 'Admitted';
}

export interface DepartmentMetric {
    name: string;
    load: number; // 0-100
    staffing: number; // 0-100
    efficiency: number; // 0-100
}

interface HospitalContextType {
  staff: Staff[];
  beds: Bed[];
  inventory: InventoryItem[];
  appointments: Appointment[];
  invoices: Invoice[];
  alerts: AlertIncident[];
  erQueue: ERTriagePatient[];
  departmentMetrics: DepartmentMetric[];
  
  // Actions
  addStaff: (staff: Staff) => void;
  updateStaff: (staff: Staff) => void;
  updateStaffStatus: (id: number, status: Staff['status']) => void;
  assignBed: (bedId: string, patientName: string) => void;
  dischargeBed: (bedId: string) => void;
  updateInventory: (id: number, newStock: number) => void;
  addAppointment: (appt: Appointment) => void;
  updateAppointmentStatus: (id: number, status: Appointment['status']) => void;
  createInvoice: (invoice: Invoice) => void;
  resolveAlert: (id: string) => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Initial Data ---
  const [staff, setStaff] = useState<Staff[]>([
    { id: 1, name: "Dr. Anjali Sharma", role: "Doctor", department: "Cardiology", status: "On Duty", shift: "Morning", contact: "98765-11001", image: "", fatigueLevel: 45 },
    { id: 2, name: "Dr. Vikram Singh", role: "Doctor", department: "Emergency", status: "On Duty", shift: "Morning", contact: "98765-11002", image: "", fatigueLevel: 82 },
    { id: 3, name: "Nurse Priya Patel", role: "Nurse", department: "ICU", status: "On Duty", shift: "Morning", contact: "98765-11003", image: "", fatigueLevel: 90 },
    { id: 4, name: "Dr. Arjun Reddy", role: "Doctor", department: "Neurology", status: "Off Duty", shift: "Night", contact: "98765-11004", image: "", fatigueLevel: 10 },
    { id: 5, name: "Dr. Meera Iyer", role: "Doctor", department: "Pediatrics", status: "On Duty", shift: "Evening", contact: "98765-11005", image: "", fatigueLevel: 30 },
    { id: 6, name: "Ramesh Kumar", role: "Support", department: "Housekeeping", status: "On Duty", shift: "Morning", contact: "98765-11020", image: "", fatigueLevel: 60 },
    { id: 7, name: "Sunita Devi", role: "Support", department: "Sanitation", status: "On Break", shift: "Morning", contact: "98765-11021", image: "", fatigueLevel: 55 },
    { id: 8, name: "Dr. Sanjay Verma", role: "Doctor", department: "ENT", status: "On Break", shift: "Evening", contact: "98765-11008", image: "", fatigueLevel: 40 },
    { id: 9, name: "Sister Mary", role: "Nurse", department: "General Ward", status: "On Duty", shift: "Night", contact: "98765-11009", image: "", fatigueLevel: 75 },
    { id: 10, name: "Rajesh Singh", role: "Support", department: "Security", status: "On Duty", shift: "Night", contact: "98765-11030", image: "", fatigueLevel: 20 },
    { id: 11, name: "Amitabh Bachchan", role: "Admin", department: "Management", status: "On Duty", shift: "Morning", contact: "98765-11040", image: "", fatigueLevel: 50 },
    { id: 12, name: "Tech. Rahul Roy", role: "Support", department: "Lab", status: "On Duty", shift: "Evening", contact: "98765-11050", image: "", fatigueLevel: 35 },
  ]);

  const [beds, setBeds] = useState<Bed[]>([
    { id: "ICU-01", ward: "ICU", number: 1, status: "Occupied", patientName: "Rahul Verma (45M)", type: "ICU", admissionTime: "2d ago" },
    { id: "ICU-02", ward: "ICU", number: 2, status: "Available", type: "ICU" },
    { id: "ICU-03", ward: "ICU", number: 3, status: "Maintenance", type: "ICU" },
    { id: "ICU-04", ward: "ICU", number: 4, status: "Occupied", patientName: "Anita Roy (62F)", type: "ICU", admissionTime: "5h ago" },
    { id: "GEN-01", ward: "General", number: 101, status: "Occupied", patientName: "Sneha Gupta (28F)", type: "General", admissionTime: "1d ago" },
    { id: "GEN-02", ward: "General", number: 102, status: "Available", type: "General" },
    { id: "GEN-03", ward: "General", number: 103, status: "Available", type: "General" },
    { id: "GEN-04", ward: "General", number: 104, status: "Cleaning", type: "General" },
    { id: "ER-01", ward: "Emergency", number: 1, status: "Occupied", patientName: "Amit Kumar (33M)", type: "Emergency", admissionTime: "30m ago" },
    { id: "ER-02", ward: "Emergency", number: 2, status: "Occupied", patientName: "Sanya Malhotra (22F)", type: "Emergency", admissionTime: "1h ago" },
    { id: "ER-03", ward: "Emergency", number: 3, status: "Available", type: "Emergency" },
  ]);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 1, name: "Dolo 650", category: "Medicine", stock: 850, unit: "strips", minLevel: 200, expiry: "2025-12", status: "Good" },
    { id: 2, name: "Augmentin 625", category: "Medicine", stock: 120, unit: "strips", minLevel: 50, expiry: "2024-11", status: "Good" },
    { id: 3, name: "Pan-D", category: "Medicine", stock: 45, unit: "strips", minLevel: 100, expiry: "2025-05", status: "Low" },
    { id: 4, name: "Ascoril LS", category: "Medicine", stock: 15, unit: "bottles", minLevel: 30, expiry: "2024-09", status: "Critical" },
    { id: 5, name: "Volini Gel", category: "Consumable", stock: 60, unit: "tubes", minLevel: 20, expiry: "2026-01", status: "Good" },
    { id: 6, name: "Betadine", category: "Consumable", stock: 200, unit: "tubes", minLevel: 50, expiry: "2025-08", status: "Good" },
    { id: 7, name: "Shelcal 500", category: "Medicine", stock: 300, unit: "strips", minLevel: 100, expiry: "2027-01", status: "Good" },
    { id: 8, name: "Montair LC", category: "Medicine", stock: 250, unit: "strips", minLevel: 100, expiry: "2026-05", status: "Good" },
    { id: 9, name: "Azithral 500", category: "Medicine", stock: 80, unit: "strips", minLevel: 50, expiry: "2025-04", status: "Good" },
    { id: 10, name: "Glycomet-GP 1", category: "Medicine", stock: 400, unit: "strips", minLevel: 150, expiry: "2025-10", status: "Good" },
    { id: 11, name: "Telma 40", category: "Medicine", stock: 350, unit: "strips", minLevel: 100, expiry: "2026-02", status: "Good" },
    { id: 12, name: "Combiflam", category: "Medicine", stock: 600, unit: "strips", minLevel: 200, expiry: "2025-11", status: "Good" },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, patientName: "Aditi Rao", doctorName: "Dr. Anjali Sharma", type: "Check-up", time: "09:00 AM", date: "2023-10-25", status: "Checked In" },
    { id: 2, patientName: "Vijay Kumar", doctorName: "Dr. Vikram Singh", type: "Emergency Follow-up", time: "10:30 AM", date: "2023-10-25", status: "Scheduled" },
    { id: 3, patientName: "Chirag Menon", doctorName: "Dr. Anjali Sharma", type: "Consultation", time: "02:00 PM", date: "2023-10-25", status: "Pending" },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: "INV-001", patientName: "Rahul Verma", amount: 1200.50, date: "2023-10-24", status: "Pending", items: ["ICU Stay (1 day)", "MRI Scan"] },
    { id: "INV-002", patientName: "Sneha Gupta", amount: 450.00, date: "2023-10-23", status: "Paid", items: ["General Ward (2 days)", "Medication"] },
  ]);

  const [alerts, setAlerts] = useState<AlertIncident[]>([
    { id: "ALT-1", type: "Cardiac Arrest", location: "ER - Bed 2", severity: "critical", time: "2m ago", distance: "0m", status: "New" },
    { id: "ALT-2", type: "Oxygen Pressure Low", location: "ICU - Unit 3", severity: "high", time: "15m ago", distance: "0m", status: "Acknowledged" },
  ]);

  const [erQueue, setErQueue] = useState<ERTriagePatient[]>([
      { id: 'ER-101', time: '10:42 AM', symptoms: 'Severe Chest Pain', aiSeverity: 9, predictedDiagnosis: 'Possible Myocardial Infarction', status: 'Incoming' },
      { id: 'ER-102', time: '10:45 AM', symptoms: 'Road Accident / Trauma', aiSeverity: 8, predictedDiagnosis: 'Fracture / Internal Bleeding', status: 'Incoming' },
      { id: 'ER-103', time: '10:55 AM', symptoms: 'High Fever (104F)', aiSeverity: 6, predictedDiagnosis: 'Viral Infection / Dengue', status: 'Triaged' },
  ]);

  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetric[]>([
      { name: 'Emergency', load: 85, staffing: 90, efficiency: 92 },
      { name: 'ICU', load: 70, staffing: 80, efficiency: 88 },
      { name: 'Cardiology', load: 60, staffing: 100, efficiency: 95 },
      { name: 'General', load: 45, staffing: 70, efficiency: 85 },
      { name: 'Pediatrics', load: 55, staffing: 85, efficiency: 90 },
  ]);

  // --- Simulation Effects ---
  useEffect(() => {
    const interval = setInterval(() => {
      let inventoryUpdated = false;
      let newAlerts: AlertIncident[] = [];

      // 1. Update Inventory
      setInventory(prev => prev.map(item => {
        if (Math.random() > 0.8) {
          const newStock = Math.max(0, item.stock - Math.floor(Math.random() * 5));
          let status: 'Good' | 'Low' | 'Critical' = 'Good';
          if (newStock < item.minLevel / 2) status = 'Critical';
          else if (newStock < item.minLevel) status = 'Low';
          
          if (status === 'Critical' && item.status !== 'Critical') {
             newAlerts.push({
                id: `INV-${Date.now()}-${item.id}`,
                type: "Critical Low Stock",
                location: "Pharmacy Storage",
                severity: "medium",
                time: "Just now",
                distance: "-",
                status: "New",
                description: `${item.name} is critically low (${newStock} ${item.unit}). Restock immediately.`
             });
          }

          inventoryUpdated = true;
          return { ...item, stock: newStock, status };
        }
        return item;
      }));

      if (newAlerts.length > 0) {
          setAlerts(prev => [...newAlerts, ...prev]);
      }

      // 2. Random Clinical Alert (Rare)
      if (Math.random() > 0.99) {
        const types = ["Hypotension Alert", "Arrhythmia Detected", "Oxygen Supply Low", "Fall Detected"];
        const locs = ["Ward A", "ICU", "ER", "Ward B"];
        const newAlert: AlertIncident = {
          id: `ALT-${Date.now()}`,
          type: types[Math.floor(Math.random() * types.length)],
          location: locs[Math.floor(Math.random() * locs.length)],
          severity: Math.random() > 0.5 ? 'high' : 'medium',
          time: 'Just now',
          distance: '0m',
          status: 'New'
        };
        setAlerts(prev => [newAlert, ...prev]);
      }

    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // --- Actions ---
  const addStaff = (newStaff: Staff) => setStaff([...staff, newStaff]);
  const updateStaff = (updatedMember: Staff) => {
    setStaff(prevStaff => prevStaff.map(s => s.id === updatedMember.id ? updatedMember : s));
  };
  const updateStaffStatus = (id: number, status: Staff['status']) => {
    setStaff(prevStaff => prevStaff.map(s => s.id === id ? { ...s, status } : s));
  };

  const assignBed = (bedId: string, patientName: string) => {
    setBeds(prevBeds => prevBeds.map(b => b.id === bedId ? { ...b, status: 'Occupied', patientName, admissionTime: "Just now" } : b));
  };
  const dischargeBed = (bedId: string) => {
    setBeds(prevBeds => prevBeds.map(b => b.id === bedId ? { ...b, status: 'Cleaning', patientName: undefined, admissionTime: undefined } : b));
  };

  const updateInventory = (id: number, newStock: number) => {
    setInventory(prevInventory => prevInventory.map(i => {
      if (i.id === id) {
        let status: 'Good' | 'Low' | 'Critical' = 'Good';
        if (newStock < i.minLevel / 2) status = 'Critical';
        else if (newStock < i.minLevel) status = 'Low';
        return { ...i, stock: newStock, status };
      }
      return i;
    }));
  };

  const addAppointment = (appt: Appointment) => setAppointments(prev => [...prev, appt]);
  const updateAppointmentStatus = (id: number, status: Appointment['status']) => {
    setAppointments(prevAppts => prevAppts.map(a => a.id === id ? { ...a, status } : a));
  };

  const createInvoice = (invoice: Invoice) => setInvoices([invoice, ...invoices]);
  const resolveAlert = (id: string) => setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== id));

  return (
    <HospitalContext.Provider value={{
      staff, beds, inventory, appointments, invoices, alerts, erQueue, departmentMetrics,
      addStaff, updateStaff, updateStaffStatus, assignBed, dischargeBed, updateInventory,
      addAppointment, updateAppointmentStatus, createInvoice, resolveAlert
    }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (context === undefined) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
