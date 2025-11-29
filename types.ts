
import React from 'react';

export enum Page {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  HEALTH_CHAT = 'health_chat',
  MEDICAL_TRACKER = 'medical_tracker',
  IOT_MONITOR = 'iot_monitor',
  SOS = 'sos',
  INSURANCE = 'insurance',
  MEDICAL_INTELLIGENCE = 'medical_intelligence',
  HOSPITAL_ADMIN = 'hospital_admin',
  ALERTS = 'alerts',
  COMMUNITY = 'community',
  SETTINGS = 'settings',
  MAP = 'map',
  // Admin Specific Pages
  ADMIN_DASHBOARD = 'admin_dashboard',
  STAFF_MANAGEMENT = 'staff_management',
  BED_ALLOCATION = 'bed_allocation',
  PHARMACY = 'pharmacy',
  BILLING = 'billing',
  APPOINTMENTS = 'appointments',
  AMBULANCE_COMMAND = 'ambulance_command'
}

export type UserRole = 'patient' | 'admin';

export interface NavItem {
  id: Page;
  label: string;
  icon: React.FC<any>;
}

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  height?: string;
  weight?: string;
  bloodType?: string;
  gender?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  avatar?: string;
}

// --- Agent Types ---
export interface AgentThought {
  id: string;
  timestamp: Date;
  category: 'Health' | 'Logistics' | 'Security' | 'Environment' | 'Resource' | 'Medical_Intel';
  text: string;
  confidence: number; // 0-100
  status: 'thinking' | 'acting' | 'completed' | 'idle';
}

export interface AgentAction {
  id: string;
  title: string;
  description: string;
  type: 'intervention' | 'automation' | 'suggestion';
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  timestamp: Date;
  autoExecuteIn?: number; // seconds (if autonomous)
}

// --- Medical Intelligence Types ---
export interface MedicalDocument {
  id: string;
  name: string;
  type: 'prescription' | 'lab_report' | 'scan' | 'transcript' | 'other';
  dateUploaded: string;
  status: 'analyzing' | 'processed' | 'error';
  content: string; // URL or Base64
  summary?: string;
  tags: string[];
  abnormalities: string[];
}

export interface MedicalMemory {
  id: string;
  sourceDocId?: string;
  date: string;
  type: 'instruction' | 'medication' | 'test_result' | 'appointment' | 'lifestyle';
  detail: string;
  status: 'active' | 'completed' | 'missed';
  confidence: number;
}

// --- Domain Types ---

export interface Staff {
  id: number;
  name: string;
  role: 'Doctor' | 'Nurse' | 'Admin' | 'Support';
  department: string;
  status: 'On Duty' | 'Off Duty' | 'On Break';
  shift: 'Morning' | 'Night' | 'Evening';
  contact: string;
  image: string;
  fatigueLevel?: number; // 0-100 for agent monitoring
}

export interface Bed {
  id: string;
  ward: string;
  number: number;
  status: 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';
  patientName?: string;
  admissionTime?: string;
  type: 'ICU' | 'General' | 'Emergency' | 'Private';
  predictedDischarge?: string; // Agent prediction
}

export interface InventoryItem {
  id: number;
  name: string;
  category: 'Medicine' | 'Equipment' | 'Consumable';
  stock: number;
  unit: string;
  minLevel: number;
  expiry: string;
  status: 'Good' | 'Low' | 'Critical';
  autoRefill?: boolean; // Agent capability
}

export interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  type: string;
  time: string;
  date: string;
  status: 'Scheduled' | 'Checked In' | 'Completed' | 'Cancelled' | 'Pending';
  notes?: string;
}

export interface Invoice {
  id: string;
  patientName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  items: string[];
}

export interface AlertIncident {
  id: string;
  type: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  time: string;
  distance: string;
  description?: string;
  status: 'New' | 'Acknowledged' | 'Resolved';
}

export interface Hospital {
  id: number;
  name: string;
  distance: string;
  rating: number;
  bedsAvailable: number;
  waitList: number;
  specialties: string[];
  coords: { x: number; y: number };
  address?: string;
}

// --- Fleet Management Types ---
export interface Driver {
    id: string;
    name: string;
    contact: string;
    status: 'Available' | 'On Trip' | 'Break';
    rating: number;
}

export interface Ambulance {
    id: string;
    plateNumber: string;
    type: 'ALS' | 'BLS' | 'Neonatal'; // Advanced Life Support, Basic, etc.
    status: 'Available' | 'Dispatched' | 'Returning' | 'Maintenance';
    location: { lat: number; lng: number };
    heading: number; // For icon rotation
    fuelLevel: number;
    speed: number;
    driverId: string;
    currentJobId?: string;
}

export interface DispatchJob {
    id: string;
    patientLocation: { lat: number; lng: number; address: string };
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    assignedAmbulanceId?: string;
    status: 'Pending' | 'En Route' | 'On Scene' | 'Transporting' | 'Completed';
    timestamp: Date;
    description: string;
    eta?: string;
}


// --- Chat/Notification Types ---
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success' | 'critical';
  time: string;
  read: boolean;
}
