
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { MapPage } from './pages/MapPage';
import { HealthAssistant } from './pages/HealthAssistant';
import { IoTMonitor } from './pages/IoTMonitor';
import { EmergencySOS } from './pages/EmergencySOS';
import { MedicalTracker, InsuranceTracker, MassAlerts, SettingsPage, CommunityPage } from './pages/SecondaryPages';
import { StaffManagement, BedAllocation, Pharmacy, Appointments } from './pages/AdminModules';
import { AmbulanceCommand } from './pages/AmbulanceCommand';
import { HealthChat } from './pages/HealthChat';
import { MedicalIntelligence } from './pages/MedicalIntelligence';
import { Auth } from './pages/Auth';
import { Page, UserRole } from './types';
import { Card, CardContent } from './components/Common';
import { HospitalProvider } from './contexts/HospitalContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { AgentProvider } from './contexts/AgentContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { FleetProvider } from './contexts/FleetContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, login, logout } = useUser();
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Reset page on login based on role
  useEffect(() => {
    if (isAuthenticated && user) {
      setCurrentPage(user.role === 'admin' ? Page.ADMIN_DASHBOARD : Page.DASHBOARD);
    }
  }, [isAuthenticated, user]);


  const renderPage = () => {
    // ADMIN ROUTES
    if (user?.role === 'admin') {
        switch (currentPage) {
            case Page.ADMIN_DASHBOARD: return <HospitalDashboard onNavigate={setCurrentPage} />;
            case Page.AMBULANCE_COMMAND: return <AmbulanceCommand />;
            case Page.STAFF_MANAGEMENT: return <StaffManagement />;
            case Page.BED_ALLOCATION: return <BedAllocation />;
            case Page.PHARMACY: return <Pharmacy />;
            case Page.APPOINTMENTS: return <Appointments />;
            case Page.SETTINGS: return <SettingsPage theme={theme} onToggleTheme={toggleTheme} />;
            default: return <HospitalDashboard onNavigate={setCurrentPage} />;
        }
    }

    // PATIENT ROUTES
    switch (currentPage) {
      case Page.DASHBOARD: return <Dashboard />;
      case Page.MAP: return <MapPage />;
      case Page.CHAT: return <HealthAssistant />;
      case Page.HEALTH_CHAT: return <HealthChat />;
      case Page.IOT_MONITOR: return <IoTMonitor />;
      case Page.SOS: return <EmergencySOS />;
      case Page.MEDICAL_TRACKER: return <MedicalTracker />;
      case Page.INSURANCE: return <InsuranceTracker />;
      case Page.MEDICAL_INTELLIGENCE: return <MedicalIntelligence />;
      case Page.ALERTS: return <MassAlerts />;
      case Page.SETTINGS: return <SettingsPage theme={theme} onToggleTheme={toggleTheme} />;
      case Page.COMMUNITY: return <CommunityPage />;
      default: return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <NotificationProvider>
        <AgentProvider userRole={user?.role || 'patient'}>
            <HospitalProvider>
                <FleetProvider>
                    <Layout 
                        currentPage={currentPage} 
                        onNavigate={setCurrentPage} 
                        userRole={user?.role || 'patient'}
                        onLogout={logout}
                    >
                    {renderPage()}
                    </Layout>
                </FleetProvider>
            </HospitalProvider>
        </AgentProvider>
    </NotificationProvider>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
