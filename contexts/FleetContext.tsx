
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ambulance, Driver, DispatchJob } from '../types';

interface FleetContextType {
    ambulances: Ambulance[];
    drivers: Driver[];
    activeJobs: DispatchJob[];
    dispatchAmbulance: (job: DispatchJob, ambulanceId: string) => void;
    addJob: (job: DispatchJob) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ambulances, setAmbulances] = useState<Ambulance[]>([
        { id: 'AMB-001', plateNumber: 'DL-01-AB-1234', type: 'ALS', status: 'Available', location: { lat: 28.61, lng: 77.20 }, heading: 0, fuelLevel: 85, speed: 0, driverId: 'DRV-1' },
        { id: 'AMB-002', plateNumber: 'DL-01-XY-9876', type: 'BLS', status: 'On Duty', location: { lat: 28.62, lng: 77.21 }, heading: 45, fuelLevel: 60, speed: 40, driverId: 'DRV-2' },
        { id: 'AMB-003', plateNumber: 'DL-02-ZZ-4567', type: 'ALS', status: 'Available', location: { lat: 28.60, lng: 77.19 }, heading: 180, fuelLevel: 90, speed: 0, driverId: 'DRV-3' },
        { id: 'AMB-004', plateNumber: 'DL-03-MM-1122', type: 'Neonatal', status: 'Maintenance', location: { lat: 28.63, lng: 77.22 }, heading: 270, fuelLevel: 20, speed: 0, driverId: 'DRV-4' },
        { id: 'AMB-005', plateNumber: 'DL-04-QQ-3344', type: 'BLS', status: 'Available', location: { lat: 28.59, lng: 77.18 }, heading: 90, fuelLevel: 75, speed: 0, driverId: 'DRV-5' }
    ]);

    const [drivers, setDrivers] = useState<Driver[]>([
        { id: 'DRV-1', name: 'Ramesh Singh', contact: '9876543210', status: 'Available', rating: 4.8 },
        { id: 'DRV-2', name: 'Suresh Kumar', contact: '9876543211', status: 'On Trip', rating: 4.5 },
        { id: 'DRV-3', name: 'Amit Patel', contact: '9876543212', status: 'Available', rating: 4.9 },
        { id: 'DRV-4', name: 'Vijay Malhotra', contact: '9876543213', status: 'Break', rating: 4.2 },
        { id: 'DRV-5', name: 'Rajesh Khanna', contact: '9876543214', status: 'Available', rating: 4.7 }
    ]);

    const [activeJobs, setActiveJobs] = useState<DispatchJob[]>([
        { id: 'JOB-101', patientLocation: { lat: 28.625, lng: 77.215, address: 'Connaught Place, Block B' }, severity: 'High', status: 'En Route', timestamp: new Date(), description: 'Chest Pain, Male 55', assignedAmbulanceId: 'AMB-002', eta: '5 min' }
    ]);

    // Simulate GPS Movement & Driver Fatigue
    useEffect(() => {
        const interval = setInterval(() => {
            setAmbulances(prev => prev.map(amb => {
                // If moving (On Duty or Dispatched), update location
                if (amb.status === 'Dispatched' || (amb.status === 'On Duty' && amb.speed > 0)) {
                    // Smoother random movement
                    const deltaLat = (Math.random() - 0.5) * 0.0005;
                    const deltaLng = (Math.random() - 0.5) * 0.0005;
                    
                    // Calculate heading based on movement vector
                    const heading = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);

                    return {
                        ...amb,
                        location: {
                            lat: amb.location.lat + deltaLat,
                            lng: amb.location.lng + deltaLng
                        },
                        heading: heading, 
                        speed: Math.random() * 40 + 20, // Random speed between 20-60
                        fuelLevel: Math.max(0, amb.fuelLevel - 0.02) // Burn fuel slowly
                    };
                }
                return { ...amb, speed: 0 };
            }));

            // Simulate Driver Fatigue (Rating fluctuation)
            if (Math.random() > 0.8) {
                setDrivers(prev => prev.map(d => {
                    if (d.status === 'On Trip') {
                        return { ...d, rating: Math.max(3.5, d.rating - 0.01) };
                    }
                    return d;
                }));
            }

        }, 1000); // Update every second for smoother animation

        return () => clearInterval(interval);
    }, []);

    const dispatchAmbulance = (job: DispatchJob, ambulanceId: string) => {
        setAmbulances(prev => prev.map(a => a.id === ambulanceId ? { ...a, status: 'Dispatched', currentJobId: job.id } : a));
        setActiveJobs(prev => [...prev, { ...job, assignedAmbulanceId: ambulanceId, status: 'En Route' }]);
        
        // Update driver status
        const amb = ambulances.find(a => a.id === ambulanceId);
        if (amb) {
            setDrivers(prev => prev.map(d => d.id === amb.driverId ? { ...d, status: 'On Trip' } : d));
        }
    };

    const addJob = (job: DispatchJob) => {
        setActiveJobs(prev => [job, ...prev]);
    };

    return (
        <FleetContext.Provider value={{ ambulances, drivers, activeJobs, dispatchAmbulance, addJob }}>
            {children}
        </FleetContext.Provider>
    );
};

export const useFleet = () => {
    const context = useContext(FleetContext);
    if (context === undefined) {
        throw new Error('useFleet must be used within a FleetProvider');
    }
    return context;
};
